var { Admin } = require("../Model/Admin");
var config = require('../config/SECRET');
var jwt = require('jsonwebtoken');

exports.getAdmin = async (res) => {
  try {
    let data = await Admin.find();
    return data;
  } catch (err) {
        res.status(400).json({
        status: 400,
        message: err.message,
    });
  }
};

exports.login = async (email, mdp, res) => {
  try {
    let admin = await Admin.findOne({ email: email,mdp:mdp });
    if (!admin) {
      return res.status(404).json({
        status: 404,
        message: "Identifiant non trouvé!",
      });
    }
    
    const payload = {
      admin: {
        id: admin.idAdmin,
      },
    };

    jwt.sign(
      payload,
      config.secret,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        console.log("Access TOKEN :", token);
        res.json({ token });
      }
    );
    return admin;
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Erreur serveur.",
    });
  }
};

