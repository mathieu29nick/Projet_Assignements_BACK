var Professeur = require("../Repository/Professeur");
var Eleve = require("../Repository/Eleve");
var Admin = require("../Repository/Admin");

exports.login = async (req, res) => {
    try {
      if(!req.body.email || !req.body.mdp){
        return res.status(400).json({ message: 'Veuillez entrer un email ou un mot de passe!' })
      } else{
        const prof = await Professeur.login(req.body.email, req.body.mdp, res);
        if (prof) {
          res.status(200).json({ type_user: "professeur", utilisateur: prof.prof , token : prof.token});
        } else {
          const etudiant = await Eleve.login(
            req.body.email,
            req.body.mdp,
            res
          );
          console.log("etudiant",etudiant);
          if (etudiant) {
            res
              .status(200)
              .json({ type_user: "etudiant", utilisateur: etudiant.eleve , token : etudiant.token});
          } else {
              const admin = await Admin.login(
                  req.body.email,
                  req.body.mdp,
                  res
                );
                if (admin) {
                  res
                    .status(200)
                    .json({ type_user: "admin", utilisateur: admin.admin, token : admin.token });
                } else {
                  res.status(400).json({
                    status: 400,
                    message: "Email ou mot de passe incorrect. Veuillez réessayer.",
                  });
                }
          }
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  };