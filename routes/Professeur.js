const express = require( 'express');
const router = express.Router();
 
const professeurControlleur = require('../Controlleur/ProfesseurController')
 
router.get('/', professeurControlleur.getProfesseur);
router.get("/matieres", professeurControlleur.listeMatiere);
router.put('/:idProf', professeurControlleur.insertMatiere);

module.exports = router;