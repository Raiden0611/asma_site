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
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(link);
    console.log(link, championnat);

    const equipeData = await page.evaluate(() => {
        const teamData = [];
        const rows = document.querySelectorAll('table.ranking-tab tbody tr');

        rows.forEach((row, index) => {
            if (index !== 0) {  // Ignore la première ligne
                const nameElement = row.querySelector('td.ranking-tab-bold');


                // Vérification que les éléments existent avant d'accéder à innerText
                const name = nameElement ? nameElement.innerText.trim() : '';


                teamData.push({ name });
                console.log(name);
            }
        });
        return teamData;
    });
    await browser.close();

    console.log(equipeData, equipeData.length);
    for (let i = 0; i < equipeData.length; i++) {
        const sql = `INSERT INTO team (name, match_type) VALUES ('${equipeData[i].name}', ${championnat})`;
        conn.query(sql, (err, result) => {
            if (err) throw err;
            console.log(`Valeur insérée : ${equipeData[i].name}`);

        });
    }
    conn.end();
}

/* equipe a */
/* link = "https://footorne.fff.fr/competitions?tab=ranking&id=414007&phase=1&poule=2&type=ch" 
championnat = 3*/

/* equipe b */
link = "https://footorne.fff.fr/competitions?tab=ranking&id=414009&phase=1&poule=3&type=ch"
championnat = 4

scrapAndSaveData(/* "https://footorne.fff.fr/competitions?tab=ranking&id=414009&phase=1&poule=3&type=ch", 4 */ "https://footorne.fff.fr/competitions?tab=ranking&id=414007&phase=1&poule=2&type=ch", 3)
