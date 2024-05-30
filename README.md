# Assignements BACK (MBDS Madagascar 2024 - Express JS)

Création des fonctionnalités et des APIs REST 

## Membres du groupe
    1. RAKOTOMANANA Nick Mathieu Andrianina - numéro (23)
    2. RANDRIAMAMBOLA Soatoavina Koloina Ornella - numéro (36)

## Lancement du projet
1. Cloner le repository `https://github.com/mathieu29nick/Projet_Assignements_BACK`
2. Ouvrer un terminal et installer les dependances avec la commande `npm i` ou `npm install`
3. Dans le terminal, utilisé la commande  `npm start` ou `nodemon start` pour démarer l'application

## Le Projet

### Matériel/Outils/Site(s) pour aider à la réalisation
1. Express JS
2. MongoDB
3. MongoDB Compass
4. Postman pour les tests APIs
3. ChatGPT et Stack OverFlow

### APIs que nous avons crée
1. Login (gestion des utilisateurs)
2. Gestion Token avec JWT
3. CRUD Professeur (Ajout, Liste)
4. CRUD Etudiant (Ajout, Liste)
5. CRUD Matière (Ajout, Liste)
6. CRUD Niveau (Liste)
7. Liste des matières d'un professeur
8. Liste des assignements filtrée par matière pour un professeur
9. Ajout d'un nouveau assignement dans une matière
10. Fiche d'un assignement avec des liens vers les assignements de tous les étudiants
11. Liste detail des assignements d'un élève
12. Fiche assignement d'un élève
13. Ajout note et remarque d'un assignement
14. Validation des devoirs rendu par les élèves
15. Liste des assignements des élèves filtrée par le status du devoir,la date rendu se l'assignement par l'élève, le niveau  d étude et par matière
16. Rendre un/des assignement(s) (02 choix possibles)
17. Performance d un élèvedans une matière/niveau
18. Liste des assignements rendus pas encore validé par le professeur selon ses matières
19. Changer le status d'un assignement en RENDU
20. Modification d'un assignement

### Script pour la création des données et insertion dans la base MongoDB
Nous avons crée un script pour générer et insérer des données dans notre base donnée et à noter que nous avons pris quelques codes sur chatGPT


        db.createCollection("Professeur");
        // Fonction pour générer un ID unique
        function generateId() {
            return Math.floor(Math.random() * 10000);
        }

        // Fonction pour générer une date aléatiore dans une certaine fourchette
        function randomDate(start, end) {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }

        function randomBetween(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var tabIdEleve=[
            {idEleve: "65f368feee5b842539b2c5e8", id:1},
            {idEleve: "65f368feee5b842539b2c5e9",id:2},
            {idEleve: "65f368feee5b842539b2c5ea",id:3},
            {idEleve: "65f368feee5b842539b2c5eb",id:4},
            {idEleve: "65f368feee5b842539b2c5ec",id:5},
            {idEleve: "65f368feee5b842539b2c5ed",id:6},
            {idEleve: "65f368ffee5b842539b2c5ee",id:7},
            {idEleve: "65f368ffee5b842539b2c5ef",id:8},
            {idEleve: "65f368ffee5b842539b2c5f0",id:9},
            {idEleve: "65f368ffee5b842539b2c5f1",id:10}
        ]

        // Liste des matières pour chaque professeur
        var profSubjects = [
            // Prof_1
            [
                { idNiveau: 1, libelle: "Conception de logiciels", dateRendu : ["2022-10-12","2022-11-05","2022-12-12"] },
                { idNiveau: 1, libelle: "Gestion de projets informatiques",dateRendu : ["2022-05-25","2022-08-20","2022-10-13"] },
                { idNiveau: 1, libelle: "Méthodes formelles",dateRendu : ["2022-05-01","2022-06-08","2022-09-05"] },
                { idNiveau: 3, libelle: "Programmation parallèle",dateRendu : ["2024-02-14","2024-02-19","2024-04-06"] },
                { idNiveau: 3, libelle: "Architecture des microservices",dateRendu : ["2024-02-12","2024-03-20","2024-03-25"] },
                { idNiveau: 3, libelle: "Infographie",dateRendu : ["2024-04-10","2024-04-11","2024-05-20"] }
            ],
            // Prof_2
            [
                { idNiveau: 1, libelle: "Mathématiques",dateRendu : ["2022-03-10","2022-04-08","2022-10-10"] },
                { idNiveau: 1, libelle: "Cryptographie",dateRendu : ["2022-04-08","2022-04-10","2022-06-19"] },
                { idNiveau: 2, libelle: "Interface homme-machine",dateRendu : ["2023-10-12","2023-10-18","2023-12-01"] },
                { idNiveau: 2, libelle: "Calcul parallèle et distribué",dateRendu : ["2023-02-12","2023-03-08","2023-06-06"] },
                { idNiveau: 2, libelle: "Programmation fonctionnelle",dateRendu : ["2023-11-12","2023-11-13","2023-11-14"] },
                { idNiveau: 3, libelle: "Développement de jeux vidéo",dateRendu : ["2024-05-06","2024-05-12","2024-05-19"] },
                { idNiveau: 3, libelle: "Réalité augmentée",dateRendu : ["2024-04-09","2024-04-18","2024-04-23"] }
            ],
            // Prof_3
            [
                { idNiveau: 1, libelle: "Réseaux informatiques",dateRendu : ["2022-10-13","2022-11-15","2022-12-18"] },
                { idNiveau: 2, libelle: "Sécurité informatique",dateRendu : ["2023-06-06","2023-06-20","2023-07-15"] },
                { idNiveau: 2, libelle: "Bases de données",dateRendu : ["2023-04-04","2023-05-15","2023-06-29"] },
                { idNiveau: 2, libelle: "Ingénierie logicielle",dateRendu : ["2023-10-12","2023-11-05","2023-12-12"] },
                { idNiveau: 3, libelle: "Systèmes embarqués",dateRendu : ["2024-04-02","2024-04-03","2024-05-01"] },
                { idNiveau: 2, libelle: "Réseaux neuronaux",dateRendu : ["2023-05-10","2023-05-11","2022-05-12"] },
                { idNiveau: 1, libelle: "Systèmes distribués",dateRendu : ["2022-10-12","2022-11-05","2022-12-12"] },
                { idNiveau: 1, libelle: "Systèmes multi-agents",dateRendu : ["2022-02-15","2022-03-25","2022-04-30"] }
            ],
            //Prof 4
            [
                { idNiveau: 3, libelle: "Programmation informatique",dateRendu : ["2024-04-12","2024-04-30","2024-06-12"] },
                { idNiveau: 1, libelle: "Programmation orientée objet",dateRendu : ["2022-01-12","2022-03-05","2022-07-12"] },
                { idNiveau: 3, libelle: "Développement web",dateRendu : ["2024-03-31","2024-05-05","2024-06-12"] },
                { idNiveau: 3, libelle: "Intelligence artificielle",dateRendu : ["2024-03-30","2024-04-05","2024-05-12"] },
                { idNiveau: 3, libelle: "Réalité virtuelle et augmentée",dateRendu : ["2024-03-27","2024-04-25","2024-06-26"] },
                { idNiveau: 3, libelle: "Traitement du langage naturel",dateRendu : ["2024-04-12","2024-04-20","2024-05-22"] },
                { idNiveau: 2, libelle: "Internet des objets (IoT)",dateRendu : ["2023-01-12","2023-05-05","2023-07-12"] }
            ],
            // Prof_5
            [
                { idNiveau: 3, libelle: "Big Data",dateRendu : ["2024-03-22","2024-04-15","2024-05-22"] },
                { idNiveau: 2, libelle: "Analyse de données en temps réel",dateRendu : ["2023-10-12","2023-11-05","2023-12-12"] },
                { idNiveau: 2, libelle: "Systèmes multi-agents",dateRendu : ["2023-02-12","2023-05-25","2023-06-30"] },
                { idNiveau: 2, libelle: "Déploiement automatisé",dateRendu : ["2023-06-12","2023-07-15","2023-12-01"] },
                { idNiveau: 2, libelle: "Traitement du signal",dateRendu : ["2023-04-13","2023-06-10","2023-08-09"] },
                { idNiveau: 3, libelle: "Modélisation et simulation",dateRendu : ["2024-04-01","2024-05-01","2024-06-01"] },
                { idNiveau: 3, libelle: "Systèmes de contrôle de version",dateRendu : ["2024-04-11","2024-04-30","2024-05-30"] }
            ]
        ];

        function randomBetween(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function generateRemarque(note) {
            if (note >= 7 && note <= 9) {
                return "Médiocre!";
            } else if (note >= 10 && note <= 12) {
                return "Assez Bien!";
            } else if (note > 12 && note <= 15) {
                return "Bien!";
            } else if (note >= 16 && note <= 20){
                return "Trés Bien!";
            }else{
                return "";
            }
        }

        function randomDateBeforeOrEqual(earliestDateString) {
            const earliestDate = new Date(earliestDateString);
            const earliestTimestamp = earliestDate.getTime();
            const twoMonthsBeforeTimestamp = earliestTimestamp - (60 * 24 * 60 * 60 * 1000);
            const randomTimestamp = Math.floor(Math.random() * (earliestTimestamp - twoMonthsBeforeTimestamp + 1)) + twoMonthsBeforeTimestamp;
            const randomDate = new Date(randomTimestamp);
            return randomDate;
        }


        // Fonction pour générer des assignements
        function generateAssignments(subject, idNiveau, dateRendu) {
            let assignments = [];
            for (let i = 0; i < 3; i++) {
                assignments.push({
                    _id: ObjectId(),
                    dateRendu: new Date(dateRendu[i]), 
                    nomAssignement: `Exercice '${subject}' Numéro ${i + 1}`, 
                    description: `Description de l'exercice ${i + 1} concernant '${subject}'`,
                    statut: idNiveau !== 3 ? true : false,
                    detailAssignementEleve: tabIdEleve.map(eleve => {
                        const note = idNiveau !== 3 ? randomBetween(7, 20) : null;
                        return {
                            idEleve: ObjectId(eleve.idEleve),
                            note: note,
                            remarque: generateRemarque(note),
                            dateRenduEleve: idNiveau !== 3 ? randomDateBeforeOrEqual(dateRendu[i]) : null,
                            rendu: idNiveau !== 3 ? true : false
                        };
                    })
                });
            }
            return assignments;
        }


        // Génération des données pour chaque professeur
        for (let i = 0; i < profSubjects.length; i++) {
            let professor = {
                _id: ObjectId(),
                idProf: i + 1,
                nom: `Prof_${i + 1}`,
                email: `prof${i + 1}@example.com`,
                mdp: "motdepasse",
                photo: "photosProf.jpg",
                matiere: []
            };

            profSubjects[i].forEach(subject => {
                let matiere = {
                    _id: ObjectId(),
                    idMatiere: randomBetween(112, 152),
                    libelle: subject.libelle,
                    idNiveau: subject.idNiveau,
                    photo : "htttps://photosMatiere.jpg",
                    assignements: generateAssignments(subject.libelle, subject.idNiveau,subject.dateRendu)
                };
                professor.matiere.push(matiere);
            });

            db.Professeur.insertOne(professor);
        }

