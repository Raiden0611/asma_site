document.addEventListener('DOMContentLoaded', function () {


    // Sélectionnez toutes la cartes
    const containers = document.querySelectorAll('.container-carte-president');
    containers.forEach(container => {
        // Sélectionnez la carte dos et la carte 
        const dos = container.querySelector('.container-carte-dos');
        const president = container.querySelector('.container-contact-president');
        dos.style.display = 'flex';
        president.style.display = 'none';
    });


    containers.forEach(container => {
        // Sélectionnez la carte dos et la carte 
        const dos = container.querySelector('.container-carte-dos');
        const president = container.querySelector('.container-contact-president');

        // Ajoutez un gestionnaire d'événement 
        container.addEventListener('click', () => {
            // Vérifiez si la classe .flipped est présente sur la carte dos
            const display = dos.style.display;
            dos.style.display = 'flex';

            // Si la carte dos est déjà retournée, enlevez la classe .flipped pour la remettre à sa position initiale
            if (display === 'flex') {
                dos.style.display = 'none';
                president.style.display = 'flex';
            } else {
                dos.style.display = 'flex';
                president.style.display = 'none';
            }
        }
        );
    })
});


