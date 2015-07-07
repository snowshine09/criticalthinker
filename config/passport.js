var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./auth');
var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
};
var User = require('../app/models/user');

module.exports = function(passport) {
  console.log("enter passport");
  passport.serializeUser(function(user, done) {
    console.log("serializeUser");
    done(null, user._id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy(function(username, password, done) {
    console.log("enter passport local strategy");
    process.nextTick(function() {
      User.findOne({
        'username': username, 
      }, function(err, user) {
        if (err) {
          console.log("error in user findOne");
          return done(err);
        }

        if (!user) {
          console.log('User Not Found with username '+username);
          return done(null, false);
        }
        var tempuser = user.toObject();
        if (tempuser.password != password) {

          console.log('%s %s is a %s.', tempuser.tempuser,tempuser.password,tempuser.email);
          console.log("see if it contains password " + tempuser.hasOwnProperty('password'));
          console.log('length is ');
          var temp = user.toObject();
          console.log("user info is" + user +" type is" + typeof user);
          console.dir("user.username is " + user.username);
          console.dir("temp.username is " + temp.username);
          console.dir("user['password'] is " + user['password']);
          console.log('Invalid Password'+user.password+' VS '+password);
          console.log("user info is" + user +" type is" + typeof user);
          return done(null, false);
        }
        return done(null, user.toObject());
      });
    });
  }));

  // passport.use('login', new LocalStrategy({
  //   passReqToCallback : true
  // }, function(req, username, password, done) { 
  //   // check in mongo if a user with username exists or not
  //   User.findOne({ 'username' :  username }, 
  //     function(err, user) {
  //       // In case of any error, return using the done method
  //       if (err)
  //         return done(err);
  //       // Username does not exist, log error & redirect back
  //       if (!user){
  //         console.log('User Not Found with username '+username);
  //         return done(null, false, 
  //           req.flash('message', 'User Not found.'));                 
  //       }
  //       console.dir('user is '+user);
  //       // User exists but wrong password, log the error 
  //       if (!user.password==password){
  //         console.log('Invalid Password');
  //         return done(null, false, 
  //           req.flash('message', 'Invalid Password'));
  //       }
  //       // User and password both match, return user from 
  //       // done method which will be treated like success
  //       return done(null, user);
  //     }
  //     );
  // }));

  // passport.use(new FacebookStrategy({

  //   // pull in our app id and secret from our auth.js file
  //   clientID        : configAuth.facebookAuth.clientID,
  //   clientSecret    : configAuth.facebookAuth.clientSecret,
  //   callbackURL     : configAuth.facebookAuth.callbackURL

  // },
  // function(token, refreshToken, profile, done){
  //   console.log(profile);
  //   process.nextTick(function() {
  //     User.findOne({'facebook.id': profile.id}, function(err, user) {

  //       if (err) {
  //         return done(err)
  //       }

  //       if (user) {
  //         return done(null, user);
  //       } else {
  //         var newUser = new User();
  //         newUser.facebook.id = profile.id;
  //         newUser.facebook.token = token;
  //         newUser.facebook.name = profile.displayName;
  //         newUser.facebook.email = profile.emails[0].value;

  //         newUser.save(function(err) {
  //             if (err) {
  //                 throw err;
  //             }

  //             return done(null, newUser);
  //         });
  //       }
  //     });
  //   });
  // }));
}
