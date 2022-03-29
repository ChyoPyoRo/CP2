const dbConfig = require('./config/dev');
const mongoose = require('mongoose'); // Use Node.js native promise 
mongoose.Promise = global.Promise;
const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.tutorial = require('./models/user')(mongoose);

module.exports = db;
