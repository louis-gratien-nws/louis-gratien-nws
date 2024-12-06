const axios = require("axios");
const db = require("./db");
require("dotenv").config();

// Fonction pour récupérer les genres depuis TMDb
async function fetchGenres() {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=fr-FR`
    );
    const genres = response.data.genres;
    console.log("Genres récupérés depuis TMDb :", genres);
    return genres;
  } catch (error) {
    console.error("Erreur lors de la récupération des genres :", error);
    return [];
  }
}

// Fonction pour importer des films à partir d'un endpoint donné
async function fetchMoviesFromEndpoint(endpoint, params, genresMapping) {
  let currentPage = 1;
  const maxPages = 500;

  while (currentPage <= maxPages) {
    try {
      const response = await axios.get(endpoint, { params: { ...params, page: currentPage } });
      const movies = response.data.results;

      // Si aucune donnée pour la page actuelle, passer au genre suivant
      if (!movies || movies.length === 0) {
        console.log(`Aucun film trouvé pour ${endpoint} page ${currentPage}`);
        break;
      }

      for (const movie of movies) {
        try {
          const {
            title,
            release_date,
            overview,
            poster_path,
            vote_average,
            genre_ids,
          } = movie;

          const poster = poster_path
            ? `https://image.tmdb.org/t/p/w500${poster_path}`
            : "https://via.placeholder.com/500x750?text=Pas+d'image";
          const year = release_date ? release_date.split("-")[0] : null;
          const safeReleaseDate = release_date || null;
          const genresForMovie = genre_ids
            .map((id) => genresMapping[id] || "Inconnu")
            .join(", ");

          // Vérifier si le film existe déjà
          const queryCheck = `SELECT id FROM Films WHERE titre = ? AND date_sortie = ?`;
          const existingMovie = await new Promise((resolve, reject) => {
            db.query(queryCheck, [title, safeReleaseDate], (err, results) => {
              if (err) return reject(err);
              resolve(results.length > 0);
            });
          });

          if (!existingMovie) {
            // Insérer le film dans la base de données
            const queryInsert = `
              INSERT INTO Films (titre, annee, genre, synopsis, affiche, acteurs, note, date_sortie)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await new Promise((resolve, reject) => {
              db.query(
                queryInsert,
                [
                  title || "Titre inconnu",
                  year,
                  genresForMovie || "Genre inconnu",
                  overview || "Résumé indisponible",
                  poster,
                  "Acteurs inconnus",
                  vote_average || 0,
                  safeReleaseDate,
                ],
                (err) => {
                  if (err) return reject(err);
                  console.log(`${title || "Titre inconnu"} ajouté.`);
                  resolve();
                }
              );
            });
          } else {
            console.log(`${title} déjà présent dans la base.`);
          }
        } catch (movieError) {
          console.error("Erreur lors du traitement d'un film :", movieError);
        }
      }

      console.log(`Page ${currentPage} traitée pour l'endpoint ${endpoint}.`);
      currentPage++;
    } catch (pageError) {
      console.error(`Erreur lors de la récupération de la page ${currentPage} :`, pageError);
      break; // Quitter la boucle en cas d'erreur sérieuse
    }
  }
}

// Fonction principale pour importer des films en boucle infinie
async function fetchAndSaveMoviesContinuously() {
  const baseParams = {
    api_key: process.env.TMDB_API_KEY,
    language: "fr-FR",
  };

  try {
    // Récupérer les genres depuis l'API
    const genres = await fetchGenres();

    // Créer un dictionnaire des genres pour un accès rapide
    const genreMapping = {};
    genres.forEach((genre) => {
      genreMapping[genre.id] = genre.name;
    });

    // Endpoints et filtres à parcourir (priorité donnée aux films d'animation)
    const endpoints = [
      { url: "https://api.themoviedb.org/3/discover/movie", params: { with_genres: 16 } }, // Film d'animation
      { url: "https://api.themoviedb.org/3/movie/popular", params: {} },
      { url: "https://api.themoviedb.org/3/movie/top_rated", params: {} },
      { url: "https://api.themoviedb.org/3/movie/upcoming", params: {} },
      { url: "https://api.themoviedb.org/3/discover/movie", params: { with_genres: 28 } }, // Action
      { url: "https://api.themoviedb.org/3/discover/movie", params: { with_genres: 35 } }, // Comedy
      { url: "https://api.themoviedb.org/3/discover/movie", params: { with_genres: 878 } }, // Sci-Fi
      { url: "https://api.themoviedb.org/3/discover/movie", params: { with_genres: 27 } }, // Horreur
      { url: "https://api.themoviedb.org/3/discover/movie", params: { with_genres: 53 } }, // Thriller
    ];

    // Boucle infinie
    while (true) {
      for (const endpoint of endpoints) {
        console.log(`Traitement de l'endpoint ${endpoint.url}`);
        await fetchMoviesFromEndpoint(endpoint.url, { ...baseParams, ...endpoint.params }, genreMapping);
      }

      console.log("Cycle complet terminé. Attente de 10 secondes avant de relancer...");
      // Pause de 10 secondes entre chaque cycle
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  } catch (error) {
    console.error("Erreur lors de l'importation continue :", error);
  } finally {
    db.end(() => {
      console.log("Connexion MySQL fermée.");
    });
  }
}

fetchAndSaveMoviesContinuously();
