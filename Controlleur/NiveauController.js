const niveauRepository = require("../Repository/Niveau");

exports.getNiveau = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await niveauRepository.getNiveau(),
    });
  } catch (err) {}
};

exports.insertNiveau = async (req, res) => {
  niveauRepository
    .insertNiveau(req.body, res)
    .then((result) => res.status(200).json({ result }))
    .catch();
};

exports.deleteNiveau = async (req, res) => {
  niveauRepository
    .deleteNiveau(req.params.idNiveau, res)
    .then((result) => res.status(200).json({ result }))
    .catch();
};

exports.updateNiveau = async (req, res) => {
  niveauRepository
    .updateNiveau(req.params.idNiveau, req.body, res)
    .then((result) => res.status(200).json({ result }))
    .catch();
};