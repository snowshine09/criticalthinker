var mongoose = require('mongoose');

var chatmsgSchema = mongoose.Schema({
  clientId: String,
  topic: String,
  username: String,
  text: String,
  // msgID: String,
  time:  { type : Date, default: Date.now }
}, {collection:"chatmsg"});

module.exports = mongoose.model('Chatmsg', chatmsgSchema);
