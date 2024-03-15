const mongoose = require( 'mongoose')
const Schema = mongoose.Schema;

// Creation du schéma Eleve
const eleveSchema = new Schema({
    idEleve: {type:Number},
    nom: {type:String},
    prenom: {type:String},
    email: {type:String},
    mdp: {type:String},
    photo: {type:String},
    niveau : []
});

let Eleve = mongoose.model("Eleve", eleveSchema,"Eleve");

module.exports = {Eleve}