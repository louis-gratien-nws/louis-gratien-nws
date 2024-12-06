// Fonction pour charger les films par catégorie
async function fetchMoviesByCategory(containerId, genre, limit = 20) {
  try {
    const response = await fetch(
      `http://localhost:3000/films/random?genre=${encodeURIComponent(genre)}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const movies = await response.json();

    // Afficher les films dans la catégorie correspondante
    displayMovies(movies, containerId);
  } catch (error) {
    console.error(`Erreur lors de la récupération des films pour ${genre} :`, error);
    displayErrorMessage(containerId);
  }
}

// Fonction pour charger les films les plus likés
async function fetchMostLikedMovies(containerId, limit = 20) {
  try {
    const response = await fetch(`http://localhost:3000/films/mostLiked?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const movies = await response.json();

    // Afficher les films dans la galerie correspondante
    displayMovies(movies, containerId);
  } catch (error) {
    console.error(`Erreur lors de la récupération des films les plus likés :`, error);
    displayErrorMessage(containerId);
  }
}

// Fonction pour afficher les films dans une galerie donnée
function displayMovies(movies, containerId) {
  const container = document.querySelector(`#${containerId} .carousel-track`);

  if (movies.length === 0) {
    container.innerHTML = `<p>Aucun film disponible dans cette catégorie.</p>`;
    return;
  }

  container.innerHTML = movies
    .map(
      (movie) => `
      <div class="movie-item">
        <img src="${movie.affiche}" alt="${movie.titre}">
        <p>${movie.titre}</p>
      </div>`
    )
    .join("");
}

// Fonction pour afficher un message d'erreur dans une galerie
function displayErrorMessage(containerId) {
  const container = document.querySelector(`#${containerId} .carousel-track`);
  container.innerHTML = `<p>Erreur de chargement des films. Veuillez réessayer plus tard.</p>`;
}

// Fonction pour activer le défilement dans les galeries
function enableCarouselNavigation() {
  const carousels = document.querySelectorAll(".carousel-container");

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const prevButton = carousel.querySelector(".carousel-prev");
    const nextButton = carousel.querySelector(".carousel-next");

    // Largeur de défilement
    const scrollAmount = 300;

    // Défiler à gauche
    prevButton.addEventListener("click", () => {
      track.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    });

    // Défiler à droite
    nextButton.addEventListener("click", () => {
      track.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    });
  });
}

// Charger les films pour chaque galerie
fetchMoviesByCategory("action", "Action", 15);
fetchMoviesByCategory("sciFi", "Science-Fiction", 15);
fetchMoviesByCategory("comedy", "Comédie", 15);
fetchMoviesByCategory("horror", "Horreur", 15);
fetchMoviesByCategory("thriller", "Thriller", 15);
fetchMoviesByCategory("animation", "Film d'animation", 15);
fetchMoviesByCategory("blockbuster", "Blockbuster", 15);
fetchMostLikedMovies("mostLiked", 15);

// Activer la navigation des galeries après le chargement des films
enableCarouselNavigation();
