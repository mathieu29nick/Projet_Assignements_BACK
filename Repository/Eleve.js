var { Eleve } = require("../Model/Eleve");
var ObjectID = require("mongoose").Types.ObjectId;
var nodemailer = require("nodemailer");
const { Console } = require("console");
const { BSONSymbol } = require("mongodb");

exports.getEleve = async (res) => {
  try {
    let data = await Eleve.find();
    return data;
  } catch (err) {
        res.status(400).json({
        status: 400,
        message: err.message,
    });
  }
};

exports.login = async (mail, mdp, res) => {
  try {
    const data = await Eleve.findOne({ email: mail, mdp: mdp });
    return data;
  } catch (err) {
    res.status(400).json({
      status: 400,
      message: err.message,
    });
  }
};

