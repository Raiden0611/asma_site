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

async function scrapAndSaveDataCalendar(link) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(link);

    const calendarData = await page.evaluate(() => {
        const timetableData = [];
        const rows = document.querySelectorAll('.result-display app-confrontation a');

        rows.forEach((row) => {
            const dateElement = row.querySelector('.confrontation .date');
            const timetable1Element = row.querySelector('.confrontation .equipe1 .name');
            const timetable2Element = row.querySelector('.confrontation .equipe2 .name');
            const scoreMatchElement = row.querySelector('.confrontation .score_match');

            // Vérification que les éléments existent avant d'accéder à innerText

            const groupdate = dateElement ? dateElement.innerText.trim() : '';
            const timetable1 = timetable1Element ? timetable1Element.innerText.trim() : '';
            const timetable2 = timetable2Element ? timetable2Element.innerText.trim() : '';


            let home_team = '';
            let away_team = '';

            home_team = timetable1.replace(/\s+/g, ' ');
            away_team = timetable2.replace(/\s+/g, ' ');


            let championnat = '';
            let date = '';

            const parties = groupdate.split('\n\n');

            if (parties.length === 2) {
                championnat = parties[0];
                date = parties[1];

                championnat = championnat.replace(/\n/g, ' ');

                date = date.replace('-', '');
                date = date.replace(/\s+/g, ' ');
                date = date.split(' ');

                const moisMap = {
                    'JANVIER': '01',
                    'FÉVRIER': '02',
                    'MARS': '03',
                    'AVRIL': '04',
                    'MAI': '05',
                    'JUIN': '06',
                    'JUILLET': '07',
                    'AOÛT': '08',
                    'SEPTEMBRE': '09',
                    'OCTOBRE': '10',
                    'NOVEMBRE': '11',
                    'DÉCEMBRE': '12'
                };
                const mois = moisMap[date[2]];
                date = date[3] + '-' + mois + '-' + date[1] + ' ' + date[4].replace('H', ':') + ':00';

            } else {
                championnat = 'Erreur';
                date = 'Erreur';
            }





            let score1 = '';
            let score2 = '';
            let score3 = '';

            // Vérifier les différents cas de score
            const scoreNumberElements = scoreMatchElement ? scoreMatchElement.querySelectorAll('.number') : null;

            if (scoreMatchElement && scoreMatchElement.querySelector('.noscore')) {
                // Cas 1: Reporté
                score1 = 'Reporté';
                score2 = 'Reporté';
            } else if (scoreNumberElements && scoreNumberElements.length > 0) {
                // Cas 2: Scores disponibles
                if (scoreNumberElements.length === 2) {
                    // Cas 2.1: Deux scores séparés par "-"
                    const regex = /\/(\d+)\.png$/;
                    const src_score1 = scoreNumberElements[0].getAttribute('src');
                    const src_score2 = scoreNumberElements[1].getAttribute('src');
                    if (src_score1 && src_score2) {

                        const score1Match = regex.exec(src_score1);
                        const score2Match = regex.exec(src_score2);
                        score1 = score1Match ? score1Match[1] : '';
                        score2 = score2Match ? score2Match[1] : '';
                    } else {
                        score1 = 'Aucun chiffre trouvé dans l\'URL de l\'image.';
                        score2 = 'Aucun chiffre trouvé dans l\'URL de l\'image.';
                    }

                } else if (scoreNumberElements.length === 3) {
                    // Cas 2.1: Deux scores séparés par "-" mais un des score est composé de deux chiffres
                    const regex = /\/(\d+)\.png$/;
                    const src_score1 = scoreNumberElements[0].getAttribute('src');
                    const src_score2 = scoreNumberElements[2].getAttribute('src');
                    const src_score3 = scoreNumberElements[1].getAttribute('src');
                    if (src_score1 && src_score2 && src_score3) {

                        const score1Match = regex.exec(src_score1);
                        const score2Match = regex.exec(src_score2);
                        const score3Match = regex.exec(src_score3);
                        score1 = score1Match + score3Match ? score1Match[1] + score3Match[1] : '';
                        score2 = score2Match ? score2Match[1] : '';
                        score3 = score3Match ? score3Match[1] : '';
                    } else {
                        score1 = 'Aucun chiffre trouvé dans l\'URL de l\'image.';
                        score2 = 'Aucun chiffre trouvé dans l\'URL de l\'image.';
                    }
                } else {
                    score1 = 'Nombre de chiffres incorrect.';
                    score2 = 'Nombre de chiffres incorrect.';
                }
            } else {
                // Cas 3: Autre cas
                score1 = '';
                score2 = '';
            }

            timetableData.push({ championnat, date, home_team, away_team, score1, score2 });
        });
        return timetableData;
    });
    await browser.close();
    // Ajoutez le console.log ici
    /* const updatedHtmlContent = `<tbody id="timetableTableBody">${generateTableRows(calendarData)}</tbody>`; */
    /*  console.log(updatedHtmlContent); */

    /* return calendarData; */
    console.log(calendarData, calendarData.length);


    let id_team_home = '';
    let id_team_away = '';
    let match_type_id = '';

    const team1Promises = calendarData.map(async (item) => {
        const team1Query = `SELECT t.id as team_id, m.id as match_type_id FROM team t INNER JOIN match_type m ON t.match_type = m.id WHERE t.name = '${item.home_team}' AND m.name = '${item.championnat}'`;
        return new Promise((resolve, reject) => {
            conn.query(team1Query, (err, result) => {
                if (err) reject(err);
                item.id_team_home = result[0]?.team_id;
                resolve(item);
            });
        });
    });

    const team2Promises = calendarData.map(async (item) => {
        const team2Query = `SELECT t.id as team_id, m.id as match_type_id FROM team t INNER JOIN match_type m ON t.match_type = m.id WHERE t.name = '${item.away_team}' AND m.name = '${item.championnat}'`;
        return new Promise((resolve, reject) => {
            conn.query(team2Query, (err, result) => {
                if (err) reject(err);
                item.id_team_away = result[0]?.team_id;
                item.match_type_id = result[0]?.match_type_id;
                resolve(item);
            });
        });
    });

    const team1Results = await Promise.all(team1Promises);
    const team2Results = await Promise.all(team2Promises);

    for (let i = 0; i < calendarData.length; i++) {
        // ... (votre code précédent)

        const sql = `INSERT INTO calendar (id_team_home, id_team_away, id_match_type, date, score_home_team, score_away_team) VALUES ('${calendarData[i].id_team_home}', '${calendarData[i].id_team_away}', '${calendarData[i].match_type_id}', '${calendarData[i]?.date}', '${calendarData[i]?.score1}', '${calendarData[i]?.score2}')`;
        conn.query(sql, (err, result) => {
            if (err) throw err;
            console.log(`Valeur insérée : ${calendarData[i].id_team_home}, ${calendarData[i].id_team_away}, ${calendarData[i].match_type_id}, ${calendarData[i]?.date}, ${calendarData[i]?.score1}, ${calendarData[i]?.score2}`);

            // Vérifiez s'il s'agit de la dernière itération, puis fermez la connexion
            if (i === calendarData.length - 1) {
                conn.end();
            }
        });
    }
}
/* module.exports = { scrapAndSaveDataCalendar, generateTableRows }; */


/* equipe b */
/* link = "https://footorne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=192049&competition=414009&stage=1&group=3&label=Départemental%204%20POULE%20C" */

/* equipe a */
/* link = "https://footorne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=192049&competition=414007&stage=1&group=2&label=Départemental%203%20POULE%20B" */

scrapAndSaveDataCalendar("https://footorne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=192049&competition=414007&stage=1&group=2&label=Départemental%203%20POULE%20B");


