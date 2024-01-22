const puppeteer = require('puppeteer');

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

            const date = dateElement ? dateElement.innerText.trim() : '';
            const timetable1 = timetable1Element ? timetable1Element.innerText.trim() : '';
            const timetable2 = timetable2Element ? timetable2Element.innerText.trim() : '';

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

            timetableData.push({ date, timetable1, timetable2, score1, score2 });
        });
        return timetableData;
    });
    await browser.close();
    // Ajoutez le console.log ici
    /* const updatedHtmlContent = `<tbody id="timetableTableBody">${generateTableRows(calendarData)}</tbody>`; */
    /*  console.log(updatedHtmlContent); */

    /* return calendarData; */
    console.log(calendarData);
}

/* module.exports = { scrapAndSaveDataCalendar, generateTableRows }; */


/* equipe b */
scrapAndSaveDataCalendar("https://footorne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=192049&competition=414009&stage=1&group=3&label=Départemental%204%20POULE%20C");

/* equipe a */
scrapAndSaveDataCalendar("https://footorne.fff.fr/recherche-clubs?subtab=calendar&tab=resultats&scl=192049&competition=414007&stage=1&group=2&label=Départemental%203%20POULE%20B");
