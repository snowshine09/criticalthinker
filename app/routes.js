var ProCon = require('../app/models/procon.js'), Chatmsg = require('../app/models/chatmsg.js');
var User = require('./models/user.js');
var timeSince = function(date) {
  if (typeof date !== 'object') {
    date = new Date(date);
  }
  console.log("enter timeSince function");
  var seconds = Math.floor((new Date() - date) / 1000);
  var intervalType;

  var interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    intervalType = 'year';
  } else {
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      intervalType = 'month';
    } else {
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) {
        intervalType = 'day';
      } else {
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
          intervalType = "hour";
        } else {
          interval = Math.floor(seconds / 60);
          if (interval >= 1) {
            intervalType = "minute";
          } else {
            interval = seconds;
            intervalType = "second";
          }
        }
      }
    }
  }

  if (interval > 1 || interval === 0) {
    intervalType += 's';
  }

  return interval + ' ' + intervalType + 'ago';
};
module.exports = function(app, passport) {
  app.get('/', function(req, res) {
    res.render('login.ejs');
    // res.render('index.ejs', {
    //   user: req.user | null,
    //   chats: null
    // });
  });

  app.get('/all_procons', function(req, res) {
    ProCon.find({}, function(err, data) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data));
      console.log("this is /all_procons stringified data: " + data);
    });
  });

  app.get('/chathistory', function(req, res) {
    // Chatmsg.find({}, function(err, data) {

    //   // var template_para = {};
    //   // template_para['chats'] = data;

    //   // res.render('chathistory.ejs',template_para);
    //   console.log("this is /Chatmsg stringified data: " + data);
    //   var ejs = require('ejs');
    //   // data.username = req.user.toObject().username;

    //   var result = ejs.render('chathistory.ejs', {chats:data});
    //   // document.getElementByClassName('chathistory-dock-right content visible').innerHTML = result;
    //   console.log("result is " + result);
    //   res.setHeader('Content-Type', 'application/json');
    //   res.send(JSON.stringify(result));
    // });
  });
  
  app.get('/all_procons/:topic', function(req, res) {
   var topic = req.params.topic;
   ProCon.findOne({'topic': topic}, function(err, data){
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
    console.log("this is /all_procons/:topic(get) stringified data: " + data);
    console.log(data._id);
    delete data._id;
    console.log(data._id);
  });
 });
  
  app.put('/all_procons/:topic', function(req, res) {
    console.log('entering app.put');
    var topic = req.params.topic;
    var data = req.body;
    console.log('in server put');
    console.log(req.body);
    console.log(topic);
    if(data._id != undefined){
      console.log(data._id);
      delete data._id;
      console.log(data._id);
    }
    
    ProCon.update({'topic':topic}, data, {upsert: true}, function(err, raw){
      if(err){
        console.log('error in updating');
        console.log(err);
      }
      console.log('The raw response from Mongo was ', raw);
    });
    console.log("this is /all_procons/:topic(put) stringified data: " + data);
    res.send(200, {"youKnow":"putter"});
  });

  //retrieve saved chat history
  app.get('/chathistory/:topic', function(req, res){
    var topic = req.params.topic;
    Chatmsg.find({'topic':topic},function(err,data){
      // Object.defineProperty(data, 'username', {
      //     value: req.user.toObject().username,
      //     writable: true
      //   });
      console.dir(data);
      for(var i = 0; i<data.length; i++){
        // console.log('loop ING'+typeof data+' ' +timeSince(data[i].time));
        // console.dir(req.user.toObject());
        var temp = timeSince(data[i].time);
        Object.defineProperty(data[i], 'elapsed', {
          value: temp,
          writable: true
        });
        Object.defineProperty(data[i], 'loginname', {
          value: req.user.toObject().username,
          writable: true
        });
        // console.log('returned func value from timeSince: '+temp);
        
        // // Object.assign(data[i].time, timeSince(data[i].time));
        // console.log("this is after data[i] changing"+data[i].time);
      }
      console.log('data[0].time = '+data[0].time);
      var result = res.render('chathistory.ejs', {chats:data});
      console.log("data is " + data);
      console.dir(result);
      // res.setHeader('Content-Type', 'application/json');
      // // res.send(JSON.stringify(result));
      // res.send(result);
      console.log("this is /chathistory/:topic(get) stringified data: " + data);
    });
});

app.get('/top_names', function(req, res) {

});

app.get('/login', function(req, res) {
  res.render('login.ejs');
});

app.get('/signup', function(req, res) {
  res.render('signup.ejs');
});

app.get('/changetemplate',function(req, res){
  res.render('template_index.ejs',{
    user: req.user
  });
});
app.get('/instructor', function(req, res) {
  res.render('instructor.ejs');
});

app.get('/qna', function(req, res){
  res.render('QnA.ejs', {question_idxs: req.q_idxs});   
});

app.get('/proncon', function(req, res){
  res.render('index.ejs', {
    user: req.user
  });
});

  // Facebook authentication
  // app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

  // app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  //   successRedirect : '/home',
  //   failureRedirect : '/login'
  // }));

app.post('/userlogin', function(req, res, next){
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/home');
    });
  })(req, res, next);
});

app.get('/home', isLoggedIn, function (req, res) {
  console.log("home in router is " + req.user);
  res.render('index.ejs', {
    user: req.user.toObject()
  });
});

app.get('/getusername',function(req, res){
  var usrname = req.user.toObject().username;
  res.send({username:usrname});
})

app.get('/checkExistAvatar', function(req, res){
  User.findOne({username:req.user.toObject().username}, 'avatarname',function(err, user){
    if(err) handleError(err);
    var resp = {};
    // console.log("raw from CheckAvatar is "+user);
    // console.dir(user);
    if(user.toObject().avatarname && typeof user.toObject().avatarname === "string"){
      resp.exist = true;
      resp.avatarname = user.toObject().avatarname;
      res.send({resp:resp});
    }
    else {
      resp.exist = false;
      res.send({resp:resp});
    }
  });
})

app.get('/SaveScreenName/:avatarname', function(req,res) {
  console.log("req.user is "+ req.user);
  console.log("saving screenName "+req.user.toObject().username+ " to " + req.params.avatarname);
  var usrname = req.user.toObject().username;
  // User.findOne({
  //   'username': req.user.toObject().username, 
  // }, function(err, user) {
  //   if (err) {
  //     console.log("error in user findOne");
  //     return done(err);
  //   }

  //   if (!user) {
  //     console.log('User Not Found with username '+username);
  //     return done(null, false);
  //   }
  //   // user.avatarname = req.params.avatarname;
  //   Object.defineProperty(user, 'avatarname', {
  //     value: req.params.avatarname,
  //     writable: true
  //   });
  //   user.save(function (err) {
  //     if (err) return console.log(err);
  //     console.log("save sucess");
  //     res.send(user);
  //   });

  // });
  User.update({'username':req.user.toObject().username},{avatarname:req.params.avatarname},{upsert:true},function(err,raw){
    if(err) return handleError(err);
    console.log('The  updated raw response from Mongo was ', raw);
    res.send({username:usrname});
  });

});

app.get('/logout', function(req, res) {
  console.log('log out');
  req.logout();
  res.redirect('/login');
});


}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function timeSince(date) {
  if (typeof date !== 'object') {
    date = new Date(date);
  }
  console.log("enter timeSince function");
  var seconds = Math.floor((new Date() - date) / 1000);
  var intervalType;

  var interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    intervalType = 'year';
  } else {
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      intervalType = 'month';
    } else {
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) {
        intervalType = 'day';
      } else {
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
          intervalType = "hour";
        } else {
          interval = Math.floor(seconds / 60);
          if (interval >= 1) {
            intervalType = "minute";
          } else {
            interval = seconds;
            intervalType = "second";
          }
        }
      }
    }
  }

  if (interval > 1 || interval === 0) {
    intervalType += 's';
  }

  return interval + ' ' + intervalType + " ago";
};
