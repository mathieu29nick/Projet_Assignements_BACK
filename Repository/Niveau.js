var { Niveau } = require("../Model/Niveau");

// liste des niveaux
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

// insertion un niveau
exports.insertNiveau = async (body, res) => {
  try {
    let data = await Niveau.create(body);
    return data;
  } catch (err) {
    res.status(404).json({ msg: err });
  }
};

// delete un niveau
exports.deleteNiveau = async (idNiveau, res) => {
  try {
    let data = await Niveau.findOneAndDelete({
      idNiveau: idNiveau,
    });
    return data;
  } catch (err) {
    res.status(404).json({ msg: err });
  }
};

// update un niveau
exports.updateNiveau = async (idNiveau, body, res) => {
  try {
    let data = await Niveau.findOneAndUpdate({ idNiveau: idNiveau }, body, {
      new: true,
      runValidators: true,
    });
    return data;
  } catch (err) {
    res.status(404).json({ msg: err });
  }
};