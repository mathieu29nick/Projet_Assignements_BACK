const mongoose = require( 'mongoose')
const Schema = mongoose.Schema;

// Creation du schéma Assignement
const assSchema = new Schema({
    nom: {type:String}
});

let Assignement = mongoose.model("Assignement", assSchema,"Assignement");

module.exports = {Assignement}