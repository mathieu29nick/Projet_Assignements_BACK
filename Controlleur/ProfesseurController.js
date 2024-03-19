const professeurRepository = require("../Repository/Professeur");

exports.getProfesseur = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await professeurRepository.getProfesseur(),
    });
  } catch (err) {}
};

exports.listeMatiere = async (req, res) => {
  try {
    let posts = await professeurRepository.listeMatiere(req.query.page, req.query.pageNumber, res);
    res.status(200).json({
      status: 200,
      data: posts,
    });
  } catch (err) {}
};

exports.insertMatiere = async (req, res) => {
  professeurRepository
    .insertionMatiere(req.params.idProf,req.body.libelle,req.body.idNiveau,req.body.photo,res)
    .then((result) => res.status(200).json({ result }))
    .catch();
};


