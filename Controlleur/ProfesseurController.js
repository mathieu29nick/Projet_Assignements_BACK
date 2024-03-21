const professeurRepository = require("../Repository/Professeur");

exports.getProfesseur = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await professeurRepository.getProfesseur(),
    });
  }
  catch (err) {}
};

exports.listeMatiereProf = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await professeurRepository.listeMatiereProf(req.query.idProf, res),
    });
  }
  catch (err) {}
};
exports.listeMatiere = async (req, res) => {
  try {
    let posts = await professeurRepository.listeMatiere(req.query.page, req.query.pageNumber, res);
    res.status(200).json({
      status: 200,
      data: posts,
    });
  }
  catch (err) {}
};

exports.insertMatiere = async (req, res) => {
  professeurRepository
    .insertionMatiere(req.params.idProf, req.body.libelle, req.body.idNiveau, req.body.photo, res)
    .then((result) => res.status(200).json({result}))
    .catch();
};

exports.insertionAssignementMatiere = async (req, res) => {
  professeurRepository
    .insertionAssignementMatiere(req.params.idMatiere, req.body.dateRendu, req.body.nomAssignement, req.body.description, res)
    .then((result) => res.status(200).json({result}))
    .catch();
};

exports.getOneAssignementModifierNote = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await professeurRepository.getOneAssignementModifierNote(req.params.idAss, req.params.idEleve, req.body.note, req.body.remarque, res),
    });
  }
  catch (err) {}
};
exports.getAllProf = async (req, res) => {
  try {
    let data = await professeurRepository.getAllProf(req.query.page, req.query.pageNumber, res);
    res.status(200).json({
      status: 200,
      data: data,
    });
  }
  catch (err) {}
};

exports.createProf = async (req, res) => {
  try {
    let data = await professeurRepository.createProf(
      {
        email: req.body.email,
        nom: req.body.nom,
        mdp: req.body.mdp,
        photo: req.body.photo,
      },
      res,
    );
    res.status(200).json({
      status: 200,
      data: data,
    });
  }
  catch (err) {}
};

exports.updateProf = async (req, res) => {
  try {
    let data = await professeurRepository.updateProf(
      req.params.idProf,
      {
        email: req.body.email,
        nom: req.body.nom,
      },
      res,
    );
    res.status(200).json({
      status: 200,
      data: data,
    });
  }
  catch (err) {}
};

exports.listeAssignementProf = async (req, res) => {
  try {
    let data = await professeurRepository.listeAssignementProf(req.query.idProf, req.query.matiere, req.query.page, req.query.pageNumber, res);
    res.status(200).json({
      status: 200,
      data: data,
    });
  }
  catch (err) {}
};

exports.getOneAssignement = async (req,res) => {
  try {
    let data = await professeurRepository.getOneAssignement(req.query.idAssignement, res);
    res.status(200).json({
      status: 200,
      data: data,
    });
  }
  catch (err) {}
}
