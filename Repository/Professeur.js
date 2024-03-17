var { Professeur } = require("../Model/Professeur");
var config = require('../config/SECRET');
var jwt = require('jsonwebtoken');

exports.getProfesseur = async (res) => {
  try {
    let data = await Professeur.find();
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
    let prof = await Professeur.findOne({ email: email,mdp:mdp });
    if (!prof) {
      return res.status(404).json({
        status: 404,
        message: "Identifiant non trouvé!",
      });
    }
    
    const payload = {
      prof: {
        id: prof.idProf,
      },
    };

    jwt.sign(
      payload,
      config.secret,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        console.log("Access TOKEN :", token);
        res.json({ token });
      }
    );
    return prof;
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur.",
    });
  }
};
