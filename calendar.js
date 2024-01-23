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
    const browser = await puppeteer.launch({ headless: "new" });
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

            let championnat = '';
            let date = '';

            const parties = groupdate.split('\n\n');

            if (parties.length === 2) {
                championnat = parties[0];
                date = parties[1];

                championnat = championnat.replace(/\n/g, ' ');

                date = date.replace('-', '');
                date = date.replace('  ', ' ');
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

            timetableData.push({ championnat, date, timetable1, timetable2, score1, score2 });
        });
        return timetableData;
    });
    await browser.close();
    // Ajoutez le console.log ici
    /* const updatedHtmlContent = `<tbody id="timetableTableBody">${generateTableRows(calendarData)}</tbody>`; */
    /*  console.log(updatedHtmlContent); */

    /* return calendarData; */
    console.log(calendarData, calendarData.length, calendarData[0].championnat, calendarData[0].date, calendarData[0].timetable1, calendarData[0].timetable2, calendarData[0].score1, calendarData[0].score2);
    let id_team_home = '';
    let id_team_away = '';
    let match_type_id = '';

    for (let i = 0; i < calendarData.length; i++) {

        const team1 = `SELECT t.id as team_id, m.id as match_type_id FROM team t INNER JOIN match_type m on t.match_type = m.id WHERE t.name = '${calendarData[i].timetable1}' AND m.name = '${calendarData[0].championnat}'`;
        conn.query(team1, (err, result) => {
            if (err) throw err;
            id_team_home = result[0]?.team_id;
            console.log(id_team_home);
        });

        const team2 = `SELECT t.id as team_id, m.id as match_type_id FROM team t INNER JOIN match_type m on t.match_type = m.id WHERE t.name = '${calendarData[i].timetable2}' AND m.name = '${calendarData[0].championnat}'`;
        conn.query(team2, (err, result) => {
            if (err) throw err;
            id_team_away = result[0]?.team_id;
            match_type_id = result[1]?.match_type_id;
            console.log(id_team_away);
            console.log(match_type_id);
        });

        /* const sql = `INSERT INTO calendar (id_team_home, id_team_away, id_match_type, date, score_home_team, score_away_team ) VALUES ('${id_team_home}', '${id_team_away}', '${match_type_id}', '${calendarData[i]?.date}', '${calendarData[i]?.score1}', '${calendarData[i]?.score2}')`;
        conn.query(sql, (err, result) => {
            if (err) throw err;
            console.log(`Valeur insérée : ${id_team_home}, ${id_team_away}, ${match_type_id}, ${calendarData[i]?.date}, ${calendarData[i]?.score1}, ${calendarData[i]?.score2})`);

            // Vérifiez s'il s'agit de la dernière itération, puis fermez la connexion
            if (i === calendarData.length) {
                conn.end();
            }
        }); */
    }
}

/* module.exports = { scrapAndSaveDataCalendar, generateTableRows }; */


/* equipe b */
const link = "https://footorne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=192049&competition=414009&stage=1&group=3&label=Départemental%204%20POULE%20C"

/* equipe a */
/* link = "https://footorne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=192049&competition=414007&stage=1&group=2&label=Départemental%203%20POULE%20B" */

scrapAndSaveDataCalendar(link);


