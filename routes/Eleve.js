const express = require( 'express');
const router = express.Router();
 
const eleveControlleur = require('../Controlleur/EleveController')
 
router.get('/', eleveControlleur.getEleve);
router.put("/:eleve_id", eleveControlleur.updateEleve);
router.get('/listeDetailAssignement', eleveControlleur.getListeDetailAssignement);
router.get('/assignement', eleveControlleur.getOneAssignementEleve);
router.put('/assignement/:idAssignement/:idEleve', eleveControlleur.rendreDevoir);
router.get("/ficheAssignement/:idEleve/:idAss", eleveControlleur.ficheDetailAssignementEleve);
router.get("/performance", eleveControlleur.getPerformanceOneEleve);

module.exports = router;
