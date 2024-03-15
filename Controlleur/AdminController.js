const adminRepository = require("../Repository/Admin");

exports.getAdmin = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      data: await adminRepository.getAdmin(),
    });
  } catch (err) {}
};