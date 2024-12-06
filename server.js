const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db"); // Connexion à la base de données
require("dotenv").config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simuler une session utilisateur
let currentUser = null;

// --- Films aléatoires ---
app.get("/films/random", (req, res) => {
  const genre = req.query.genre || "";
  const limit = parseInt(req.query.limit) || 20;

  let query = `
    SELECT id, titre AS title, affiche AS poster 
    FROM Films
  `;
  const params = [];

  if (genre) {
    query += " WHERE genre LIKE ?";
    params.push(`%${genre}%`);
  }

  query += " ORDER BY RAND() LIMIT ?";
  params.push(limit);

  console.log("Films aléatoires - Requête SQL exécutée :", query, params);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des films aléatoires :", err);
      return res.status(500).json({ message: "Erreur lors de la récupération des films aléatoires." });
    }
    res.json(results);
  });
});

// --- Détails du film ---
app.get("/films/:filmId", (req, res) => {
  const { filmId } = req.params;

  if (!filmId) {
    return res.status(400).json({ message: "ID du film requis." });
  }

  const query = `
    SELECT 
      id, 
      titre AS title, 
      affiche AS poster, 
      note, 
      genre AS genres, 
      acteurs AS actors, 
      synopsis AS description 
    FROM Films 
    WHERE id = ?
  `;

  console.log("Détails du film - Requête SQL exécutée :", query, [filmId]);

  db.query(query, [filmId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des détails du film :", err);
      return res.status(500).json({ message: "Erreur lors de la récupération des détails du film." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Film non trouvé." });
    }
    res.json(results[0]);
  });
});

// --- Recherche de films ---
app.get("/films/search", (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ message: "Requête de recherche vide." });
  }

  const sqlQuery = `
    SELECT id, titre AS title, affiche AS poster
    FROM Films
    WHERE titre LIKE ? OR genre LIKE ?
    ORDER BY note DESC
    LIMIT 50
  `;

  const searchTerm = `%${query}%`;

  db.query(sqlQuery, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("Erreur lors de la recherche des films :", err);
      return res.status(500).json({ message: "Erreur serveur lors de la recherche des films." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Aucun film trouvé." });
    }
    res.json(results);
  });
});


// --- Authentification ---
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    console.log("Inscription - Requête SQL exécutée :", query, [username, email]);

    db.query(query, [username, email, hashedPassword], (err) => {
      if (err) {
        console.error("Erreur lors de l'inscription :", err);
        return res.status(500).json({ message: "Erreur lors de l'inscription." });
      }
      res.status(201).json({ message: "Utilisateur créé avec succès." });
    });
  } catch (error) {
    console.error("Erreur lors du hash du mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const query = "SELECT * FROM users WHERE email = ?";

  console.log("Connexion - Requête SQL exécutée :", query, [email]);

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Erreur lors de la connexion :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      currentUser = { id: user.id, username: user.username };
      res.status(200).json({ message: "Connexion réussie.", userId: user.id, username: user.username });
    } else {
      res.status(401).json({ message: "Mot de passe incorrect." });
    }
  });
});

app.post("/logout", (req, res) => {
  currentUser = null;
  res.json({ message: "Déconnexion réussie." });
});

app.get("/current-user", (req, res) => {
  if (currentUser) {
    res.json({ user: currentUser });
  } else {
    res.status(401).json({ message: "Non connecté." });
  }
});

// --- Commentaires ---
app.post("/comments", (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: "Vous devez être connecté pour commenter." });
  }

  const { movie_id, comment } = req.body;

  if (!movie_id || !comment) {
    return res.status(400).json({ message: "Movie ID et commentaire sont requis." });
  }

  const query = "INSERT INTO comments (movie_id, user_id, comment) VALUES (?, ?, ?)";

  console.log("Ajout de commentaire - Requête SQL exécutée :", query, [movie_id, currentUser.id]);

  db.query(query, [movie_id, currentUser.id, comment], (err) => {
    if (err) {
      console.error("Erreur lors de l'ajout du commentaire :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }
    res.status(201).json({ message: "Commentaire ajouté." });
  });
});

app.get("/comments/:movie_id", (req, res) => {
  const { movie_id } = req.params;

  const query = `
    SELECT comments.*, users.username 
    FROM comments 
    JOIN users ON comments.user_id = users.id 
    WHERE movie_id = ? 
    ORDER BY created_at DESC
  `;

  console.log("Récupération des commentaires - Requête SQL exécutée :", query, [movie_id]);

  db.query(query, [movie_id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des commentaires :", err);
      return res.status(500).json({ message: "Erreur serveur." });
    }
    res.json(results);
  });
});

// --- TEST ENDPOINT ---
app.get("/", (req, res) => {
  res.send("Le serveur est opérationnel !");
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
