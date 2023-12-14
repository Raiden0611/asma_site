// Récupérer les éléments DOM
var menuToggle = document.getElementById('menu-toggle');
var navigation = document.querySelector('.nav');

// Ajouter un gestionnaire d'événements au bouton de bascule du menu
menuToggle.addEventListener('click', function () {
    // Basculer la visibilité du menu de navigation
    navigation.style.display = (navigation.style.display === 'none' || navigation.style.display === '') ? 'flex' : 'none';
});

// Ajouter un gestionnaire d'événements pour masquer le menu lorsqu'un lien est cliqué (pour les écrans plus petits)
var navLinks = document.querySelectorAll('.lien');
navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        if (window.innerWidth <= 1200) {
            navigation.style.display = 'none';
        }
    });
});

// Ajouter un gestionnaire d'événements pour masquer le menu lorsqu'on redimensionne l'écran
window.addEventListener('resize', function () {
    if (window.innerWidth > 1200) {
        navigation.style.display = 'flex';
    }
});

// Récupérer les éléments DOM
var menuToggle = document.getElementById('menu-toggle');
var navigation = document.querySelector('.nav');

// Ajouter un gestionnaire d'événements au bouton de bascule du menu
menuToggle.addEventListener('click', function () {
    // Basculer la classe active pour afficher ou masquer le menu déroulant
    navigation.classList.toggle('active');
});

