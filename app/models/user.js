var mongoose = require('mongoose'),
bcrypt = require('bcrypt-nodejs');


var userSchema = mongoose.Schema({
    username: String,
    email: String,
    avatarname: String,
    password: String,
    lastSnap: [{
        topic: String,
        content: String
    }],
    topics: [String],
    role: String
}, {collection:"user"});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
