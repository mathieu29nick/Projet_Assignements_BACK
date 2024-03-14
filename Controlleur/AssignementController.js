const assignementRepository = require("../Repository/Assignement");

exports.getAssignement = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await assignementRepository.getAssignement(),
    });
  } catch (err) {}
};