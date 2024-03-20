const express = require( 'express');
const router = express.Router();
 
const professeurControlleur = require('../Controlleur/ProfesseurController')
 
router.get('/', professeurControlleur.getProfesseur);
router.get('/matieres', professeurControlleur.listeMatiereProf);
router.get("/allmatieres", professeurControlleur.listeMatiere);
router.put('/matiere/:idProf', professeurControlleur.insertMatiere);
router.put('/insertionAssigmentMatiere/:idProf/:idMatiere', professeurControlleur.insertionAssignementMatiere);
router.get('/professeurs', professeurControlleur.getAllProf);
router.put('/:idProf', professeurControlleur.updateProf);
router.post('/', professeurControlleur.createProf);

module.exports = router;