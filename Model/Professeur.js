const mongoose = require( 'mongoose')
const Schema = mongoose.Schema;

const detailAssignementEleveSchema = new mongoose.Schema({
    idEleve: { type: mongoose.Schema.Types.ObjectId, ref: 'Eleve' },
    note: Number,
    remarque: String,
    dateRenduEleve: Date,
    rendu: Boolean
  });
  
  const assignementSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dateRendu: Date,
    nomAssignement: String,
    description: String,
    statut: Boolean,
    detailAssignementEleve: [detailAssignementEleveSchema] 
  });
  
  const matiereSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    libelle: String,
    photo: String,
    niveau: Number,
    assignements: [assignementSchema] 
  });
// Creation du schéma Professeur
const professeurSchema = new Schema({
    idProf: {type:Number},
    nom: {type:String},
    email: {type:String},
    mdp: {type:String},
    photo: {type:String},
    matiere : [matiereSchema]
});

let Professeur = mongoose.model("Professeur", professeurSchema,"Professeur");

module.exports = {Professeur}