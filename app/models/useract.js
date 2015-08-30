var mongoose = require('mongoose');

var ActSchema = mongoose.Schema({
  type: String,
  topic: String,
  username: String,
  content: String,
  time:  { type : Date, default: Date.now }
}, {collection:"useract"});

module.exports = mongoose.model('Useract', ActSchema);
