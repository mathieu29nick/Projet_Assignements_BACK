const express = require( 'express');
const router = express.Router();
 
const assignementControlleur = require('../Controlleur/AssignementController')
 
router.get('/', assignementControlleur.getAssignement);

module.exports = router;