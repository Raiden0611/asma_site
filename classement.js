const puppeteer = require('puppeteer');

async function scrapAndSaveData(link) {
    const browser = await puppeteer.launch({ headless: "new" });
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
    // Ajoutez le console.log ici
    const updatedHtmlContent = `<tbody id="teamTableBody">${generateTableRows(equipeData)}</tbody>`;
    console.log(updatedHtmlContent);

    return equipeData;
}

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
}

module.exports = { scrapAndSaveData, generateTableRows };
