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

//get liste des matières avec pagination
exports.listeMatiere = async (page, pageNumber, res) => {
  try {
    if (!pageNumber) pageNumber = 20;
    const data = await Professeur.find();
    const number = data.length;
    let totalPage = Math.floor(Number(number) / pageNumber);
    if (Number(number) % pageNumber != 0) {
      totalPage = totalPage + 1;
    }
    var pipeline = [
      {
        $project: {
          _id: 0,
          idProf: 0,
          email: 0,
          mdp: 0,
          photo: 0,
          "matiere.assignements":0
        }
      },
      { $unwind: "$matiere" },
      {
        $lookup: {
          from: "Niveau",
          localField: "matiere.idNiveau",
          foreignField: "idNiveau",
          as: "niveauData"
        }
      },
      {
        $addFields: {
          "matiere.idNiveau": {
            $arrayElemAt: ["$niveauData.libelle", 0]
          }
        }
      },
      {
        $project: {
          "niveauData": 0
        }
      },
      { $skip: Number(page * pageNumber) },
      { $limit: Number(pageNumber) }
    ];

    return {
      liste: await Professeur.aggregate(pipeline),
      page: page,
      pageNumber: pageNumber,
      totalPage: totalPage,
    };
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

// insertion d'une nouvelle matière d'un professeur
function randomIdMatiere(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.insertionMatiere = async (idProf,libelle,idNiveau,photo,res) => {
  try {
    const matiere = {
      _id : ObjectID(),
      idMatiere : Number(randomIdMatiere(201,250)),
      libelle : libelle,
      idNiveau : Number(idNiveau),
      photo : photo,
      assignements : []
    };
    await Professeur.findOneAndUpdate(
      {
        idProf: Number(idProf)
      },
      {
        $push: {
          "matiere": matiere,
        },
      }
    );
    return matiere;
  } catch (err) {
        res.status(400).json({
        status: 400,
        message: err.message,
    });
  }
};



