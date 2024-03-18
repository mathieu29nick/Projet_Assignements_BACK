const professeurRepository = require("../Repository/Professeur");

exports.getProfesseur = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await professeurRepository.getProfesseur(),
    });
  } catch (err) {}
};

exports.listeMatiereProf = async ( req, res ) => {
  try {
    res.status(200).json({
      status: 200,
      data: await professeurRepository.listeMatiereProf(req.query.idProf, res),
    });
  } catch (err) {}
}