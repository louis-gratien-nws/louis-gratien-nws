const API_KEY = "dc66224e"; // Remplace par ta clé API
const movieDetails = document.getElementById("movieDetails");

// Fonction pour extraire l'ID du film depuis l'URL
function getFilmIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("filmId");
}

// Fonction pour récupérer les détails du film
async function fetchMovieDetails(movieId) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movieId}`
    );
    const data = await response.json();

    if (data.Response === "True") {
      displayMovieDetails(data);
    } else {
      movieDetails.innerHTML = `<p>Impossible de charger les détails du film.</p>`;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails :", error);
    movieDetails.innerHTML = `<p>Erreur lors de la récupération des détails.</p>`;
  }
}

// Fonction pour afficher les détails du film
function displayMovieDetails(movie) {
  movieDetails.innerHTML = `
    <h2>${movie.Title} (${movie.Year})</h2>
    <img src="${movie.Poster}" alt="${movie.Title}">
    <p><b>Genre:</b> ${movie.Genre}</p>
    <p><b>Acteurs:</b> ${movie.Actors}</p>
    <p><b>Synopsis:</b> ${movie.Plot}</p>
    <p><b>Note:</b> ${movie.imdbRating}/10</p>
    <div class="stars">
      <span data-rating="1">★</span>
      <span data-rating="2">★</span>
      <span data-rating="3">★</span>
      <span data-rating="4">★</span>
      <span data-rating="5">★</span>
    </div>
  `;

  // Optionnel : Configurer la notation par étoiles
  setupStarRating();
}

// Fonction pour gérer la notation par étoiles
function setupStarRating() {
  const stars = document.querySelectorAll(".stars span");
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      // Réinitialiser les étoiles
      stars.forEach((s) => s.classList.remove("selected"));

      // Appliquer la sélection
      star.classList.add("selected");
      const rating = star.getAttribute("data-rating");
      alert(`Vous avez donné une note de ${rating} étoile(s) à ce film !`);
    });
  });
}

// Récupérer l'ID du film depuis l'URL et afficher ses détails
const filmId = getFilmIdFromUrl();
if (filmId) {
  fetchMovieDetails(filmId);
} else {
  movieDetails.innerHTML = `<p>ID de film manquant dans l'URL.</p>`;
}
