const express = require( 'express');
const router = express.Router();
 
const adminControlleur = require('../Controlleur/AdminController')
 
router.get('/', adminControlleur.getAdmin);

module.exports = router;