const eleveRepository = require("../Repository/Eleve");

exports.getEleve = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await eleveRepository.getEleve(),
    });
  } catch (err) {}
};