async function getagenda() {
    const browser = await puppeteer.launch({
        headless: "new",
    });

    const page = await browser.newPage();
    const url = "https://footorne.fff.fr/recherche-clubs?subtab=agenda&tab=resultats&scl=192049";
    await page.goto(url);

    const matchDetails = await page.evaluate(() => {
        const details = {};

        const confrontationElement = document.querySelector('.confrontation');
        if (confrontationElement) {
            const dateElement = confrontationElement.querySelector('.date');
            const competitionText = dateElement.querySelector('.competition').textContent.trim();
            const dateText = dateElement.childNodes[2].nodeValue.trim(); // Récupère le texte après le span de la compétition

            details.competition = competitionText;
            details.date = dateText;

            const equipe1Element = confrontationElement.querySelector('.equipe1 .name');
            const equipe2Element = confrontationElement.querySelector('.equipe2 .name');
            const scoreElement = confrontationElement.querySelector('.score_match');

            if (equipe1Element && equipe2Element && scoreElement) {
                details.equipe1 = equipe1Element.textContent.trim();
                details.equipe2 = equipe2Element.textContent.trim();

                const scoreText = scoreElement.textContent.trim();
                const [scoreEquipe1, scoreEquipe2] = scoreText.split('-').map(item => item.trim());

                details.scoreEquipe1 = scoreEquipe1;
                details.scoreEquipe2 = scoreEquipe2;
            }
        }

        return details;
    });

    await browser.close();

    console.log('Prochain match:', matchDetails);
}

async function getresultat() {
    const browser = await puppeteer.launch({
        headless: "new",
    });

    const page = await browser.newPage();
    const url = "https://footorne.fff.fr/recherche-clubs?subtab=resultats&tab=resultats&scl=192049&beginWeek=2023-11-27&endWeek=2023-12-03";
    await page.goto(url);

    const matchresultatDetails = await page.evaluate(() => {
        const details = {};

        const confrontationElement = document.querySelector('.confrontation');
        if (confrontationElement) {
            const dateElement = confrontationElement.querySelector('.date');
            const competitionText = dateElement.querySelector('.competition').textContent.trim();
            const dateText = dateElement.childNodes[2].nodeValue.trim(); // Récupère le texte après le span de la compétition

            details.competition = competitionText;
            details.date = dateText;

            const equipe1Element = confrontationElement.querySelector('.equipe1 .name');
            const equipe2Element = confrontationElement.querySelector('.equipe2 .name');
            const scoreElement = confrontationElement.querySelector('.score_match');

            if (equipe1Element && equipe2Element && scoreElement) {
                details.equipe1 = equipe1Element.textContent.trim();
                details.equipe2 = equipe2Element.textContent.trim();

                const scoreText = scoreElement.textContent.trim();
                const [scoreEquipe1, scoreEquipe2] = scoreText.split('-').map(item => item.trim());

                details.scoreEquipe1 = scoreEquipe1;
                details.scoreEquipe2 = scoreEquipe2;
            }
        }

        return details;
    });

    await browser.close();

    console.log('résultat:', matchresultatDetails);
}
async function getTeam2Data() {
    const browser = await puppeteer.launch({
        headless: "new",
    });

    const page = await browser.newPage();
    const url = "https://footorne.fff.fr/recherche-clubs?subtab=ranking&tab=resultats&scl=192049&beginWeek=2024-01-08&endWeek=2024-01-14&competition=414007&stage=1&group=2&label=Départemental%203";
    await page.goto(url);

    const equipe2Data = await page.evaluate(() => {
        const team2Data = [];
        const rows = document.querySelectorAll('table.ranking-tab tbody tr');

        rows.forEach((row, index) => {
            if (index !== 0) {  // Ignore la première ligne
                const name2Element = row.querySelector('td.ranking-tab-bold');
                const pts2Element = row.querySelector('td.ranking-tab-bold + td');
                const jour2Element = row.querySelector('td.ranking-tab-content:nth-child(4)');
                const victoire2Element = row.querySelector('td.ranking-tab-content:nth-child(5)');
                const nul2Element = row.querySelector('td.ranking-tab-content:nth-child(6)');
                const defaite2Element = row.querySelector('td.ranking-tab-content:nth-child(7)');
                const forfait2Element = row.querySelector('td.ranking-tab-content:nth-child(8)');
                const bp2Element = row.querySelector('td.ranking-tab-content:nth-child(9)');
                const bc2Element = row.querySelector('td.ranking-tab-content:nth-child(10)');
                const penaliter2Element = row.querySelector('td.ranking-tab-content:nth-child(11)');
                const dif2Element = row.querySelector('td.ranking-tab-content:nth-child(12)');

                // Vérification que les éléments existent avant d'accéder à innerText
                const name2 = name2Element ? name2Element.innerText.trim() : '';
                const pts2 = pts2Element ? pts2Element.innerText.trim() : '';
                const jour2 = jour2Element ? jour2Element.innerText.trim() : '';
                const victoire2 = victoire2Element ? victoire2Element.innerText.trim() : '';
                const nul2 = nul2Element ? nul2Element.innerText.trim() : '';
                const defaite2 = defaite2Element ? defaite2Element.innerText.trim() : '';
                const forfait2 = forfait2Element ? forfait2Element.innerText.trim() : '';
                const bp2 = bp2Element ? bp2Element.innerText.trim() : '';
                const bc2 = bc2Element ? bc2Element.innerText.trim() : '';
                const penaliter2 = penaliter2Element ? penaliter2Element.innerText.trim() : '';
                const dif2 = dif2Element ? dif2Element.innerText.trim() : '';

                team2Data.push({ name2, pts2, jour2, victoire2, nul2, defaite2, forfait2, bp2, bc2, penaliter2, dif2 });
            }
        });
        return team2Data;
    });

    await browser.close();

    console.log('Classement de l\'équipe b :', equipe2Data);
}

getTeam2Data();
getresultat();
/* getagenda(); */

/*

document.addEventListener("DOMContentLoaded", async function () {
    // Exécuter des opérations au chargement de la page
    await runPuppeteerScript();
});

async function runPuppeteerScript() {
    const puppeteer = require('puppeteer');
    const fs = require('fs');
    const path = require('path');

    const browser = await puppeteer.launch({
        headless: "new",
    });

    const page = await browser.newPage();
    const url = "https://footorne.fff.fr/recherche-clubs?subtab=ranking&tab=resultats&scl=192049&beginWeek=2024-01-08&endWeek=2024-01-14&competition=414009&stage=1&group=3&label=Départemental%204";
    await page.goto(url);

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

    // Charger le fichier HTML
    const htmlPath = path.join(__dirname, '../public/classement_calendrier.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // Ajouter les données au tableau
    const updatedHtml = htmlContent.replace('<!-- Les données de l\'équipe seront ajoutées ici -->', generateTableRows(equipeData));

    // Sauvegarder le fichier HTML mis à jour
    fs.writeFileSync(htmlPath, updatedHtml);

    console.log('Classement de l\'équipe ajouté au fichier HTML.');
}

// Fonction pour générer les lignes du tableau HTML
function generateTableRows(data) {
    return data.map(entry => `
        <tr>
            <td>${entry.name}</td>
            <td>${entry.pts}</td>
            <td>${entry.jour}</td>
            <td>${entry.victoire}</td>
            <td>${entry.nul}</td>
            <td>${entry.defaite}</td>
            <td>${entry.forfait}</td>
            <td>${entry.bp}</td>
            <td>${entry.bc}</td>
            <td>${entry.penaliter}</td>
            <td>${entry.dif}</td>
        </tr>
    `).join('');
} */
