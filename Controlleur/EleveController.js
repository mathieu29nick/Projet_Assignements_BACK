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