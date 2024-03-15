const express = require( 'express');
const router = express.Router();
 
const niveauControlleur = require('../Controlleur/NiveauController')
 
router.get('/', niveauControlleur.getNiveau);

module.exports = router;