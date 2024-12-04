const API_KEY = "dc66224e"; // Remplace par ta clé API
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const movieGallery = document.querySelector(".movie-gallery");
const movieDetails = document.getElementById("movieDetails");

// Fonction pour rechercher des films avec LocalStorage
async function searchMovies(query) {
  // Vérifier dans LocalStorage
  const cachedMovies = localStorage.getItem(`search-${query}`);
  if (cachedMovies) {
    console.log("Résultats récupérés depuis LocalStorage");
    displayMovies(JSON.parse(cachedMovies)); // Afficher les films
    return;
  }

  try {
    console.log("Recherche dans l'API...");
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`
    );
    const data = await response.json();

    if (data.Response === "True") {
      // Stocker les résultats dans LocalStorage
      let currentStorage = JSON.parse(localStorage.getItem("films")) || [];

      let newFilms = JSON.stringify(data.Search);

      currentStorage.push(newFilms);

      localStorage.setItem("films", JSON.stringify(currentStorage));

      displayMovies(data.Search); // Afficher les films
    } else {
      movieGallery.innerHTML = `<p>Aucun film trouvé pour "${query}".</p>`;
    }
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
    movieGallery.innerHTML = `<p>Erreur lors de la recherche.</p>`;
  }
}

window.addEventListener("DOMContentLoaded", function () {
  const defaultQuery = "Spider  "; // Exemple de requête par défaut
  const cachedMovies = localStorage.getItem(`search-${defaultQuery}`);

  if (cachedMovies) {
    console.log("Affichage des films par défaut depuis LocalStorage...");
    displayMovies(JSON.parse(cachedMovies)); // Affiche les films depuis LocalStorage
  } else {
    console.log("Chargement des films par défaut depuis l'API...");
    searchMovies(defaultQuery); // Requête API si les données ne sont pas en cache
  }
});

// Fonction pour afficher les résultats de recherche
function displayMovies(movies) {
  movieGallery.innerHTML = ""; // Vider la galerie

  movies.forEach((movie) => {
    const movieItem = document.createElement("div");
    movieItem.classList.add("movie-item");

    const poster =
      movie.Poster !== "N/A"
        ? movie.Poster
        : "https://via.placeholder.com/150x220?text=Pas+d'image";

    movieItem.innerHTML = `
      <a href="film.html?filmId=${movie.imdbID}">
        <img src="${poster}" alt="${movie.Title}">
        <p>${movie.Title}</p>
      </a>
    `;

    movieGallery.appendChild(movieItem);
  });
}

// Fonction pour récupérer les détails d'un film avec LocalStorage
async function getMovieDetails(movieId) {
  // Vérifier dans LocalStorage
  const cachedDetails = localStorage.getItem(`movie-${movieId}`);
  if (cachedDetails) {
    console.log("Détails récupérés depuis LocalStorage");
    renderMovieDetails(JSON.parse(cachedDetails)); // Afficher les détails
    return;
  }

  try {
    console.log("Recherche des détails dans l'API...");
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movieId}`
    );
    const data = await response.json();

    if (data.Response === "True") {
      // Stocker les détails dans LocalStorage
      localStorage.setItem(`movie-${movieId}`, JSON.stringify(data));
      renderMovieDetails(data); // Afficher les détails
    } else {
      movieDetails.innerHTML = `<p>Impossible de charger les détails du film.</p>`;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails :", error);
    movieDetails.innerHTML = `<p>Erreur lors de la récupération des détails.</p>`;
  }
}

// Fonction pour afficher les détails d'un film
function renderMovieDetails(data) {
  movieDetails.innerHTML = `
    <h2>${data.Title} (${data.Year})</h2>
    <img src="${data.Poster}" alt="${data.Title}">
    <p><b>Genre:</b> ${data.Genre}</p>
    <p><b>Acteurs:</b> ${data.Actors}</p>
    <p><b>Synopsis:</b> ${data.Plot}</p>
    <p><b>Note:</b> ${data.imdbRating}/10</p>
    <div class="stars">
      <span data-rating="1">★</span>
      <span data-rating="2">★</span>
      <span data-rating="3">★</span>
      <span data-rating="4">★</span>
      <span data-rating="5">★</span>
    </div>
  `;

  setupStarRating(); // Ajouter le système de notation
}

// Écouteur pour le bouton de recherche
searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    searchMovies(query);
    movieDetails.innerHTML = ""; // Réinitialiser les détails
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const profilePicture = document.querySelector(".profile-picture img");
  
  // Exemple : URL de l'image de l'utilisateur (tu peux remplacer par un appel à ton backend)
  const userProfileImage = "https://example.com/path/to/user-profile.jpg";

  // Vérifie si l'utilisateur a une image, sinon charge une image par défaut
  profilePicture.src = userProfileImage || "image/default-profile.png";
});
