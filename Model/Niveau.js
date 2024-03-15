const mongoose = require( 'mongoose')
const Schema = mongoose.Schema;

// Creation du schéma Niveau
const niveauSchema = new Schema({
    idNiveau: {type:Number},
    libelle: {type:String}
});

let Niveau = mongoose.model("Niveau", niveauSchema,"Niveau");

module.exports = {Niveau}