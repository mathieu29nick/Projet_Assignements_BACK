var { Niveau } = require("../Model/Niveau");

exports.getNiveau = async (res) => {
  try {
    let data = await Niveau.find();
    return data;
  } catch (err) {
        res.status(400).json({
        status: 400,
        message: err.message,
    });
  }
};
