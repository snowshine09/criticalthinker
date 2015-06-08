var mongoose = require('mongoose');

var proconSchema = mongoose.Schema({
  topic: String,
  pro:[{
      content: String,
      support: [{
        content: String
      }]
    }]
  ,
  con: [{
      content: String,
      support: [{
        content: String
      }]
    }]

},{collection: 'procon'});

module.exports = mongoose.model('ProCon', proconSchema);
