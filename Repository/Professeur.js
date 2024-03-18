var { Professeur } = require("../Model/Professeur");
var config = require('../config/SECRET');
var jwt = require('jsonwebtoken');
var ObjectID = require("mongoose").Types.ObjectId;

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


// Liste matière d'un prof
exports.listeMatiereProf = async (idProf, res) => {
  try{
    const match =  { $match: { _id: ObjectID(idProf) } };
    var unwind = { $unwind: "$matiere" };
    var lookup = {
      $lookup: {
        from: "Niveau",
        localField: "matiere.idNiveau",
        foreignField: "idNiveau",
        as: "niveau",
      },
    };
    var project = { $project: { "_id": "$matiere._id",
    "idMatiere": "$matiere.idMatiere",
    "libelle": "$matiere.libelle",
    "idNiveau": "$matiere.idNiveau",
    "libelleNiveau": {
      $cond: {
          if: { $eq: [{ $size: "$niveau" }, 0] }, // Vérifie si le tableau est vide
          then: null, // Définit libelleNiveau à null si le tableau est vide
          else: { $arrayElemAt: ["$niveau.libelle", 0] } // Sinon, extrait le premier élément du tableau
      }
     },
    "photo": "$matiere.photo"} };
    let data = await Professeur.aggregate([unwind, match, lookup,project]);
    return data;
  }catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur. "+err.message,
    });
  }
}
