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
    console.log(equipeData[i]?.name);
    console.log(equipeData[i + 1]?.name);

    /* changer tout les i +1 car cela ne prend pas le premier du coup */



    for (let i = 0; i < equipeData.length; i++) {
        const selectsql = `SELECT t.id as team_id, m.id as match_type_id FROM team t INNER JOIN match_type m on t.match_type = m.id WHERE t.name = '${equipeData[i]?.name}' AND m.name = '${championnat}'`;

        conn.query(selectsql, (err, result) => {
            if (err) throw err;

            if (result && result[0]) {  // Vérifie si result est défini et a au moins un élément

                const verify = `SELECT * FROM ranking r INNER JOIN  team t on r.id_team = t.id WHERE t.name = '${equipeData[i]?.name}' AND r.id_match_type = '${result[i]?.match_type_id}'`; // Vérifie si l'equipe existe deja dans le classement
                conn.query(verify, (err, verifyresult) => {
                    if (err) throw err;
                    if (verifyresult && verifyresult[0]) {
                        console.log("1 : verify", JSON.stringify(verifyresult[1]), "result :", + JSON.stringify(result[0].team_id) + "\n" + "2 :", JSON.stringify(verifyresult[2]), + "result :", JSON.stringify(result[0].match_type_id) + "\n" + "3 :", JSON.stringify(verifyresult[3]), + "result :", JSON.stringify(equipeData[i]?.pts) + "\n" + "4 :", JSON.stringify(verifyresult[4]), + "result :", JSON.stringify(equipeData[i]?.jour) + "\n" + "5 :", JSON.stringify(verifyresult[5]), + "result :", JSON.stringify(equipeData[i]?.victoire) + "\n" + "6 :", JSON.stringify(verifyresult[6]), + "result :", JSON.stringify(equipeData[i]?.nul) + "\n" + "7 :", JSON.stringify(verifyresult[7]), + "result :", JSON.stringify(equipeData[i]?.defaite) + "\n" + "8 :", JSON.stringify(verifyresult[8]), + "result :", JSON.stringify(equipeData[i]?.forfait) + "\n" + "9 :", JSON.stringify(verifyresult[9]), + "result :", JSON.stringify(equipeData[i]?.bp) + "\n" + "10 :", JSON.stringify(verifyresult[10]), + "result :", JSON.stringify(equipeData[i]?.bc) + "\n" + "11 :", JSON.stringify(verifyresult[11]), + "result :", JSON.stringify(equipeData[i]?.penaliter) + "\n" + "12 :", JSON.stringify(verifyresult[12]), + "result :", JSON.stringify(equipeData[i]?.dif) + "\n" + "13 :", JSON.stringify(verifyresult[13]), + "result :", JSON.stringify(equipeData[i]?.name) + "\n" + "14 :", JSON.stringify(verifyresult[14]), + "result :", JSON.stringify(equipeData[i]?.name));
                        /* 1 : verify undefined result : 41
                            2 : undefined NaN 4
                            3 : undefined NaN "16"
                            4 : undefined NaN "6"
                            5 : undefined NaN "5"
                            6 : undefined NaN "1"
                            7 : undefined NaN "0"
                            8 : undefined NaN "0"
                            9 : undefined NaN "42"
                            10 : undefined NaN "6"
                            11 : undefined NaN "0"
                            12 : undefined NaN "36"
                            13 : undefined NaN "OC BRIOUZE 2"
                            14 : undefined NaN "OC BRIOUZE 2" */


                        console.log("existe deja");
                        if (JSON.stringify(verifyresult[1]) === JSON.stringify(result[0].team_id) &&
                            JSON.stringify(verifyresult[2]) === JSON.stringify(result[1].teamData) &&
                            JSON.stringify(verifyresult[3]) === JSON.stringify(equipeData[i]?.pts) &&
                            JSON.stringify(verifyresult[4]) === JSON.stringify(equipeData[i]?.jour) &&
                            JSON.stringify(verifyresult[5]) === JSON.stringify(equipeData[i]?.victoire) &&
                            JSON.stringify(verifyresult[6]) === JSON.stringify(equipeData[i]?.nul) &&
                            JSON.stringify(verifyresult[7]) === JSON.stringify(equipeData[i]?.defaite) &&
                            JSON.stringify(verifyresult[8]) === JSON.stringify(equipeData[i]?.forfait) &&
                            JSON.stringify(verifyresult[9]) === JSON.stringify(equipeData[i]?.bp) &&
                            JSON.stringify(verifyresult[10]) === JSON.stringify(equipeData[i]?.bc) &&
                            JSON.stringify(verifyresult[11]) === JSON.stringify(equipeData[i]?.penaliter) &&
                            JSON.stringify(verifyresult[12]) === JSON.stringify(equipeData[i]?.dif) &&
                            JSON.stringify(verifyresult[14]) === JSON.stringify(equipeData[i]?.name)) // verifier si les valeurs sont les memes
                        {
                            console.log("rien n'a changer les valeurs sont les memes");
                            if (i === equipeData.length - 1) {
                                // Si c'est la dernière itération, fermez la connexion ici
                                conn.end();
                            }
                        } else {
                            console.log("les valeurs ont changer");
                            const updateRanking = `UPDATE ranking SET points = '${equipeData[i]?.pts}', match_played = '${equipeData[i]?.jour}', victory = '${equipeData[i]?.victoire}', draw = '${equipeData[i]?.nul}', defeat = '${equipeData[i]?.defaite}', forfait = '${equipeData[i]?.forfait}', goal_scored = '${equipeData[i]?.bp}', goal_conceded = '${equipeData[i]?.bc}', penalties = '${equipeData[i]?.penaliter}', goal_difference = '${equipeData[i]?.dif}' WHERE id_team = '${result[0]?.team_id}' AND id_match_type = '${result[0]?.match_type_id}'`
                            conn.query(updateRanking, (err, result) => {
                                if (err) throw err;
                                console.log(`Valeur qu'on à Update : ${equipeData[i]?.name}, ${equipeData[i]?.pts}, ${equipeData[i]?.jour}, ${equipeData[i]?.victoire}, ${equipeData[i]?.nul}, ${equipeData[i]?.defaite}, ${equipeData[i]?.forfait}, ${equipeData[i]?.bp}, ${equipeData[i]?.bc}, ${equipeData[i]?.penaliter}, ${equipeData[i]?.dif}`);
                                if (i === equipeData.length - 1) {
                                    // Si c'est la dernière itération, fermez la connexion ici
                                    conn.end();
                                }
                            });
                        }
                    } else {
                        console.log("n'existe pas");
                        const insertInRanking = `INSERT INTO ranking (id_team, id_match_type, points, match_played, victory, draw, defeat, forfait, goal_scored, goal_conceded, penalties, goal_difference) VALUES ('${result[0]?.team_id}', '${result[0]?.match_type_id}', '${equipeData[i]?.pts}', '${equipeData[i]?.jour}', '${equipeData[i]?.victoire}', '${equipeData[i]?.nul}', '${equipeData[i]?.defaite}', '${equipeData[i]?.forfait}', '${equipeData[i]?.bp}', '${equipeData[i]?.bc}', '${equipeData[i]?.penaliter}', '${equipeData[i]?.dif}')`
                        conn.query(insertInRanking, (err, result) => {
                            if (err) throw err;
                            console.log(`Valeur insérée : ${equipeData[i]?.name}, ${equipeData[i]?.pts}, ${equipeData[i]?.jour}, ${equipeData[i]?.victoire}, ${equipeData[i]?.nul}, ${equipeData[i]?.defaite}, ${equipeData[i]?.forfait}, ${equipeData[i]?.bp}, ${equipeData[i]?.bc}, ${equipeData[i]?.penaliter}, ${equipeData[i]?.dif}`);
                            if (i === equipeData.length - 1) {
                                // Si c'est la dernière itération, fermez la connexion ici
                                conn.end();
                            }
                        });
                    }
                });
            } else {
                console.error('Aucune équipe trouvée pour le nom :', equipeData[i]?.name + " et pour le championnat : " + championnat);
                // Gérer le cas où aucun résultat n'est trouvé (peut-être log, afficher un message, etc.)
                if (i === equipeData.length - 1) {
                    // Si c'est la dernière itération, fermez la connexion ici
                    conn.end();
                }
            }
        });
    }
}
/* equipe b */

link = "https://footorne.fff.fr/competitions?tab=ranking&id=414009&phase=1&poule=3&type=ch"
championnat = "Départemental 4 Poule C"

/* equipe a */
/* link = "https://footorne.fff.fr/competitions?tab=ranking&id=414007&phase=1&poule=2&type=ch"
championnat = "Départemental 3 Poule B" */


scrapAndSaveData(link, championnat);
/* module.exports = { scrapAndSaveData }; */





// changer la recuperation du titre du championnant et de la division
// faire en sorte que le classement soit mis à jour automatiquement et que le classement soit affiché sur la page classement_calendrier.html

