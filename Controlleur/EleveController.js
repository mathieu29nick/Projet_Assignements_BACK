const eleveRepository = require("../Repository/Eleve");

exports.getEleve = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await eleveRepository.getEleve(),
    });
  } catch (err) {}
};

exports.updateEleve = async (req, res) => {
  eleveRepository
    .updateEleve(req.params.eleve_id, req.body, res)
    .then((result) => res.status(200).json({ result }))
    .catch();
};

exports.getListeDetailAssignement = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await eleveRepository.getListeDetailAssignement(req.query.idEleve,req.query.idMatiere,req.query.idNiveau,req.query.orderDateRendu,req.query.etat,req.query.page,req.query.pageNumber,res),
    });
  } catch (err) {}
};

exports.getOneAssignementEleve = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await eleveRepository.getOneAssignementEleve(req.query.idAssignement,req.query.idEleve,res),
    });
  } catch (err) {}
};

exports.rendreDevoir = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await eleveRepository.rendreDevoir(req.params.idAssignement,req.params.idEleve,res),
    });
  } catch (err) {}
}

exports.ficheDetailAssignementEleve = async (req, res) => {
  eleveRepository
    .ficheDetailAssignementEleve(req.params.idEleve,req.params.idAss, res)
    .then((result) => res.status(200).json({ result }))
    .catch();
};

exports.getPerformanceOneEleve = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await eleveRepository.getPerformanceOneEleve(req.query.idEleve,req.query.idMatiere,req.query.idNiveau,req.query.order,res),
    });
  } catch (err) {}
};