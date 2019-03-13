// All The Middleware Gose Here
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

// Middleware
middlewareObj.isLoggedIn = function(req , res , next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");  
};



middlewareObj.checkCampgroundOwnership = function(req , res , next){
//is user logged in?
if(req.isAuthenticated()){
    Campground.findById(req.params.id , function(err , foundCampground){
        if(err){
            // take him back to where he was
            res.redirect("back");
        }else{
            //dose user own the campground??
            if(foundCampground.author.id.equals(req.user._id)){
                 next();
            }else{
                res.redirect("back");
            }
        }
    });
}else{
    //if not, redirect
    res.redirect("back");
}
};

middlewareObj.checkCommentOwnership = function(req , res , next){
//is user logged in?
if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id , function(err , foundComment){
        if(err){
            // take him back to where he was
            res.redirect("back");
        }else{
            //dose user own the Comment??
            if(foundComment.author.id.equals(req.user._id)){
                 next();
            }else{
                res.redirect("back");
            }
        }
    });
}else{
    //if not, redirect
    res.redirect("back");
}
};


module.exports = middlewareObj ;