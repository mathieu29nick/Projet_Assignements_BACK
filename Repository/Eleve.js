var { Eleve } = require("../Model/Eleve");
var { Professeur } = require("../Model/Professeur");
var config = require('../config/SECRET');
var jwt = require('jsonwebtoken');
var ObjectID = require("mongoose").Types.ObjectId;
var nodemailer = require("nodemailer");

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
        jwt.sign(payload, config.secret, { expiresIn: config.time }, (err, token) => {
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
          "matiere.assignements.detailAssignementEleve.idAssignement": "$matiere.assignements._id",
          "matiere.assignements.detailAssignementEleve.dateRendu": "$matiere.assignements.dateRendu" 
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
        "dateRendu": Number(orderdateRendu)
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


    const result = await Professeur.aggregate([...pipeline, ...tripipeline]);
  
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


// Fiche devoir Eleve
exports.getOneAssignementEleve = async (idAssignement, idEleve , res) => {
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
      $unwind: "$matiere.assignements.detailAssignementEleve" 
    },
    { 
      $addFields: { 
        "matiere.assignements.detailAssignementEleve.matiere": "$matiere.libelle" ,
        "matiere.assignements.detailAssignementEleve.niveau": "$matiere.idNiveau",
        "matiere.assignements.detailAssignementEleve.assignement": "$matiere.assignements.nomAssignement",
        "matiere.assignements.detailAssignementEleve.dateRendu": "$matiere.assignements.dateRendu",
        "matiere.assignements.detailAssignementEleve.idAssignement": "$matiere.assignements._id"  ,
        "matiere.assignements.detailAssignementEleve.description": "$matiere.assignements.description"  
      } 
    },
    {
      $replaceRoot: { newRoot: "$matiere.assignements.detailAssignementEleve" }
    },
    {
      $match: { "idEleve" : ObjectID(idEleve) }
    },
    {
      $lookup: {
        from: "Niveau", 
        localField: "niveau",
        foreignField: "idNiveau",
        as: "niveau"
      }
    },
    {
      $lookup: {
        from: "Eleve", 
        localField: "idEleve",
        foreignField: "_id",
        as: "eleve"
      }
    },{
      $addFields: {
        eleve: {
          $concat: [
            { $arrayElemAt: ["$eleve.nom", 0] }," ",
            { $toString: { $arrayElemAt: ["$eleve.prenom", 0] } },
          ]
        },
        photoeleve : {$arrayElemAt: ["$eleve.photo", 0]},
        niveau : {$arrayElemAt: ["$niveau.libelle", 0]}
      }
    }])
    return data.length > 0 ? data [0] : {};
  }catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
}


// rendre devoir
exports.rendreDevoir = async (idAssignement, idEleve, res) => {
  try {
    const ajd = new Date();
    const filter = {
      "matiere.assignements._id": ObjectID(idAssignement),
      "matiere.assignements.dateRendu": { $gte: ajd },
      "matiere.assignements.detailAssignementEleve.idEleve": ObjectID(idEleve),
      "matiere.assignements.detailAssignementEleve.rendu": false
    };
    const update = {
      $set: {
        "matiere.$[].assignements.$[inner].detailAssignementEleve.$[elem].dateRenduEleve": ajd
      }
    };
    
    const options = {
      arrayFilters: [
        { "inner._id": ObjectID(idAssignement) , "inner.dateRendu": { $gte: ajd } },
        { "elem.idEleve": ObjectID(idEleve),"elem.rendu": false },
      ]
    };
    const professeur = await Professeur.updateOne(filter, update, options);

    if (!professeur || professeur.modifiedCount === 0) {
     return res.status(400).json({
        status: 400,
        message: "Le délai de rendu du devoir a été dépassé ou le devoir a déjà été rendu et validé.",
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
//  Fiche assignement d'un élève avec bouton rendre l'assignement
exports.ficheDetailAssignementEleve = async (idEleve,idAss, res) => {
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
          "matiere.assignements.detailAssignementEleve.idEleve": ObjectID(idEleve),
          "matiere.assignements._id": ObjectID(idAss)
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
    return result;
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};


// Performance d’un eleve dans un matiere / dans un niveau
exports.getPerformanceOneEleve = async (idEleve,idMatiere,idNiveau,idProf,order,res) => {
  try {
    let filter={};
    if(idEleve){
      filter={ "matiere.assignements.detailAssignementEleve.idEleve": ObjectID(idEleve)};
    };
    if(idProf){
      filter={ "_id": ObjectID(idProf)};
    };
    let filterGroupBy={}

    // filtre % au Niveau
    if(idNiveau){
      filter["matiere.idNiveau"] = Number(idNiveau);
      filterGroupBy["_id"] = "$matiere";
      filterGroupBy["moyenne"] ={ $avg: { $ifNull: ["$note", 0] } };

    }else{
      filterGroupBy["_id"] = "$niveau";
      filterGroupBy["moyenne"] ={ $avg: { $ifNull: ["$note", 0] } };
    }

    // filtre % à une Matiere
    if(idMatiere){
      filter["matiere._id"] = ObjectID(idMatiere);
      filterGroupBy["_id"] = "$assignement";
      filterGroupBy["moyenne"] ={ $avg: { $ifNull: ["$note", 0] } } ;

    }else{
      filterGroupBy["_id"] = "$matiere";
      filterGroupBy["moyenne"] = { $avg: { $ifNull: ["$note", 0] } } ;
    }

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
        $match: filter
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
      },
      {
        $group: filterGroupBy
      },{
        $addFields: {
          moyenne: { $round: ["$moyenne", 2] } 
        }
      }
    ];

    // filtre par ordre asc = 1 ou desc = -1
    if(order){
      pipeline.push({
        $sort: {
        "moyenne": Number(order)
        }
      });
    }

    const result = await Professeur.aggregate(pipeline);
    return result;
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

// get liste eleves
exports.getAllEleves = async (page,pageNumber,res) => {
  try {
    pageNumber = pageNumber || 2;
    page = page || 0;
    let data = await Eleve.find();
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
      data : await Eleve.find().select('-niveau').select('-mdp').skip(Number(page)*pageNumber).limit(Number(pageNumber))
    }
  } catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
};

// create eleve
exports.createEleve = async (eleve , res) => {
  try {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const onlySpaces =/^\s*$/;
    eleve.idEleve = Math.floor(Math.random() * (1000)) + 7;
    if(!eleve.email){
      throw new Error("Entrez un email");
    }else if(!regexEmail.test(eleve.email)){
      throw new Error("Veuillez saisir un email valide");
    }
    if(!eleve.nom){
      throw new Error("Entrez un nom");
    }else if(eleve.nom.match(onlySpaces) ){
      throw new Error("Le nom n'est pas valide");
    }
    if(!eleve.prenom){
      throw new Error("Entrez un prenom");
    }else if(eleve.prenom.match(onlySpaces) ){
      throw new Error("Le prenom n'est pas valide");
    }
    eleve.mdp = "motdepasse";
    eleve.niveau = [
      {
        "idNiveau": 1,
        "etatNiveau": false
      },
      {
        "idNiveau": 2,
        "etatNiveau": false
      },
      {
        "idNiveau": 3,
        "etatNiveau": true
      }
    ];
    let data = await Eleve.create(eleve);
    var mail = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "soarabe1234@gmail.com",
        pass: "xtypmdgsbwprqjiy",
      },
    });
    var mailOptions = {
      from: "soarabe1234@gmail.com",
      to: eleve.email,
      subject: "Inscription sur la plateforme gestion des assignements",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            background-color: #4CAF50;
            padding: 10px;
            border-radius: 8px 8px 0 0;
            color: white;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
          }
          .button-container {
            text-align: center;
            margin: 20px 0;
          }
          .button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue sur Gestion des Assignements</h1>
          </div>
          <div class="content">
            <p>Bonjour ${eleve.nom} ${eleve.prenom},</p>
            <p>Vous êtes désormais inscrit sur l'application <strong>Gestion des Assignements</strong> en tant qu'étudiant. Vous pouvez y accéder en cliquant sur le bouton ci-dessous.</p>
            <p>Utilisez votre adresse e-mail comme identifiant et le mot de passe provisoire suivant : <strong>motdepasse</strong>.</p>
            <p>Nous vous recommandons de changer ce mot de passe dès que possible en vous rendant sur la page de votre profil.</p>
            <div class="button-container">
              <a href="https://projet-assignements-front.onrender.com/" class="button">Cliquez ici pour vérifier!</a>
            </div>
            <p>Merci et bienvenue,</p>
            <p>L'équipe Gestion des Assignements</p>
          </div>
          <div class="footer">
            <p>© 2024 Gestion des Assignements. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>`
    };
    mail.sendMail(mailOptions, function (err, info) {
      if (err) {
        res.send(err);
      } else {
        return data;
      }
    });
    return data;
  } catch (err) {
    res.status(400).json({
      status: 500,
      message: err.message,
    });
  }
}

