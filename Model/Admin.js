const mongoose = require( 'mongoose')
const Schema = mongoose.Schema;

// Creation du schéma Admin
const adminSchema = new Schema({
    idAdmin : {type :Number},
    nom: {type:String},
    email: {type:String},
    mdp: {type:String},
    photo: {type:String}
});

let Admin = mongoose.model("Admin", adminSchema,"Admin");

module.exports = {Admin}