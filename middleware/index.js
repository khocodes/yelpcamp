var Campground = require('../models/campground');
var Comment = require('../models/comment');

//all the middleware goes here
var middlewareObj = {};


middlewareObj.checkCampgroundOwnership = function(req, res, next){
    //is user logged in?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash('error', 'Campground not found');
                res.redirect('back');
            }
            else{
                //does user own the campground?
                //console.log(foundCampground.author.id) = object,console.log(req.user._id)= string; May look the same but different data types
                if(foundCampground.author.id.equals(req.user._id)|| req.user.isAdmin){
                    // res.render('campgrounds/edit', {campground: foundCampground});
                    next();
                }
                else{
                    req.flash("error", "You don't have permission to do that");
                    res.redirect('back');
                }
            }
        });
    }
    else{
        req.flash('error', 'You need to be logged in to do that');
        //redirects to previous page
        res.redirect('back');
    }

}


//ensures comments are 'protected'
middlewareObj.checkCommentOwnership = function (req, res, next){
    //is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect('back');
            }
            else{
                //does user own the comment?
                //console.log(foundComment.author.id) = object,console.log(req.user._id)= string; May look the same but different data types
                if(foundComment.author.id.equals(req.user._id)||req.user.isAdmin){
                    next();
                }
                else{
                    req.flash("error", "You don't have permission to do that");
                    res.redirect('back');
                }
            }
        });
    }
    else{
        req.flash('error', 'You need to be logged in to do that');
        //redirects to previous page
       res.redirect('back');
    }

}




middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('/login');
}




module.exports = middlewareObj;