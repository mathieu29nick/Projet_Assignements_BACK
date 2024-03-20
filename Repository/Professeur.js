var { Professeur } = require("../Model/Professeur");
var config = require('../config/SECRET');
var jwt = require('jsonwebtoken');
var ObjectID = require("mongoose").Types.ObjectId;
const eleveRepository = require("../Repository/Eleve");

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
    let prof = await Professeur.findOne({ email: email,mdp:mdp }).select('-matiere').select('-mdp');
    if(prof){
      const payload = {
        prof: {
          id: prof._id,
        },
      };
      const token = await new Promise((resolve, reject) => {
        jwt.sign(payload, config.secret, { expiresIn: 3600 }, (err, token) => {
          if (err) reject(err);
          console.log("Access TOKEN :", token);
          resolve(token); // Résoudre la promesse avec le token
        });
      });
      return {prof,token}
    }
    
    return prof;
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur." +err.message,
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

// insertion d'une assignement d'une matière par un Professeur
exports.insertionAssignementMatiere = async (idProf,idMatiere,dateRendu,nomAss,desc,res) => {
  try {
    let detailAssignementEleve=[];
    let listeEleve = await eleveRepository.getEleve();
    
    for(var i=0;i<listeEleve.length;i++){
        detailAssignementEleve.push({
            idEleve : Number(listeEleve[i].idEleve),
            note : 0,
            remarque : "",
            dateRenduEleve : null,
            rendu : false
        });
    }

    const assignement = {
      _id : ObjectID(),
      dateRenduEleve : new Date(dateRendu),
      nomAssignement : nomAss,
      description : desc,
      status : false,
      detailAssignementEleve : detailAssignementEleve
    };

    await Professeur.findOneAndUpdate(
      {
        _id : ObjectID(idProf),
        "matiere._id" : ObjectID(idMatiere)
      },
      {
        $push: {
          "matiere.$.assignements": assignement,
        },
      }
    );
    return assignement;
  } catch (err) {
        res.status(400).json({
        status: 400,
        message: err.message,
    });
  }
};


// get liste prof
exports.getAllProf = async (page,pageNumber,res) => {
  try {
    pageNumber = pageNumber || 2;
    page = page || 0;
    let data = await Professeur.find();
    const total = data.length;
    let totalPage = Math.floor(Number(total) / pageNumber);
    if (Number(total) % pageNumber != 0) {
      totalPage = totalPage + 1;
    }
    return {
      totalPage : totalPage,
      page:page,
      pageNumber : pageNumber,
      data : await Professeur.find().select('-matiere').select('-mdp').skip(Number(page)*pageNumber).limit(Number(pageNumber))
    }
  } catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
};


// create prof
exports.createProf = async (prof , res) => {
  try {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const onlySpaces =/^\s*$/;
    prof.idProf = Math.floor(Math.random() * (1000)) + 7;
    if(!prof.email){
      throw new Error("Entrez un email");
    }else if(!regexEmail.test(prof.email)){
      throw new Error("Veuillez saisir un email valide");
    }
    if(!prof.nom){
      throw new Error("Entrez un nom");
    }else if(prof.nom.match(onlySpaces) ){
      throw new Error("Le nom n'est pas valide");
    }
    prof.mdp = "mot de passe";
    let data = await Professeur.create(prof);
    return data;
  } catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
}

exports.updateProf = async (idProf ,prof , res) => {
  try {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const onlySpaces =/^\s*$/;
    prof.idProf = Math.floor(Math.random() * (1000)) + 7;
    if(prof.email && !regexEmail.test(prof.email)){
      throw new Error("Veuillez saisir un email valide");
    }
    if(prof.nom && prof.nom.match(onlySpaces) ){
      throw new Error("Le nom n'est pas valide");
    }
    let data = await Professeur.findOneAndUpdate({ _id: ObjectID(idProf) }, prof, {
      new: true,
      runValidators: true,
    });
    return data;
  } catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
}

