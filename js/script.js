// script.js
document.addEventListener('DOMContentLoaded', function () {
    // Charger le contenu commun
    fetch('header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('header-container').innerHTML = html;

            // Initialiser le bouton à l'intérieur de la promesse
            let navigation = document.querySelector('.navigation');
            let toggleButton = document.querySelector('.toggle');
            let hasClicked = false;

            if (navigation && toggleButton) {
                toggleButton.addEventListener('click', function () {
                    if (!hasClicked) {
                        // Premier clic, changer le statut hasClicked
                        hasClicked = true;
                    } else {
                        // Toggle l'état actif
                        toggleButton.classList.toggle('active');
                        navigation.classList.toggle('active');
                    }
                });
            }

            // Vérifiez la largeur de l'écran pour changer le texte du titre
            var divElement = document.querySelector('.titre');

            function checkScreenWidth() {
                var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                var nouveauTexte = screenWidth < 425 ? 'ASMA' : 'AS Monts D\'Andaine';

                // Changez le texte du titre
                divElement.textContent = nouveauTexte;
            }

            // Appelez la fonction au chargement de la page et lorsqu'on redimensionne la fenêtre
            checkScreenWidth();
            window.addEventListener('resize', checkScreenWidth);
        });
});