const express = require( 'express');
const router = express.Router();
 
const eleveControlleur = require('../Controlleur/EleveController')
 
router.get('/', eleveControlleur.getEleve);

module.exports = router;