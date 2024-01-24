const puppeteer = require('puppeteer');
const mysql = require('mysql');
require('dotenv').config();

const conn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PWD,
    database: process.env.MYSQL_DB,
});

conn.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        throw err;
    }
    console.log('Connecté à la base de données MySQL');
});

async function scrapAndSaveData(link, championnat) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(link);

    const equipeData = await page.evaluate(() => {
        const teamData = [];

        const rows = document.querySelectorAll('table.ranking-tab tbody tr');

        rows.forEach((row, index) => {
            if (index !== 0) {  // Ignore la première ligne
                const nameElement = row.querySelector('td.ranking-tab-bold');
                const ptsElement = row.querySelector('td.ranking-tab-bold + td');
                const jourElement = row.querySelector('td.ranking-tab-content:nth-child(4)');
                const victoireElement = row.querySelector('td.ranking-tab-content:nth-child(5)');
                const nulElement = row.querySelector('td.ranking-tab-content:nth-child(6)');
                const defaiteElement = row.querySelector('td.ranking-tab-content:nth-child(7)');
                const forfaitElement = row.querySelector('td.ranking-tab-content:nth-child(8)');
                const bpElement = row.querySelector('td.ranking-tab-content:nth-child(9)');
                const bcElement = row.querySelector('td.ranking-tab-content:nth-child(10)');
                const penaliterElement = row.querySelector('td.ranking-tab-content:nth-child(11)');
                const difElement = row.querySelector('td.ranking-tab-content:nth-child(12)');

                // Vérification que les éléments existent avant d'accéder à innerText
                const name = nameElement ? nameElement.innerText.trim() : '';
                const pts = ptsElement ? ptsElement.innerText.trim() : '';
                const jour = jourElement ? jourElement.innerText.trim() : '';
                const victoire = victoireElement ? victoireElement.innerText.trim() : '';
                const nul = nulElement ? nulElement.innerText.trim() : '';
                const defaite = defaiteElement ? defaiteElement.innerText.trim() : '';
                const forfait = forfaitElement ? forfaitElement.innerText.trim() : '';
                const bp = bpElement ? bpElement.innerText.trim() : '';
                const bc = bcElement ? bcElement.innerText.trim() : '';
                const penaliter = penaliterElement ? penaliterElement.innerText.trim() : '';
                const dif = difElement ? difElement.innerText.trim() : '';

                teamData.push({ name, pts, jour, victoire, nul, defaite, forfait, bp, bc, penaliter, dif });
            }
        });
        return teamData;
    });
    await browser.close();


    console.log(equipeData, equipeData.length, equipeData[1]?.name, equipeData[2]?.name);
    let i = 0;
    console.log(equipeData[i + 1]?.name);



    for (let i = 0; i < equipeData.length; i++) {
        const selectsql = `SELECT t.id as team_id, m.id as match_type_id FROM team t INNER JOIN match_type m on t.match_type = m.id WHERE t.name = '${equipeData[i + 1]?.name}' AND m.name = '${championnat}'`;

        conn.query(selectsql, (err, result) => {
            if (err) throw err;

            if (result && result[0]) {  // Vérifie si result est défini et a au moins un élément
                const sql = `INSERT INTO ranking (id_team, id_match_type, points, match_played, victory, draw, defeat, forfait, goal_scored, goal_conceded, penalties, goal_difference) VALUES ('${result[0]?.team_id}', '${result[0]?.match_type_id}', '${equipeData[i + 1]?.pts}', '${equipeData[i + 1]?.jour}', '${equipeData[i + 1]?.victoire}', '${equipeData[i + 1]?.nul}', '${equipeData[i + 1]?.defaite}', '${equipeData[i + 1]?.forfait}', '${equipeData[i + 1]?.bp}', '${equipeData[i + 1]?.bc}', '${equipeData[i + 1]?.penaliter}', '${equipeData[i + 1]?.dif}')`;

                conn.query(sql, (err, result) => {
                    if (err) throw err;
                    console.log(`Valeur insérée : ${equipeData[i + 1]?.name}, ${equipeData[i + 1]?.pts}, ${equipeData[i + 1]?.jour}, ${equipeData[i + 1]?.victoire}, ${equipeData[i + 1]?.nul}, ${equipeData[i + 1]?.defaite}, ${equipeData[i + 1]?.forfait}, ${equipeData[i + 1]?.bp}, ${equipeData[i + 1]?.bc}, ${equipeData[i + 1]?.penaliter}, ${equipeData[i + 1]?.dif}`);

                    // Vérifiez s'il s'agit de la dernière itération, puis fermez la connexion
                    if (i === equipeData.length - 1) {
                        conn.end();
                    }
                });
            } else {
                console.error('Aucun résultat trouvé pour la requête.');
                // Gérer le cas où aucun résultat n'est trouvé (peut-être log, afficher un message, etc.)
            }
        });
    }
}
/* equipe b */

/* link = "https://footorne.fff.fr/competitions?tab=ranking&id=414009&phase=1&poule=3&type=ch"
championnat = "Départemental 4 Poule B" */

/* equipe a */
link = "https://footorne.fff.fr/competitions?tab=ranking&id=414007&phase=1&poule=2&type=ch"
championnat = "Départemental 3 Poule C"


scrapAndSaveData(link, championnat);
/* module.exports = { scrapAndSaveData }; */





// changer la recuperation du titre du championnant et de la division
// faire en sorte que le classement soit mis à jour automatiquement et que le classement soit affiché sur la page classement_calendrier.html

