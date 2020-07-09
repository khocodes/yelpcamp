
var express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    flash       = require('connect-flash'),
    passport    = require('passport'),
    LocalStrategy = require('passport-local'),
    methodOverride = require('method-override'),
    Campground  = require('./models/campground');
    Comment     = require('./models/comment');
    User        = require('./models/user'),
    seedDB      = require('./seeds');

//Requiring Routes
var commentRoutes    = require('./routes/comments'),
    campgroundRoutes = require('./routes/campgrounds'),
    indexRoutes       = require('./routes/index');

var DATABASEURL = process.env.DATABASEURL || 'mongodb://localhost/yelp_camp_v13';

mongoose.connect(DATABASEURL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(express.static(__dirname+'/public'));
app.use(methodOverride('_method'));
app.use(flash());

app.locals.moment = require('moment');
//comment out seedDB() if there are issues / not trying to use seed data   
//seedDB(); //seed the database




//PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: 'Bobo is the cutest!',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware code -- will be called on every route; passing in currentUser to every route
   // console.log(req.user); -- when logged in will see details, otherwise undefined
app.use(async function(req, res, next){
    res.locals.currentUser = req.user;
    
    //find new notifications for logged in user
    if(req.user){
        try{
            let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
            res.locals.notifications = user.notifications.reverse();
        }
        catch(err){
            console.log(err.message);
        }
    }

    res.locals.error =  req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

//app will now use routes
app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);


var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});



