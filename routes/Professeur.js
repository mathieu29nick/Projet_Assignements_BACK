const express = require( 'express');
const router = express.Router();
 
const professeurControlleur = require('../Controlleur/ProfesseurController')
 
router.get('/', professeurControlleur.getProfesseur);

module.exports = router;