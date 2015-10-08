var mongoose = require('mongoose');

var proconSchema = mongoose.Schema({
    topic: String,
    content: {
        pro: [{
            content: String,
            support: [{
                content: String
            }]
        }],
        con: [{
            content: String,
            support: [{
                content: String
            }]
        }]
    },
    time: {
        type: Date,
        default: Date.now
    }

}, {
    collection: 'argv'
});

module.exports = mongoose.model('argv', proconSchema);
