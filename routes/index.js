var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Campground = require('../models/campground');
var Notification = require('../models/notification');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var middleware = require('../middleware');



//route route
router.get('/', function(req, res){
    res.render('landing');
});



//==============
// AUTH ROUTES
//==============

//show register form
router.get('/register', function(req, res){
    res.render('register', {page: 'register'});
});


//handle sign up logic
router.post('/register', function(req, res){
    var newUser = new User({
        username: req.body.username, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    //eval(require('locus'));
    //admin user authorization:
    var SECRETADMIN = process.env.SECRETADMIN;
    if(req.body.adminCode===SECRETADMIN){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            //req.flash('error', err.message);
            return res.render('register', {'error': err.message});
        }
        passport.authenticate('local')(req, res, function(){
            if(newUser.isAdmin){
                req.flash('success', 'Welcome to YelpCamp '+ user.username +'! Also, hello Admin!');
            }
            else{
                req.flash('success', 'Welcome to YelpCamp '+ user.username);
            }
            res.redirect('campgrounds');
        });
    });
});


// show login form
router.get('/login', function(req, res){
    res.render('login', {page: 'login'});
});


//handling login logic
router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), function(req, res){
});


//logout route
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'Logged you out!');
    res.redirect('/campgrounds');
});

//FORGOT PASSWORD
router.get('/forgot', function(req,res){
    res.render('forgot');
});

router.post('/forgot', function(req, res, next){
    //an array of functions will get called:
    async.waterfall([
        //creates token that gets sent to user's email that will expire in an hour
       function(done){
           crypto.randomBytes(20, function(err, buf){
               var token = buf.toString('hex');
               done(err, token);
           });
       },
       function(token, done){
        User.findOne({email: req.body.email}, function(err, user){
            //no user associated with email address:
            if(!user){
                req.flash('error', 'No account with that email address exists');
                return res.redirect('/forgot');
            }
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function(err){
                done(err, token, user);
            });
        });
       },
       function(token, user, done){
           var smtpTransport = nodemailer.createTransport({
               service: 'Gmail',
               auth:{
                   user: process.env.GMAILEMAIL,
                   pass: process.env.GMAILPW
               }
           });
           //contents of the email that will be sent
           var mailOptions = {
               to: user.email,
               from: process.env.GMAILEMAIL,
               subject: 'YelpCamp Password Reset',
               text: 'You are receiving this because you have requested to reset your password for your account.\n\n'+'Please click on the following link to proceed:\n\n' +'http://'+ req.headers.host + '/reset/' + token + '\n\n' + 'If you did not request this, please ignore this email and your password will remain unchanged.\n'

           };
           //send the email
           smtpTransport.sendMail(mailOptions, function(err){
            console.log('mail sent');
            req.flash('success', 'An email has been sent to '+ user.email + ' with futher instructions.');
            done(err, 'done');
           });
       } 
    ], function(err){
        if(err) return next(err);
        res.redirect('/forgot');
    });
});


//RESET PASSWORD
//user will click reset token link in email and redirects them to reset page
router.get('/reset/:token', function(req, res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires:{$gt: Date.now()}}, function(err, user){
        if(!user){
            req.flash('error', 'Password reset token is invalid or has expired');
            return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
    });
});

//password reset happens here
router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          //new password matches confirm password:
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: process.env.GMAILEMAIL,
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: process.env.GMAILEMAIL,
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account for username ' + user.username + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/campgrounds');
    });
  });



//USER PROFILE
router.get('/users/:id', async function(req, res){
   // User.findById(req.params.id, function(err, foundUser){
       try{
           let foundUser = await User.findById(req.params.id).populate('followers').exec();
           Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
            if(err){
                req.flash('error','Something went wrong');
                res.redirect('/');
            }
        res.render('users/show', {user: foundUser, campgrounds: campgrounds});
        });
       }
       catch(err){
            req.flash('error','Something went wrong');
            res.redirect('/');
       }


});





// follow user
router.get('/follow/:id', middleware.isLoggedIn, async function(req, res) {
    try {
      let user = await User.findById(req.params.id);
      user.followers.push(req.user._id);
      user.save();
      req.flash('success', 'Successfully followed ' + user.username + '!');
      res.redirect('/users/' + req.params.id);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });
  
  // view all notifications
  router.get('/notifications', middleware.isLoggedIn, async function(req, res) {
    try {
      let user = await User.findById(req.user._id).populate({
        path: 'notifications',
        //sort by descending, newest notification first
        options: { sort: { "_id": -1 } }
      }).exec();
      let allNotifications = user.notifications;
      res.render('notifications/index', { allNotifications });
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });
  
  // handle notification
  router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
    try {
      let notification = await Notification.findById(req.params.id);
      notification.isRead = true;
      notification.save();
      res.redirect(`/campgrounds/${notification.campgroundId}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
  });
  



module.exports = router;