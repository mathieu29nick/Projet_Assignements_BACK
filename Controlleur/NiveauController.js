const niveauRepository = require("../Repository/Niveau");

exports.getNiveau = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await niveauRepository.getNiveau(),
    });
  } catch (err) {}
};