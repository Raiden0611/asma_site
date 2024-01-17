const express = require('express'); // Importer le module 'express'
const path = require('path');  // Importer le module 'path'
const fs = require('fs');  // Importer le module 'fs'
const { scrapAndSaveData, generateTableRows } = require('./classement'); // Importer les fonctions du fichier classement.js


const server = express();
const port = 3000;

// Middleware pour servir les fichiers statiques depuis le dossier 'public'
server.use(express.static('public'));

// Définir une route pour l'API qui renvoie le fichier contact.html
server.get('/contact', (req, res) => {
  // Utilisez path.join pour obtenir le chemin complet du fichier
  const filePath = path.join(__dirname, 'public', 'contact.html');
  res.sendFile(filePath);
});


server.get('/classement', async (req, res) => {
  try {
    const equipeData = await scrapAndSaveData();

    // Chargez le fichier HTML
    const filePath = path.join(__dirname, 'public', 'classement_calendrier.html');
    let htmlContent = fs.readFileSync(filePath, 'utf-8');

    // Ajoutez les données au tableau dans le fichier HTML
    htmlContent = htmlContent.replace('<tbody id="teamTableBody"></tbody>', `<tbody id="teamTableBody">${generateTableRows(equipeData)}</tbody>`);

    // Envoie le fichier HTML mis à jour en tant que réponse
    res.send(htmlContent);
  } catch (error) {
    console.error('Erreur lors du scraping et de la mise à jour du fichier HTML :', error);
    res.status(500).send(`Erreur interne du serveur : ${error.message}`);
  }
});



server.get('/', (req, res) => {
  // Utilisez path.join pour obtenir le chemin complet du fichier
  const filePath = path.join(__dirname, 'public', 'accueil.html');
  res.sendFile(filePath);
});
server.get('/actualites', (req, res) => {
  // Utilisez path.join pour obtenir le chemin complet du fichier
  const filePath = path.join(__dirname, 'public', 'actualites.html');
  res.sendFile(filePath);
});
server.get('/club', (req, res) => {
  // Utilisez path.join pour obtenir le chemin complet du fichier
  const filePath = path.join(__dirname, 'public', 'club.html');
  res.sendFile(filePath);
});

// Lancer le serveur sur le port spécifié
server.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});
