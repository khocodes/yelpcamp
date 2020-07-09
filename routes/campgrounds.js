
var express = require('express');
var router  = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var Notification = require('../models/notification');
var middleware = require('../middleware');


//MULTER AND CLOUDINARY CONFIG:
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});



//INDEX ROUTE -- Displays all campgrounds
router.get('/', function(req, res){
    //eval(require('locus')); -- 'req.query.search' will display what was searched in search bar
    //if search was made:
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi'); //g = global, i = ignore case
        //Get campgrounds that fuzzy match search query
        Campground.find({name: regex}, function(err, allCampgrounds){
            if (err){
                console.log(err);
            }
            else{
                
                if(allCampgrounds.length<1){
                    noMatch = 'No campgrounds match that query, please try again';
                }
                res.render('campgrounds/index', {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch});
            }
        });
    }
    else{
        //Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
            if (err){
                console.log(err);
            }
            else{
                res.render('campgrounds/index', {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch});
            }
        });
    }

});

//CREATE ROUTE - adds new campgrounds to database
//Post request. Note that route is named '/campgrounds', just like get request because ultimately want to see results on get request.
router.post('/', middleware.isLoggedIn, upload.single('image'), function(req, res){

    cloudinary.v2.uploader.upload(req.file.path, async function(err,result) {
            if(err){
                req.flash('error', err.message);
                return res.redirect('back');
            }
            // add cloudinary url for the image to the campground object under image property
            req.body.campground.image = result.secure_url;
            // add image's public_id to campground object
            req.body.campground.imageId = result.public_id;
            // add author to campground
            req.body.campground.author = {
                id: req.user._id,
                username: req.user.username
            }
            //Campground.create(req.body.campground, async function(err, campground) {
               var newCampground = req.body.campground;             
                try{ 
                let campground = await Campground.create(newCampground);
                let user = await User.findById(req.user._id).populate('followers').exec();
                
                let newNotification = {
                  username: req.user.username,
                  campgroundId: campground.id
                }

                for(const follower of user.followers) {
                  let notification = await Notification.create(newNotification);
                  console.log(notification);
                  follower.notifications.push(notification);
                  follower.save();
                }
                res.redirect('/campgrounds/' + campground.id);
                }
                catch(err){
                req.flash('error', err.message);
                res.redirect('back');
            }


        });
});



//NEW ROUTE - show form to create new campground
router.get('/new', middleware.isLoggedIn, function(req, res){
    res.render('campgrounds/new');
});


//SHOW ROUTE - shows more info about one campground
router.get('/:id', function(req, res){
    //find the campground with provided ID (auto-created by mongoDB)
    //Campground.findById(id, callback)
    //Display comments by first populating comments array, which we can then reference in show.ejs file:
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
       if(err){
           console.log(err);
       } 
       else{
           console.log(foundCampground);
            //render show template with that campground
            res.render('campgrounds/show', {campground: foundCampground});
       }
    });
});


//EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){     
        res.render('campgrounds/edit', {campground: foundCampground});
     });
});

//UPDATE CAMPGROUND ROUTE
router.put('/:id',middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){

    //find and update the correct campground
    //Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
    Campground.findById(req.params.id, async function(err, campground){

        if(err){
            req.flash('error', err.message);
            res.redirect('back');
        }
        else{
            //if updating image:
            if(req.file){
                try{
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                }
                catch(err){
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
                campground.save();
                
                //also update any other form inputs for any changes
                Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err){
                    if(err){
                        res.redirect('/campgrounds');
                    }
                    else{
                    //redirect somewhere(show page)
                    res.redirect('/campgrounds/'+req.params.id);
            
                    }
                });

            }
            else{
                Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err){
                    if(err){
                        res.redirect('/campgrounds');
                    }
                    else{
                    //redirect somewhere(show page)
                    res.redirect('/campgrounds/'+req.params.id);
            
                    }
                }); 
            }
        }
    });
});


//DESTROY CAMPGROUND ROUTE
router.delete('/:id',middleware.checkCampgroundOwnership, function(req, res, next){
    //Campground.findByIdAndRemove(req.params.id, function(err){
    Campground.findById(req.params.id, async function(err, campground){

        //will remove image from cloudinary server
        try{
            await cloudinary.v2.uploader.destroy(campground.imageId);
        }
        catch(err){
            if(err){
                req.flash('error', err.message);
                return res.redirect('back');
            }
        }

        //remove notifications associated with campground
        Notification.remove({
            'campgroundId': {
                $in: campground._id
            }
        }, function(err){
            if(err){
                req.flash('error', 'Notification not able to be removed');
                return res.redirect('back');
            }
            else{
                console.log('Notification removed');
            }
        });


        Comment.remove({
            '_id': {
                $in: campground.comments
            }
        }, function(err){
            if(err) return next(err);
            campground.remove();
            req.flash('success', 'Campground deleted successfully!')
            res.redirect('/campgrounds')

        });

    });
});


//Fuzzy Search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router;