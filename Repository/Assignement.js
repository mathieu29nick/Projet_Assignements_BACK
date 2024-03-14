var { Assignement } = require("../Model/Assignement");
var ObjectID = require("mongoose").Types.ObjectId;
var nodemailer = require("nodemailer");
const { Console } = require("console");
const { BSONSymbol } = require("mongodb");

exports.getAssignement = async (res) => {
  try {
    let data = await Assignement.find();
    return data;
  } catch (err) {
        res.status(400).json({
        status: 400,
        message: err.message,
    });
  }
};
