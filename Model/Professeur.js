const mongoose = require( 'mongoose')
const Schema = mongoose.Schema;

// Creation du schéma Professeur
const professeurSchema = new Schema({
    idProf: {type:Number},
    nom: {type:String},
    email: {type:String},
    mdp: {type:String},
    photo: {type:String},
    matiere : []
});

let Professeur = mongoose.model("Professeur", professeurSchema,"Professeur");

module.exports = {Professeur}