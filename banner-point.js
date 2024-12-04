const bannerSlider = document.querySelector('.banner-slider');
const indicators = document.querySelectorAll('.indicator');
const images = document.querySelectorAll('.banner-slider img');
let currentIndex = 0;

// Fonction pour changer l'image en fonction de l'index
function updateBanner(index) {
  bannerSlider.style.transition = 'transform 1s ease-in-out'; // Ajout d'une transition
  bannerSlider.style.transform = `translateX(-${index * 1820}px)`; // Décalage de l'image

  // Mettre à jour les points de navigation
  indicators.forEach((indicator, i) => {
    if (i === index) {
      indicator.classList.add('active'); // Activer le point
    } else {
      indicator.classList.remove('active'); // Désactiver les autres
    }
  });
}

// Change d'image toutes les 10 secondes
setInterval(() => {
  currentIndex = (currentIndex + 1) % images.length; // Défiler les images
  updateBanner(currentIndex);
}, 10000); // 10 secondes

// Gérer les clics sur les points de navigation
indicators.forEach((indicator) => {
  indicator.addEventListener('click', (event) => {
    const index = parseInt(event.target.getAttribute('data-index')); // Récupérer l'index du point cliqué
    currentIndex = index; // Mettre à jour l'index actuel
    updateBanner(currentIndex); // Changer l'image de la bannière
  });
});

// Initialiser le premier point comme actif et afficher la première image
updateBanner(currentIndex);
