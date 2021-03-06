var ProCon = require('../app/models/procon.js'),
  Chatmsg = require('../app/models/chatmsg.js'),
  UserAct = require('../app/models/useract.js'),
  User = require('./models/user.js'),
  Argv = require('./models/argv.js');

var timeSince = function(date) {
  if (typeof date !== 'object') {
    date = new Date(date);
  }
  // console.log("enter timeSince function");
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

  return interval + ' ' + intervalType.toString() + ' ago'.toString();
};

var daysdiff = function(firstDate, secondDate) {
  var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
  return diffDays;
}

var collapseItems = function(granularity, interact, items) {
  var ritems = {};
  switch (interact) {
    case 'userinput':
      for (key in items) { //for each user
        var cdate; // = new Date(items[key][0].time); 
        for (var i = 0; i < items[key].length; i++) { //items are edit entries per user
          var item = items[key][i];
          cdate = item.time.toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)'; //Wed Sep 09 2015 07:18:34 GMT-0400 (EDT)
          if (!ritems.hasOwnProperty(key)) {
            ritems[key] = {};
          }
          if (!ritems[key].hasOwnProperty(cdate)) {
            ritems[key][cdate] = {
              edit: item.edit,
              type: item.type,
              topic: item.topic,
              element: item.element
            };
          } else {
            ritems[key][cdate].edit += "||" + item.edit;
          }
        }
      }
      break;
    case 'cursorclick': //also works for idles status counts
      for (key in items) { //for each user
        var cdate; // = new Date(items[key][0].time); 
        for (var i = 0; i < items[key].length; i++) { //items are edit entries per user
          var item = items[key][i];
          cdate = item.time.toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)'; //Wed Sep 09 2015 07:18:34 GMT-0400 (EDT)
          if (!ritems.hasOwnProperty(key)) {
            ritems[key] = {};
          }
          if (!ritems[key].hasOwnProperty(cdate)) {
            ritems[key][cdate] = {
              clicks: 0,
              type: item.type,
              element: item.element
            };
          } else {
            ritems[key][cdate].clicks += 1;
          }
        }
      }
      break;
    case 'loggingtime':
      for (key in items) { //for each user
        var cdate; // = new Date(items[key][0].time); 
        for (var i = 0; i < items[key].length; i++) { //items are edit entries per user
          var item = items[key][i];
          cdate = item.start.toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)'; //Wed Sep 09 2015 07:18:34 GMT-0400 (EDT)
          if (!ritems.hasOwnProperty(key)) {
            ritems[key] = {};
          }
          if (!ritems[key].hasOwnProperty(cdate)) {
            ritems[key][cdate] = {
              start: " From " + item.start + " To " + item.end,
              range: Math.abs((item.start.getTime() - item.end.getTime()) / 1000 / 60)
            };
          } else {
            ritems[key][cdate].start += "||" + " From " + item.start + " To " + item.end;
            ritems[key][cdate].range += Math.abs((item.start.getTime() - item.end.getTime()) / 1000 / 60);
          }
        }
      }
      // for (key in items) {
      //   for (j=0;j<timepuser[key].length;j++) {
      //     userdate.push({username: key, time: new Date(timepuser[key][j].time), start: timepuser[key][j].start, end: timepuser[key][j].end, range: Math.abs((timepuser[key][j].start.getTime()-timepuser[key][j].end.getTime())/1000/60), type:"logged in"});
      //   }
      // }
      break;
    default:
      break;
  }
  return ritems;
}

Date.prototype.addDays = function(d) {
  return new Date(this.valueOf() + 864E5 * d);
};

Object.size = function(obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

var sortdate = function(a, b) {
  // Turn your strings into dates, and then subtract them
  // to get a value that is either negative, positive, or zero.
  return new Date(b.time) - new Date(a.time);
};
module.exports = function(app, passport) {
  app.get('/', isLoggedIn, function(req, res) {
    res.render('index.ejs', {
      user: req.user.toObject(),
      topics: req.user.toObject().topics
    });
  });

  app.put('/actsave', function(req, res) {
    var act = req.body;
    console.log("the req.body is");
    console.dir(act);
    console.log(Date.now());
    act.username = req.user.username;
    var newAct = new UserAct(act);
    newAct.save(function(err, nact) {
      if (err) {
        console.err(err);
        console.log("err occurs when saving new user act");
      }
      console.log("new useract added");
      console.log(Date.now());
    });
    res.send({
      "move": "act saved"
    });
  });



  app.get('/all_procons/:topic', function(req, res) {
    var topic = req.params.topic;
    ProCon.findOne({
      'topic': topic
    }, function(err, data) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data));
      console.log("this is /all_procons/:" + topic + "(get) stringified data: ");
    });
  });


  app.put('/all_procons/:topic', function(req, res) {
    console.log('entering app.put');
    var topic = req.params.topic;
    var data = req.body;
    console.log('in server put');
    console.log(req.body);
    console.log(topic);
    if (data._id != undefined) {
      console.log(data._id);
      delete data._id;
      console.log(data._id);
    }

    ProCon.update({
      'topic': topic
    }, data, {
      upsert: true
    }, function(err, raw) {
      if (err) {
        console.log('error in updating');
        console.log(err);
      }
      console.log('The raw response from Mongo was ', raw);
    });
    // User.findOne({'username':req.user.toObject().username}, function(err,record){
    //   if(err) {
    //     handleError(err);
    //     console.log("err: " + err);
    //   }
    //   record.lastSnap.forEach(function(item){
    //     if(item.topic == topic){
    //       console.log("data type is " + typeof data);
    //       item.content = data;
    //     }
    //     record.markModified('lastSnap');
    //     record.save(); 
    //   });
    // });
    console.log("this is /all_procons/:topic(put) stringified data: " + data);
    res.send(200, {
      "youKnow": "putter"
    });
  });

  app.get('/changetemplate', function(req, res) {
    res.render('template_index.ejs', {
      user: req.user
    });
  });

  app.put('/ChangeTopic', function(req, res) {
    var oldtopic = req.body.oldtopic,
      newtopic = req.body.newtopic;
    console.dir(req.body);
    console.log('changing topic in routes: topics are old and new' + oldtopic + newtopic);
    console.dir(req.user);
    var items = req.user.toObject().topics;
    var index = items.indexOf(oldtopic);
    if (index != -1) {
      if (newtopic) items[index] = newtopic;
      else items.splice(index, 1);
      console.log('this is-----' + newtopic);
      console.dir(items);
    } else {
      console.log("The user " + req.user.toObject().username + " does not have the updated old topic --- insert"); //aqeqwqeqeq
      items.push(newtopic);
    }

    req.user.topics = items;

    if (!newtopic) { //remove topic
      User.update({
        'topics': oldtopic
      }, {
        topics: items
      }, {
        upsert: false,
        multi: true
      }, function(err, raw) {
        if (err) {
          console.log("error:" + err);
          return handleError(err);
        }
        console.log('Removing User topic: The updated raw response from Mongo was ', raw);
      });
    } else {
      console.log('new topics are ');
      console.dir(items);
      ProCon.update({
        'topic': oldtopic
      }, {
        'topic': newtopic
      }, {
        upsert: false,
        multi: true
      }, function(err, raw) {
        if (err) return handleError(err);
        console.log('Updating PROCON topic: The updated raw response from Mongo was ', raw);
      });
      User.update({
        'topics': oldtopic
      }, {
        'topics': items
      }, {
        upsert: false,
        multi: true
      }, function(err, raw) {
        if (err) return handleError(err);
        console.log('Updating UserTopic The updated raw response from Mongo was ', raw);
      });
      if (!oldtopic) {
        User.update({}, {
          'topics': items
        }, {
          upsert: false,
          multi: true
        }, function(err, raw) {
          if (err) return handleError(err);
          console.log("added new topic and propogated to all " + raw.n);
        });
        var newProCon = new ProCon({
          topic: newtopic,
          pro: [{
            content: "",
            support: [{
              content: ""
            }]
          }],
          con: [{
            content: "",
            support: [{
              content: ""
            }]
          }],
          synthesis: [{
            content: "",
            reference: []
          }]
        });
        newProCon.save(function(err, procon) {
          if (err) {
            console.err(err);
            console.log("err occurs when saving new empty procon");
          }
          console.log("new procon with blank content added");
        });
      }
    }
    res.send({
      topic: newtopic
    });
  });



  //retrieve saved chat history
  app.get('/chathistory/:topic', function(req, res) {
    var topic = req.params.topic;
    Chatmsg.find({
      'topic': topic
    }).sort('-time').exec(function(err, data) { //

      // console.dir(data);
      for (var i = 0; i < data.length; i++) {
        var temp = timeSince(data[i].time); // data[i].time.toString();
        Object.defineProperty(data[i], 'elapsed', {
          value: temp,
          writable: true
        });
        Object.defineProperty(data[i], 'loginname', {
          value: req.user.toObject().username,
          writable: true
        });
      }
      if (data.length) console.log('data[0].time = ' + data[0].time);
      var result = res.render('chathistory.ejs', {
        chats: data
      });
    });
  });


  app.get('/editinghistory', function(req, res) {
    var idx = req.query.idx,
      topic = req.query.topic;
    UserAct.find({
        'topic': topic
      }).or([{
        'content.element': 'pro_claim_editor_' + idx
      }, {
        'content.element': 'con_claim_editor_' + idx
      }])
      .sort('time').exec(function(err, data) {
        var items = [];
        console.log("first data entry " + data[0]);
        var editpuser = {};
        for (i = 0; i < data.length; i++) { //
          var item = data[i];
          if (!editpuser.hasOwnProperty(item.username)) {
            editpuser[item.username] = [];
          }
          var j = 0;
          for (j = 0; j < editpuser[item.username].length; j++) {
            if (item.content.update.indexOf(editpuser[item.username][j].edit) >= 0) {
              editpuser[item.username][j].edit = item.content.update;
              editpuser[item.username][j].time = item.time;
              break;
            }
          }
          if (j == editpuser[item.username].length) {
            editpuser[item.username].push({
              edit: item.content.update,
              type: item.type,
              topic: item.topic,
              element: item.content.element,
              time: new Date(item.time)
            });
          }
        }
        for(user in editpuser) {
          items.append({username:user, edits:editpuser[key]});
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(items));
      });
  });


  app.all('/instructor', function(req, res) {
    if (!req.user) {
      return res.redirect('/login');
    }
    User.findOne({
      username: req.user.username
    }, function(err, data) {
      if (err) handleError(err);
      res.render('instructor.ejs', {
        user: req.user,
        topics: data.topics
      });
    });

  });

  app.get('/login', function(req, res) {
    res.render('login.ejs');
  });

  app.get('/proncon', function(req, res) {
    res.render('index.ejs', {
      user: req.user
    });
  });

  app.get('/qna', function(req, res) {
    res.render('QnA.ejs', {
      question_idxs: req.q_idxs
    });
  });

  app.get('/signup', function(req, res) {
    res.render('signup.ejs');
  });

  app.post('/userlogin', function(req, res, next) {
    // passport.authenticate('local', function(err, user, info) {
    //   if (err) { return next(err); }
    //   if (!user) { return res.redirect('/login'); }
    //   req.logIn(user, function(err) {
    //     if (err) { return next(err); }
    //     var newAct = new UserAct({
    //       type: "user login",
    //       username: user.username
    //     });
    //     newAct.save(function(err,nact){
    //       if(err){
    //         console.err(err);
    //         console.log("err occurs when saving new user act");
    //       }
    //       console.log("new useract added");
    //     });
    //     return res.redirect('/home');
    //   });
    // })(req, res, next); 
    passport.authenticate('ldapauth', {
      session: true
    }, function(err, user, info) {
      if (err) {
        return next(err);
      }

      if (!user) {
        console.log("Your password is incorrect");
        return res.redirect('/home');
      }
      console.log('enter ldapauth, the user who is logged is listed as follows:');
      console.dir(user);
      User.findOne({
        username: user.uid
      }, function(err, result) {
        if (err) {
          console.log("there is an err in User.findOne for PSU account log in");
          console.err(err);
        }
        console.log("the result is" + result);
        if (!result) {
          User.findOne({
            username: "nzs162"
          }, 'topics', function(err, olduser) {
            if (err) handleError(err);
            console.log("new user, topics based on Na's topics");
            var localUser = new User({
              avatarname: user.displayName,
              username: user.uid,
              email: user.mail,
              topics: olduser.topics,
              role: user.title
            });
            localUser.save(function(err, newuser) {
              if (err) return console.error(err);
              console.log("user is saved");

              req.logIn(newuser, function(err) {
                console.log("enter req.logIn");

                if (err) {
                  console.log("enter err!!! in req.logIn");
                  console.log("the err is " + err);
                  return next(err);
                }
                var newAct = new UserAct({
                  type: "user login",
                  username: newuser.username
                });
                newAct.save(function(err, nact) {
                  if (err) {
                    console.err(err);
                    console.log("err occurs when saving new user act");
                  }
                  console.log("new useract added");
                });
                return res.redirect('/home');
              });

            });
          });

        } else {
          console.log("user is existing");
          req.logIn(result, function(err) {
            console.log("enter req.logIn");
            var newAct = new UserAct({
              type: "user login",
              username: result.username
            });
            newAct.save(function(err, nact) {
              if (err) {
                console.err(err);
                console.log("err occurs when saving new user act");
              }
              console.log("new useract added");
            });
            if (err) {
              console.log("enter err!!! in req.logIn");
              console.log("the err is " + err);
              return next(err);
            } else return res.redirect('/home');
          });
        }
      });

      console.log("after auth, what is the req and res");
    })(req, res, next);
  });

  app.get('/home', isLoggedIn, function(req, res) {
    console.log("home in router is " + req.session.passport.user);
    var newAct = new UserAct({
      username: req.user.username,
      type: "User enter home page"
    });
    newAct.save(function(err, nact) {
      if (err) {
        console.err(err);
        console.log("err occurs when saving new user act");
      }
      console.log("new useract added");
    });
    User.findOne({
      username: req.user.toObject().username
    }, 'topics', function(err, user) {
      if (err) handleError(err);
      console.dir(user.topics[0]);
      console.log("this is after logging in!");
      res.render('index.ejs', {
        user: req.user.toObject(),
        topics: req.user.topics
      });
    });

  });

  app.get('/getusername', function(req, res) {
    var usrname = req.user.toObject().username,
      avatar = req.user.toObject().avatarname;
    console.log("req.user includes :");
    console.dir(req.user.toObject());
    res.send({
      username: usrname,
      avatarname: avatar,
      topics: req.user.toObject().topics
    });
  })

  app.get('/checkExistAvatar', function(req, res) {
    User.findOne({
      username: req.user.toObject().username
    }, 'avatarname', function(err, user) {
      if (err) handleError(err);
      var resp = {};
      if (user.toObject().avatarname && typeof user.toObject().avatarname === "string") {
        resp.exist = true;
        resp.avatarname = user.toObject().avatarname;
        res.send({
          resp: resp
        });
      } else {
        resp.exist = false;
        res.send({
          resp: resp
        });
      }
    });
  });

  app.get('/SaveScreenName/:avatarname', function(req, res) {
    console.log("req.user is " + req.user);
    console.log("saving screenName " + req.user.toObject().username + " to " + req.params.avatarname);
    var usrname = req.user.toObject().username;
    User.update({
      'username': req.user.toObject().username
    }, {
      avatarname: req.params.avatarname
    }, {
      upsert: true
    }, function(err, raw) {
      if (err) return handleError(err);
      console.log('The  updated raw response from Mongo was ', raw);
      res.send({
        username: usrname
      });
    });

  });

  app.get('/logout', function(req, res) {
    console.log('log out');
    var newAct = new UserAct({
      username: req.user.username,
      type: "user log out"
    });
    newAct.save(function(err, nact) {
      if (err) {
        console.err(err);
        console.log("err occurs when saving new user act");
      }
      console.log("new useract added");
    });
    req.logout();

    res.redirect('/login');
  });
  app.get('/logview', function(req, res) {
    User.find({}).exec(function(err, users) {
      var names = [];
      for (var i = 0; i < users.length; i++) {
        names.push(users[i].username);
      }
      res.render('vis.ejs', {
        user: req.user,
        users: names,
        topics: req.user.toObject().topics
      });
    });
  });

  app.put('/SubmitVersion', function(req, res) {
    var newArgv = new Argv({
      topic: req.body.topic,
      content: req.body.content,
      username: req.user.toObject().username,
    });
    newArgv.save(function(err, nact) {
      if (err) {
        console.err(err);
        console.log("err occurs when saving new Arg record");
      }
      console.log("new Arg record added");
    });
    res.send(200, {
      "Succuess": "Submitted"
    });
  });


  app.get('/visdata', function(req, res) {
    var start = req.query.start || new Date("2015-08-05T12:00:00"),
      end = req.query.end || new Date(),
      interact = req.query.interact || "autosave user input",
      users = req.query.users,
      vis_type = req.query.vis;
    var type = interact || "autosave user input";
    console.log('start date specified is ' + req.query.start);
    User.find({}).exec(function(err, all_users) {
      var names = [];
      for (var i = 0; i < all_users.length; i++) {
        names.push(all_users[i].username);
      }
      if (type != "user login" && type != "user log out") {
        UserAct.find({ // this is to ensure that if users are not specified, then return the whole list of users' data
          'username': {
            "$in": users || names
          },
          'time': {
            $gt: start,
            $lt: end
          },
          'type': type
        }).sort('time').exec(function(err, data) {
          var items = [];
          if (type == "autosave user input" && data.length) {
            var editpuser = {};
            for (i = 0; i < data.length; i++) { //
              var item = data[i];
              if (!editpuser.hasOwnProperty(item.username)) {
                editpuser[item.username] = [];
              }
              var j = 0;
              for (j = 0; j < editpuser[item.username].length; j++) {
                if (item.content.update.indexOf(editpuser[item.username][j].edit) >= 0) {
                  editpuser[item.username][j].edit = item.content.update;
                  editpuser[item.username][j].time = item.time;
                  break;
                }
              }
              if (j == editpuser[item.username].length) {
                editpuser[item.username].push({
                  edit: item.content.update,
                  type: item.type,
                  topic: item.topic,
                  element: item.content.element,
                  time: new Date(item.time)
                });
              }
            }
            for (k = 0; k < names.length; k++) {
              if (users && users.indexOf(names[k]) == -1) editpuser[names[k]] = [];
            }
            editpuser = collapseItems('date', 'userinput', editpuser);
            //fill in the empty layers (or for each member they should have data logged for each single day in between)
            var daysrange = daysdiff(new Date(data[0].time), new Date(data[data.length - 1].time));
            console.log('range is ' + daysrange);
            console.log('first day is (new date)' + new Date(data[0].time));
            console.log('last day is  (raw time date)' + data[data.length - 1].time);
            var firstday = new Date(data[0].time.toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)');
            var i = 0;
            for (i = 0; i <= daysrange; i++) {
              var cday = new Date(firstday.addDays(i).toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)');
              for (key in editpuser) {
                if (!(cday in editpuser[key])) {
                  editpuser[key][cday] = {
                    edit: '',
                    type: 'autosave user input',
                    topic: 'N/A',
                    element: 'N/A',
                    time: cday
                  };
                }

              }
            }
            var flatitems = [],
              editusersorted = {};
            // for(key in editpuser) {
            //   editusersorted[key] = editpuser[key].sort(function(a,b){
            //     // Turn your strings into dates, and then subtract them
            //     // to get a value that is either negative, positive, or zero.
            //     return new Date(b.time) - new Date(a.time);
            //   });
            // }
            //return the items list (flat)      
            for (key in editpuser) {
              console.log("user " + key + " has " + Object.size(editpuser[key]) + " date records");
              for (date in editpuser[key]) {
                var item = editpuser[key][date];
                item.username = key;
                item.time = new Date(date);
                flatitems.push(item);
              }
            }

            items = flatitems.sort(function(a, b) {
              // Turn your strings into dates, and then subtract them
              // to get a value that is either negative, positive, or zero.
              return new Date(a.time) - new Date(b.time);
            })
          } else if (type == "cursor click" && data.length) {
            var clcpuser = {};
            for (i = 0; i < data.length; i++) { //
              var item = data[i];
              if (!clcpuser.hasOwnProperty(item.username)) {
                clcpuser[item.username] = [];
              }
              clcpuser[item.username].push({
                type: 'Cursor click',
                topic: 'N/A',
                element: 'N/A',
                time: new Date(item.time)
              })
            }
            for (k = 0; k < names.length; k++) {
              if (users && users.indexOf(names[k]) == -1) clcpuser[names[k]] = [];
            }
            clcpuser = collapseItems('date', 'cursorclick', clcpuser);

            var daysrange = daysdiff(new Date(data[0].time), new Date(data[data.length - 1].time));
            var firstday = new Date(data[0].time.toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)');
            var i = 0;
            for (i = 0; i <= daysrange; i++) {
              var cday = new Date(firstday.addDays(i).toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)');
              for (key in clcpuser) {
                if (!(cday in clcpuser[key])) {
                  clcpuser[key][cday] = {
                    clicks: 0,
                    type: 'Cursor click',
                    topic: 'N/A',
                    element: 'N/A',
                    time: cday
                  };
                }

              }
            }
            for (key in clcpuser) {
              console.log("user " + key + " has " + Object.size(clcpuser[key]) + " date records");
              for (date in clcpuser[key]) {
                var item = clcpuser[key][date];
                item.username = key;
                item.time = new Date(date);
                items.push(item);
              }

            }

          } else if (type == "idle status" && data.length) {
            var clcpuser = {};
            for (i = 0; i < data.length; i++) { //
              var item = data[i];
              if (!clcpuser.hasOwnProperty(item.username)) {
                clcpuser[item.username] = [];
              }
              clcpuser[item.username].push({
                type: 'idle status',
                topic: 'N/A',
                element: 'N/A',
                time: new Date(item.time)
              });
            }
            for (k = 0; k < names.length; k++) {
              if (users && users.indexOf(names[k]) == -1) clcpuser[names[k]] = [];
            }
            clcpuser = collapseItems('date', 'cursorclick', clcpuser);

            var daysrange = daysdiff(new Date(data[0].time), new Date(data[data.length - 1].time));
            var firstday = new Date(data[0].time.toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)');
            var i = 0;
            for (i = 0; i <= daysrange; i++) {
              var cday = new Date(firstday.addDays(i).toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)');
              for (key in clcpuser) {
                if (!(cday in clcpuser[key])) {
                  clcpuser[key][cday] = {
                    clicks: 0,
                    type: 'idle status',
                    topic: 'N/A',
                    element: 'N/A',
                    time: cday
                  };
                }

              }
            }


            for (key in clcpuser) {
              console.log("user " + key + " has " + Object.size(clcpuser[key]) + " date records");
              for (date in clcpuser[key]) {
                var item = clcpuser[key][date];
                item.username = key;
                item.time = new Date(date);
                items.push(item);
              }

            }
          }

          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(items));
          console.log("this is user logs used to visualize data: ");
        });
      } else {
        UserAct.find({
          'time': {
            $gte: start,
            $lte: end
          },
          'type': type
        }).or([{
            'type': "user login"
          },

          {
            'type': 'user log out'
          }
        ]).sort('time').exec(function(err, data) {
          var timepuser = {},
            stack_in = {},
            items = [],
            userdate = {};
          for (i = 0; i < data.length; i++) {
            var item = data[i];
            if (item.type == "user login") {
              stack_in[item.username] = new Date(item.time);
            } else if (item.type == "user log out") {
              if (!timepuser.hasOwnProperty(item.username)) {
                timepuser[item.username] = [];
              }
              timepuser[item.username].push({
                start: stack_in[item.username],
                end: new Date(item.time)
              });
            }
          }
          userdate = collapseItems('date', 'loggingtime', timepuser);


          var daysrange = daysdiff(new Date(data[0].time), new Date(data[data.length - 1].time));
          var firstday = new Date(data[0].time.toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)');
          var i = 0;
          for (i = 0; i <= daysrange; i++) {
            var cday = new Date(firstday.addDays(i).toString().substring(0, 16) + '12:00:00 GMT-0400 (EDT)');
            for (key in userdate) {
              if (!(cday in clcpuser[key])) {
                clcpuser[key][cday] = {
                  start: " From N/A To N/A",
                  range: 0
                };
              }

            }
          }

          for (key in userdate) {
            console.log("user " + key + " has " + Object.size(userdate[key]) + " date records");
            for (date in userdate[key]) {
              var item = userdate[key][date];
              item.username = key;
              item.time = new Date(date);
              items.push(item);
            }

          }

          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(items));
          console.log("this is user logs used to visualize data: ");
        });
      }
    });
  });
  app.put('/userleft', function(req, res) {
    var params = req.body;
    var items = req.user.toObject().lastSnap ? req.user.toObject().lastSnap : [];

    var i = 0,
      flag = false;
    for (i = 0; i < items.length; i++) {
      if (items[i].topic == params.lasttopic) {
        items[i].content = params.lastSnap;
        flag = true;
      }
    }
    if (i == 0 || !flag) {
      items.push({
        topic: params.lasttopic,
        content: params.lastSnap
      });
      console.log("lastSnap updated");
    } else console.log("the i is " + i);

    User.update({
      'username': req.user.username
    }, {
      lasttopic: params.lasttopic,
      lastSnap: items
    }, {
      upsert: false
    }, function(err, raw) {
      if (err) {
        console.log("error:" + err);
        return handleError(err);
      }
      console.log('update LastSnap', raw);
    });
    var newAct = new UserAct({
      username: req.user.username,
      type: "User left"
    });
    newAct.save(function(err, nact) {
      if (err) {
        console.err(err);
        console.log("err occurs when saving new user act");
      }
      console.log("new useract added");
    });
    res.send(200, {
      "act": "user left"
    });
  });

}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("it is authenticated in is LoggedIn");
    return next();
  }

  res.redirect('/login');
}