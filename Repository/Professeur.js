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
        jwt.sign(payload, config.secret, { expiresIn: config.time }, (err, token) => {
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
    const match =  idProf ? { $match: { _id: ObjectID(idProf) } } : {$match: {  }};
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
          if: { $eq: [{ $size: "$niveau" }, 0] }, 
          then: null, 
          else: { $arrayElemAt: ["$niveau.libelle", 0] } 
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
exports.listeMatiere = async (page, pageNumber, idNiveau,res) => {
  try {
    pageNumber = pageNumber || 2;
    page = page || 0;
    
    var pipeline = [
      // {
      //   $project: {
      //     _id: 0,
      //     idProf: 0,
      //     email: 0,
      //     mdp: 0,
      //     photo: 0,
      //     nom: 0,
      //     "matiere.assignements":0
      //   }
      // },
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
          },
          "matiere.prof": "$nom",
          "matiere.niveau": "$matiere.idNiveau"
        }
      },
      { $project: { "_id": "$matiere._id",
      "idMatiere": "$matiere.idMatiere",
      "libelle": "$matiere.libelle",
      "idNiveau": "$matiere.idNiveau",
      "prof":"$matiere.prof", 
      "niveau": "$matiere.niveau",
      "photo": "$matiere.photo"} }
    ];
    
    if(idNiveau){
      pipeline=[
        ...pipeline,{
        $match: {
        "niveau": Number(idNiveau)
        }
      }];
    }
    const data = await Professeur.aggregate(pipeline);
    const number = data.length;
    let totalPage = Math.floor(Number(number) / pageNumber);
    if (Number(number) % pageNumber != 0) {
      totalPage = totalPage + 1;
    }
    pipeline = [
     ...pipeline,
      { $skip: Number(page * pageNumber) },
      { $limit: Number(pageNumber) }];
    return {
      liste: await Professeur.aggregate(pipeline),
      page: page,
      pageNumber: pageNumber,
      totalPage: totalPage,
      dataLength:data.length,
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
        _id: ObjectID(idProf)
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
exports.insertionAssignementMatiere = async (idMatiere,dateRendu,nomAss,desc,res) => {
  try {
    let detailAssignementEleve=[];
    let listeEleve = await eleveRepository.getEleve();
    
    for(var i=0;i<listeEleve.length;i++){
        detailAssignementEleve.push({
            idEleve : ObjectID(listeEleve[i]._id),
            note : null,
            remarque : "",
            dateRenduEleve : null,
            rendu : false
        });
    }
    const assignement = {
      _id : ObjectID(),
      dateRendu :  new Date(dateRendu),
      nomAssignement : nomAss,
      description : desc,
      statut : false,
      detailAssignementEleve : detailAssignementEleve
    };

    await Professeur.findOneAndUpdate(
      {
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

// Ajout et modification d'une note

function generateRemarque(note) {
  if (note >= 0 && note <= 9) {
      return "Médiocre! ";
  } else if (note >= 10 && note <= 12) {
      return "Assez Bien! ";
  } else if (note > 12 && note <= 15) {
      return "Bien! ";
  } else if (note >= 16 && note <= 20){
      return "Trés Bien! ";
  }else{
      return "";
  }
}

//get 1 assignement à modifier
exports.getOneAssignementModifierNote = async (idAss, idEleve,note,remarque,res) => {
  try {
    const filter = {
      "matiere.assignements._id": ObjectID(idAss),
      "matiere.assignements.detailAssignementEleve.idEleve": ObjectID(idEleve),
    };
    var pipelineAss = [
      { $unwind: "$matiere" },
      { $unwind: "$matiere.assignements" },
      { $unwind: "$matiere.assignements.detailAssignementEleve" },
      {
        $match: filter
      },{
        $replaceRoot : { 
          newRoot : "$matiere.assignements.detailAssignementEleve"
        }
      }
    ];
    let ass= await Professeur.aggregate(pipelineAss);
    console.log(ass );
    if(Number(note)<0 || Number(note)>20){
      res.status(400).json({
        status: 400,
        message: "Saisissez une note valide!!"
      });
    }

    if(!ass[0].rendu || ass[0].dateRenduEleve===null || ass[0].dateRenduEleve===""){
      res.status(400).json({
        status: 400,
        message: "Cet assignement n'est pas encore rendu!!"
      });
    }

    const opt = {
      arrayFilters: [
        { "inner._id": ObjectID(idAss)},
        { "elem.idEleve": ObjectID(idEleve) },
      ]
    };
    const update = {
      $set: {
        "matiere.$[].assignements.$[inner].detailAssignementEleve.$[elem].note": Number(note),
        "matiere.$[].assignements.$[inner].detailAssignementEleve.$[elem].remarque": generateRemarque(note)+remarque
      }
    };

    return await Professeur.updateOne(filter,update,opt);
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur. " + err.message,
    });
  }
}

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
      dataLength:data.length,
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


// Liste assignement avec option tri avec les matieres d’un prof
exports.listeAssignementProf = async (idProf, matiere, page , pageNumber, res) =>{
  try{
    pageNumber = Number(pageNumber) || 2;
    page = Number(page) || 0;
    const match = {
      ...(idProf && {_id: ObjectID(idProf)}),
      ...(matiere && { "matiere._id": ObjectID(matiere) }),
     };
    const propreties = [ {
      $unwind: "$matiere"
    },
    {
      $match: match
    },
    { 
      $unwind: "$matiere.assignements" 
    }]
     let data = await Professeur.aggregate(propreties);
    const total = data.length;
    let totalPage = Math.floor(Number(total) / pageNumber);
    if (Number(total) % pageNumber != 0) {
      totalPage = totalPage + 1;
    }
  const assignement = await Professeur.aggregate([
   ...propreties,
    { 
      $addFields: { 
        "matiere.assignements.matiere": "$matiere.libelle" ,
        "matiere.assignements.niveau": "$matiere.idNiveau" ,
        "matiere.assignements.prof": "$nom"
      } 
    },
    {
      $replaceRoot: { newRoot: "$matiere.assignements" }
    },
    {
      $lookup: {
        from: "Niveau", 
        localField: "niveau",
        foreignField: "idNiveau",
        as: "niveau"
      }
    }, {
      $addFields: {
        niveau: { $arrayElemAt: ["$niveau.libelle", 0] }
      }
    },
    {
      $skip: page * pageNumber 
    },
    {
      $limit: pageNumber 
    },
    {
      $project: {
        detailAssignementEleve: 0, 
      }
    }
  ]);
   return {
    totalPage : totalPage,
    page:page,
    pageNumber : pageNumber,
    dataLength:data.length,
    data : assignement
  }
  }catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
} 

// Fiche assignement
exports.getOneAssignement = async(idAssignement, res) => {
  try{
    const data = await Professeur.aggregate([{
      $unwind: "$matiere"
    },
    { 
      $unwind: "$matiere.assignements" 
    },
    {
      $match: { "matiere.assignements._id" : ObjectID(idAssignement) }
    },
    { 
      $addFields: { 
        "matiere.assignements.matiere": "$matiere.libelle" ,
        "matiere.assignements.niveau": "$matiere.idNiveau",
        "matiere.assignements.prof": "$nom",
        // "matiere.assignements.detailAssignementEleve": { $size: "$matiere.assignements.detailAssignementEleve" }
      } 
    },
    {
      $replaceRoot: { newRoot: "$matiere.assignements" }
    },
    {
      $lookup: {
        from: "Niveau", 
        localField: "niveau",
        foreignField: "idNiveau",
        as: "niveau"
      }
    },{
      $addFields: {
        niveau: { $arrayElemAt: ["$niveau.libelle", 0] }
      }
    },
    {
      $unwind: "$detailAssignementEleve"
    },
    {
      $lookup: {
        from: "Eleve",
        localField: "detailAssignementEleve.idEleve",
        foreignField: "_id",
        as: "detailAssignementEleve.eleve"
      }
    },
    {
      $addFields: {
        "detailAssignementEleve.eleve": {   $concat: [
          { $arrayElemAt: ["$detailAssignementEleve.eleve.prenom", 0] }, 
          " ", 
          { $arrayElemAt: ["$detailAssignementEleve.eleve.nom", 0] } 
        ] }
      }
    },
    {
      $group: {
        _id: "$_id",
        dateRendu: { $first: "$dateRendu" },
        nomAssignement: { $first: "$nomAssignement" },
        description: { $first: "$description" },
        statut: { $first: "$statut" },
        prof: {$first: "$prof"},
        matiere: {$first: "$matiere"},
        niveau: {$first: "$niveau"},
        detailAssignementEleve: { $push: "$detailAssignementEleve" }
      }
    }]);
    return data.length > 0 ? data [0] : {};

  }catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
}

// validation devoir rendu
exports.validationDevoirRendu = async (idAssignement, idEleve, res) => {
  try {
    const filter = {
      "matiere.assignements._id": ObjectID(idAssignement),
      "matiere.assignements.detailAssignementEleve.idEleve": ObjectID(idEleve)
    };
    const update = {
      $set: {
        "matiere.$[].assignements.$[inner].detailAssignementEleve.$[elem].rendu": true
      }
    };
    
    const options = {
      arrayFilters: [
        { "inner._id": ObjectID(idAssignement) },
        { "elem.idEleve": ObjectID(idEleve),"elem.dateRenduEleve": { $ne: null } },
      ]
    };
    const professeur = await Professeur.updateOne(filter, update, options);

    if (!professeur || professeur.modifiedCount === 0) {
     return res.status(400).json({
        status: 400,
        message: "Vous ne pouvez pas effectuer cette action. Veuillez vérifier les conditions.",
      });
    }

    return professeur;
  }catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
}

// validation devoir rendu multiple
exports.validerDevoirRenduMultiple = async(detailAss, res) => {
  detailAss.forEach(element => {
    this.validationDevoirRendu(element.idAssignement,element.idEleve,res);
  });
}

// achever assignement
exports.acheverAssignement = async (idAssignement, res) => {
  try {
    const ajd = new Date();
    const filter = {
      "matiere.assignements._id": ObjectID(idAssignement),
      "matiere.assignements.dateRendu": { $lt: ajd },
    };
    const update = {
      $set: {
        "matiere.$[].assignements.$[inner].statut": true
      }
    };
    
    const options = {
      arrayFilters: [
        { "inner._id": ObjectID(idAssignement),"inner.dateRendu": { $lt: ajd } }
      ]
    };
    const professeur = await Professeur.updateOne(filter, update, options);

    if (!professeur || professeur.modifiedCount === 0) {
     return res.status(400).json({
        status: 400,
        message: "Vous ne pouvez pas effectuer cette action car la date limite de rendu du devoir n'a pas encore été dépassée.",
      });
    }

    return professeur;
  }catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
}

// Liste detail assignement des étudiants
exports.getListeDetailAssignementEleve = async (idProf,idMatiere,idNiveau,orderdateRendu,etat, page, pageNumber, res) => {
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
          "matiere.assignements.detailAssignementEleve.idAssignement": "$matiere.assignements._id" 
        }
      },
      {
        $match: {
          "_id": ObjectID(idProf)
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

    const data = await Professeur.aggregate([...pipeline, ...tripipeline,...newpipeline]);

    return {
      liste: data,
      page: page,
      pageNumber: pageNumber,
      totalPage: totalPage,
      dataLength:result.length,
    };
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

// Liste des deboirs rendus pas encore validée par le prof selon ses matieres
exports.getListeDetailAssignementRenduParEleve = async (idProf,idMatiere,idNiveau, page, pageNumber, res) => {
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
          "matiere.assignements.detailAssignementEleve.idProf" : "$_id",
          "matiere.assignements.detailAssignementEleve.matiere" : "$matiere.libelle",
          "matiere.assignements.detailAssignementEleve.idMatiere" : "$matiere._id",
          "matiere.assignements.detailAssignementEleve.assignement" : "$matiere.assignements.nomAssignement",
          "matiere.assignements.detailAssignementEleve.niveau" : "$matiere.idNiveau",
          "matiere.assignements.detailAssignementEleve.idNiveau" : "$matiere.idNiveau",
          "matiere.assignements.detailAssignementEleve.idAssignement": "$matiere.assignements._id" 
        }
      },
      {
        $match: {
          "matiere.assignements.detailAssignementEleve.dateRenduEleve" : { $ne: null },
          "matiere.assignements.detailAssignementEleve.rendu" : false,
          ... ( idProf && {"matiere.assignements.detailAssignementEleve.idProf": ObjectID(idProf)})
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
    var tripipeline = [];

    if(idMatiere && (idMatiere!=="" || idMatiere!==null)){
      tripipeline.push({
        $match: {
        "idMatiere": ObjectID(idMatiere)
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

    const result = await Professeur.aggregate([...pipeline,...tripipeline]);
    console.log(result);
  
    const total = result.length;
    let totalPage = Math.floor(Number(total) / pageNumber);
    if (Number(total) % pageNumber != 0) {
      totalPage = totalPage + 1;
    }

    var newpipeline = [
      { $skip: Number(page * pageNumber) },
      { $limit: Number(pageNumber) }
    ];
    

    const data = await Professeur.aggregate([...pipeline, ...tripipeline,...newpipeline]);

    return {
      liste: data,
      page: page,
      pageNumber: pageNumber,
      dataLength:result.length,
      totalPage: totalPage,
    };
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

// Liste detail assignement des étudiants (par assignement)
exports.getListeDetailAssignementParAssignement = async (idProf,idAssignement, res) => {
  try {
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
          "matiere.assignements.detailAssignementEleve.idAssignement": "$matiere.assignements._id" 
        }
      },
      {
        $match: {
          "_id": ObjectID(idProf)
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

    var tripipeline = [];

    if(idAssignement && (idAssignement!=="" || idAssignement!==null)){
      tripipeline.push({
        $match: {
        "idAssignement": ObjectID(idAssignement)
        }
      });
    }
    
    const data = await Professeur.aggregate([...pipeline, ...tripipeline]);

    return {
      liste: data
    };
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

// modification d'une assignement d'une matière par un Professeur
exports.modificationAssignement = async (idAssignement,dateRendu,nomAss,desc,res) => {
  try {
    const filter = {
      "matiere.assignements._id": ObjectID(idAssignement),
      "matiere.assignements.statut": false,
    };
    const update = {
      $set: {
        "matiere.$[].assignements.$[inner].dateRendu": new Date(dateRendu),
        "matiere.$[].assignements.$[inner].description": desc,
        "matiere.$[].assignements.$[inner].nomAssignement": nomAss,
      }
    };
  
    const options = {
      arrayFilters: [
        { "inner._id": ObjectID(idAssignement),"inner.statut": false }
      ]
    };

    const professeur = await Professeur.updateOne(filter, update, options);

    if (!professeur || professeur.modifiedCount === 0) {
      return res.status(400).json({
         status: 400,
         message: "La modification de ce devoir n'est pas possible, ce devoir est déjà clôturé.",
       });
     }
 
     return professeur;
   }catch (err) {
     res.status(400).json({
       status: 500,
       message: err.message,
     });
   }
};
