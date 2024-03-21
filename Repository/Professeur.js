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
exports.insertionAssignementMatiere = async (idMatiere,dateRendu,nomAss,desc,res) => {
  try {
    let detailAssignementEleve=[];
    let listeEleve = await eleveRepository.getEleve();
    
    for(var i=0;i<listeEleve.length;i++){
        detailAssignementEleve.push({
            idEleve : Number(listeEleve[i].idEleve),
            note : null,
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
    let data = await Professeur.findOne({
      "matiere.assignements": {
        $elemMatch: {
          _id: ObjectID(idAss),
          "detailAssignementEleve.idEleve": Number(idEleve)
        }
      }
    }, {
      "matiere.$": 1
    });
    
    let assignement = null;
    if (data && data.matiere && data.matiere.length > 0) {
      let matiere = data.matiere[0];
      if (matiere.assignements && matiere.assignements.length > 0) {
        let assignements = matiere.assignements.filter(ass => ass._id.toString() === idAss);
        if (assignements.length > 0 && assignements[0].detailAssignementEleve && assignements[0].detailAssignementEleve.length > 0) {
          assignement = assignements[0].detailAssignementEleve.find(eleve => eleve.idEleve === Number(idEleve));
          if (assignement) {
            const eleveData = await eleveRepository.getOneEleve(assignement.idEleve);
            if (eleveData) {
              assignement.nomEleve = eleveData.nom;
              assignement.prenomEleve = eleveData.prenom;
            }
          }
        }
      }
    }
    
    if(!assignement.rendu || assignement.dateRenduEleve==null || assignement.dateRendu==""){
      return res.status(404).json({
        status: 404,
        message: "L'assignement n'est pas encore rendu par "+assignement.nomEleve+" "+assignement.prenomEleve+"!",
      });
    }
   
    if(note<0 || note>20){
      return res.status(404).json({
        status: 404,
        message: "Veuillez entrer une note valide!!",
      });
    }

    const professeur = await Professeur.findOneAndUpdate(
      {
        "matiere.assignements": {
          $elemMatch: {
            _id: ObjectID(idAss),
            "detailAssignementEleve.idEleve": Number(idEleve)
          }
        }
      },
      {
        $set: {
          "matiere.$[elem].assignements.$[assign].detailAssignementEleve.$[detail].note":note,
          "matiere.$[elem].assignements.$[assign].detailAssignementEleve.$[detail].remarque": generateRemarque(note)+remarque
        }
      },
      {
        arrayFilters: [
          { "elem._id": ObjectID("65f9df48a74d8df8ff3738a2") },
          { "assign._id": ObjectID(idAss) },
          { "detail.idEleve": Number(idEleve) }
        ],
        new: true
      }
    );

    if (!professeur) {
      return res.status(404).json({
        status: 404,
        message: "Assignement introuvable!",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Détails d'assignement modifiés avec succès.",
    });

  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur. " + err.message,
    })
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
      _id: ObjectID(idProf),
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
        "matiere.assignements.niveau": "$matiere.idNiveau" 
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
    return await Professeur.aggregate([{
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
        "matiere.assignements.detailAssignementEleve": { $size: "$matiere.assignements.detailAssignementEleve" }
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
    }])

  }catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
}

