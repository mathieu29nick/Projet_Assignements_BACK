var Professeur = require("../Repository/Professeur");
var Eleve = require("../Repository/Eleve");
var Admin = require("../Repository/Admin");

exports.login = async (req, res) => {
    try {
      const prof = await Professeur.login(req.body.email, req.body.mdp, res);
      if (prof) {
        res.status(200).json({ type_user: "professeur", utilisateur: prof });
      } else {
        const etudiant = await Eleve.login(
          req.body.email,
          req.body.mdp,
          res
        );
        if (etudiant) {
          res
            .status(200)
            .json({ type_user: "etudiant", utilisateur: etudiant });
        } else {
            const admin = await Admin.login(
                req.body.email,
                req.body.mdp,
                res
              );
              if (admin) {
                res
                  .status(200)
                  .json({ type_user: "admin", utilisateur: admin });
              } else {
                res.status(400).json({
                  status: 400,
                  message: "Email ou mot de passe incorrect. Veuillez réessayer.",
                });
              }
        }
      }
    } catch (err) {}
  };