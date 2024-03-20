var { Eleve } = require("../Model/Eleve");
var config = require('../config/SECRET');
var jwt = require('jsonwebtoken');

exports.getEleve = async (res) => {
  try {
    let data = await Eleve.find();
    return data;
  } catch (err) {
        res.status(400).json({
        status: 400,
        message: err.message,
    });
  }
};

exports.login = async (email, mdp, res) => {
  try {
    let eleve = await Eleve.findOne({ email: email,mdp:mdp }).select("-mdp");
    if(eleve){
      const payload = {
        eleve: {
          id: eleve._id,
        },
      };
  
      let token = await new Promise((resolve, reject) => {
        jwt.sign(payload, config.secret, { expiresIn: 3600 }, (err, token) => {
          if (err) reject(err);
          console.log("Access TOKEN :", token);
          resolve(token); // Résoudre la promesse avec le token
        });
      });
      eleve.niveau = eleve.niveau.filter(niveau => niveau.etatNiveau === true).map(niveau => niveau.idNiveau);
      return {eleve,token};
    }
    return eleve;
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur."+err.message,
    });
  }
};

// Modification élève
exports.updateEleve = async (id, eleve, res) => {
  try {
    let data = await Eleve.findOneAndUpdate({ _id: id }, eleve, {
      new: true,
      runValidators: true,
    });
    return data;
  } catch (err) {
    res.status(404).json({ msg: err });
  }
};

exports.getOneEleve = async (id,res) => {
  try {
    let data = await Eleve.findOne({idEleve : Number(id)});
    return data;
  } catch (err) {
        res.status(400).json({
        status: 400,
        message: err.message,
    });
  }
};