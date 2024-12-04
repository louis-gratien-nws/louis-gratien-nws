// Vérifie si la clé API est bien chargée
if (!API_KEY) {
  console.error("La clé API n'a pas été chargée. Assurez-vous que 'config.js' est inclus dans le HTML.");
}

// Fonction pour récupérer les films les plus likés
async function fetchMostLikedMovies(query) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&type=movie`
    );
    const data = await response.json();

    if (data.Response === "True") {
      const detailedMovies = await Promise.all(
        data.Search.map((movie) =>
          fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`).then((res) =>
            res.json()
          )
        )
      );

      const sortedMovies = detailedMovies
        .filter((movie) => movie && movie.imdbRating !== "N/A")
        .sort((a, b) => b.imdbRating - a.imdbRating);

      return sortedMovies;
    } else {
      console.error("Aucun film trouvé pour 'Plus Likés' :", data.Error);
      return [];
    }
  } catch (error) {
    console.error("Erreur API :", error);
    return [];
  }
}

// Fonction pour récupérer les films par genre
async function fetchMoviesByGenre(genre) {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${genre}&type=movie`
    );
    const data = await response.json();

    if (data.Response === "True") {
      return data.Search;
    } else {
      console.error(`Aucun film trouvé pour le genre ${genre} :`, data.Error);
      return [];
    }
  } catch (error) {
    console.error("Erreur API :", error);
    return [];
  }
}

// Fonction pour afficher les films dans un carrousel
function displayMoviesInCarousel(movies, carouselId) {
  const carouselTrack = document.querySelector(`#${carouselId} .carousel-track`);
  if (!carouselTrack) {
    console.error(`Carrousel introuvable pour l'ID : ${carouselId}`);
    return;
  }

  carouselTrack.innerHTML = ""; // Nettoyer le carrousel

  if (movies.length === 0) {
    console.warn(`Aucun film trouvé pour le carrousel ${carouselId}`);
    return;
  }

  movies.forEach((movie) => {
    const movieDiv = document.createElement("div");
    movieDiv.classList.add("carousel-item");

    const poster =
      movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/150x220";

    movieDiv.innerHTML = `
      <img src="${poster}" alt="${movie.Title}">
      <p>${movie.Title}</p>
    `;
    carouselTrack.appendChild(movieDiv);
  });
}

// Fonction pour configurer la navigation des carrousels
function setupCarouselNavigation(carouselId) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) {
    console.error(`Élément avec l'ID '${carouselId}' introuvable.`);
    return;
  }

  const carouselTrack = carousel.querySelector(".carousel-track");
  const nextButton = carousel.querySelector(".carousel-next");
  const prevButton = carousel.querySelector(".carousel-prev");

  if (!carouselTrack || !nextButton || !prevButton) {
    console.error(`Structure DOM incorrecte pour le carrousel : ${carouselId}`);
    return;
  }

  let scrollAmount = 0;
  const scrollStep = 300; // Pixels à faire défiler à chaque clic

  nextButton.addEventListener("click", () => {
    scrollAmount += scrollStep;
    carouselTrack.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
  });

  prevButton.addEventListener("click", () => {
    scrollAmount -= scrollStep;
    if (scrollAmount < 0) scrollAmount = 0;
    carouselTrack.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
  });
}

// Initialisation de la page
async function init() {
  // Carrousel "Plus Likés"
  const mostLikedMovies = await fetchMostLikedMovies("Avengers");
  displayMoviesInCarousel(mostLikedMovies, "mostLiked");
  setupCarouselNavigation("mostLiked");

  // Carrousels par genre
  const actionMovies = await fetchMoviesByGenre("Action");
  const sciFiMovies = await fetchMoviesByGenre("Science Fiction");
  const comedyMovies = await fetchMoviesByGenre("Comedy");

  displayMoviesInCarousel(actionMovies, "action");
  displayMoviesInCarousel(sciFiMovies, "sciFi");
  displayMoviesInCarousel(comedyMovies, "comedy");

  setupCarouselNavigation("action");
  setupCarouselNavigation("sciFi");
  setupCarouselNavigation("comedy");
}

// Charger les films au démarrage de la page
window.addEventListener("DOMContentLoaded", init);

// Gestion du changement de thème
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");

  // Vérifie si un thème est déjà défini dans le stockage local
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.classList.toggle("dark-mode", savedTheme === "dark");
    document.body.classList.toggle("light-theme", savedTheme === "light");
    themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";
  }

  // Ajoute un événement pour basculer entre les thèmes
  themeToggle.addEventListener("click", () => {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    const isLightMode = document.body.classList.toggle("light-theme");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    themeToggle.textContent = isDarkMode ? "☀️" : "🌙";
  });
});
  
