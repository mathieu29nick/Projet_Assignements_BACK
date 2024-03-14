// Connection à MongoDB avec Mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Nick:Kalisi61@cluster0.xadnecb.mongodb.net/PROJET_Assignement?retryWrites=true&w=majority&appName=Cluster0',
{ 
  useNewUrlParser: true,
  useUnifiedTopology: true
});
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {console.log("Connection MongoDB Atlas: OK!")});


