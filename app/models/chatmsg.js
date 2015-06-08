var mongoose = require('mongoose');

var chatmsgSchema = mongoose.Schema({
  clientId: String,
  context: String,
  text: String,
  // msgID: String,
  time:  { type : Date, default: Date.now }

}, {collection: "chatmsg"});

module.exports = mongoose.model('Chatmsg', chatmsgSchema);
