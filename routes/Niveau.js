const express = require( 'express');
const router = express.Router();
 
const niveauControlleur = require('../Controlleur/NiveauController')
 
router.get('/', niveauControlleur.getNiveau);
router.post('/', niveauControlleur.insertNiveau);
router.delete('/:idNiveau', niveauControlleur.deleteNiveau);
router.put('/:idNiveau', niveauControlleur.updateNiveau);

module.exports = router;