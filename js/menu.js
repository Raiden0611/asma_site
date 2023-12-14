document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.getElementById('menu-toggle');
    var navigation = document.querySelector('.nav');

    menuToggle.addEventListener('click', function () {
        navigation.classList.toggle('active');
    });

    var navLinks = document.querySelectorAll('.lien');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 1200) {
                navigation.classList.remove('active');
            }
        });
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 1200) {
            navigation.classList.add('active');
        }
    });
});
