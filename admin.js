const API_KEY = "dc66224e"; // Remplace par ta clé API
const adminTableBody = document.querySelector(".admin-table tbody"); // Sélectionner le corps du tableau

// Fonction pour récupérer les films
async function fetchMovies() {
  try {
    // Remplacer "Batman" par un terme de recherche ou utiliser un autre mot-clé
    const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=batman&type=movie&page=1`);
    const data = await response.json();

    if (data.Response === "True") {
      // Afficher jusqu'à 10 films dans le tableau
      displayMovies(data.Search.slice(0, 10)); // Affiche 10 films
    } else {
      adminTableBody.innerHTML = `<tr><td colspan="4">Aucun film trouvé.</td></tr>`;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des films :", error);
    adminTableBody.innerHTML = `<tr><td colspan="4">Erreur lors de la récupération des films.</td></tr>`;
  }
}

// Fonction pour afficher les films dans le tableau
function displayMovies(movies) {
  adminTableBody.innerHTML = ""; // Vider le tableau avant d'ajouter les films

  movies.forEach((movie) => {
    const movieRow = document.createElement("tr");

    const poster =
      movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/150x220?text=Pas+d'image";

    movieRow.innerHTML = `
      <td>${movie.Title}</td>
      <td><img src="${poster}" alt="${movie.Title}" width="100"></td>
      <td><span class="comment-count">0</span></td> <!-- Nombre de commentaires vide pour l'instant -->
      <td>
        <button class="edit-btn">
          <i class="fas fa-edit"></i> Modifier
        </button>
        <button class="delete-btn">
          <i class="fas fa-trash"></i> Supprimer
        </button>
      </td>
    `;

    adminTableBody.appendChild(movieRow);
  });
}

// Initialiser la récupération des films
fetchMovies();

// Fonction pour gérer l'action des boutons (pour l'exemple, on ajoutera une simple alerte)
adminTableBody.addEventListener("click", function (e) {
  if (e.target.closest(".edit-btn")) {
    alert("Modifier les commentaires pour ce film.");
  }

  if (e.target.closest(".delete-btn")) {
    alert("Supprimer ce film.");
  }
});
