const express = require("express");
const router = express.Router();

// Require controller modules.
const UtilisateurControlleur = require("../Controlleur/UtilisateurController");

router.post("/login", UtilisateurControlleur.login);

module.exports = router;
