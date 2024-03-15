var { Niveau } = require("../Model/Niveau");
var ObjectID = require("mongoose").Types.ObjectId;
var nodemailer = require("nodemailer");
const { Console } = require("console");
const { BSONSymbol } = require("mongodb");

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
