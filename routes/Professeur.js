const express = require( 'express');
const router = express.Router();
 
const professeurControlleur = require('../Controlleur/ProfesseurController')
 
router.get('/', professeurControlleur.getProfesseur);
router.get('/matieres', professeurControlleur.listeMatiereProf);
router.get("/allmatieres", professeurControlleur.listeMatiere);
router.put('/insertionAssigmentMatiere/:idMatiere', professeurControlleur.insertionAssignementMatiere);
router.put('/assignementNoteModifier/:idAss/:idEleve', professeurControlleur.getOneAssignementModifierNote);
router.put('/matiere/:idProf', professeurControlleur.insertMatiere);
router.get('/professeurs', professeurControlleur.getAllProf);
router.put('/:idProf', professeurControlleur.updateProf);
router.post('/', professeurControlleur.createProf);

module.exports = router;