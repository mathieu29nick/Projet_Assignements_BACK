var { Eleve } = require("../Model/Eleve");
var { Professeur } = require("../Model/Professeur");
var config = require('../config/SECRET');
var jwt = require('jsonwebtoken');
var ObjectID = require("mongoose").Types.ObjectId;

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
    let data = await Eleve.findOne({idEleve : ObjectID(id)});
    return data;
  } catch (err) {
        res.status(400).json({
        status: 400,
        message: err.message,
    });
  }
};

// liste des devoirs avec tri (etat,dateRendu(asc,desc),niveau,matiere)
exports.getListeDetailAssignement = async (idEleve,idMatiere,idNiveau,orderdateRendu,etat, page, pageNumber, res) => {
  try {
    pageNumber = pageNumber || 2;
    page = page || 0;
    if (!pageNumber) pageNumber = 20;

    var pipeline = [
      { $unwind: "$matiere" },
      { $unwind: "$matiere.assignements" },
      { $unwind: "$matiere.assignements.detailAssignementEleve" },
      {
        $addFields: {
          "matiere.assignements.detailAssignementEleve.matiere" : "$matiere.libelle",
          "matiere.assignements.detailAssignementEleve.idMatiere" : "$matiere._id",
          "matiere.assignements.detailAssignementEleve.assignement" : "$matiere.assignements.nomAssignement",
          "matiere.assignements.detailAssignementEleve.niveau" : "$matiere.idNiveau",
          "matiere.assignements.detailAssignementEleve.idNiveau" : "$matiere.idNiveau",
        }
      },
      {
        $match: {
          "matiere.assignements.detailAssignementEleve.idEleve": ObjectID(idEleve)
        }
      },{
        $replaceRoot : { 
          newRoot : "$matiere.assignements.detailAssignementEleve"
        }
      },{
        $lookup: {
          from: "Eleve",
          localField: "idEleve",
          foreignField: "_id",
          as: "eleve",
        }
      },{
        $lookup: {
          from: "Niveau",
          localField: "niveau",
          foreignField: "idNiveau",
          as: "niveau",
        }
      },{
        $addFields: {
          eleve: {
            $concat: [
              { $arrayElemAt: ["$eleve.nom", 0] }," ",
              { $toString: { $arrayElemAt: ["$eleve.prenom", 0] } },
            ]
          },
          niveau : {$arrayElemAt: ["$niveau.libelle", 0]}
        }
      }
    ];

    const result = await Professeur.aggregate(pipeline);
  
    const total = result.length;
    let totalPage = Math.floor(Number(total) / pageNumber);
    if (Number(total) % pageNumber != 0) {
      totalPage = totalPage + 1;
    }

    var newpipeline = [
      { $skip: Number(page * pageNumber) },
      { $limit: Number(pageNumber) }
    ];
    
    var tripipeline = [];

    if(idMatiere && (idMatiere!=="" || idMatiere!==null)){
      tripipeline.push({
        $match: {
        "idMatiere": ObjectID(idMatiere)
        }
      });
    }
    
    if(orderdateRendu && (orderdateRendu!=="" || orderdateRendu!==null)){
      tripipeline.push({
        $sort: {
        "dateRenduEleve": Number(orderdateRendu)
        }
      });
    }
    
    if( idNiveau && (idNiveau!=="" || idNiveau!==null)){
      tripipeline.push({
        $match: {
        "idNiveau": Number(idNiveau)
        }
      });
    }

    // 0 : rendu , 1 non rendu par l'élève
    if( etat && (etat!=="" || etat!==null)){
      console.log(etat)
      tripipeline.push({
        $match: {
        "dateRenduEleve": Number(etat) === 0 ? { $ne: null } : null
        }
      });
    }

    console.log(tripipeline);
    const data = await Professeur.aggregate([...pipeline, ...tripipeline,...newpipeline]);

    return {
      liste: data,
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

//  Fiche assignement d'un élève avec bouton rendre l'assignement
exports.setRendreDetailAssignementEleve = async (idEleve,idAss, res) => {
  try {
    const data = await Professeur.findOneAndUpdate(
      {
        "matiere.assignements": {
          $elemMatch: {
            _id: ObjectID(idAss),
            "detailAssignementEleve.idEleve": ObjectID(idEleve)
          }
        }
      },
      {
        $set: {
          "matiere.assignements.$[assign].detailAssignementEleve.$[detail].rendu": true,
          "matiere.assignements.$[assign].detailAssignementEleve.$[detail].dateRendu": new Date()
        }
      },
      {
        arrayFilters: [
          { "assign._id": ObjectID(idAss) },
          { "detail.idEleve": ObjectID(idEleve) }
        ],
        new: true
      }
    );
    return res.status(200).json({
      status: 200,
      data : data,
      message: "Détails d'assignement modifiés avec succès.",
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};