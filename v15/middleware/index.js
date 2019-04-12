// All The Middleware Gose Here
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};


//=================================
//check if he is logged in or not
//=================================

// Middleware
middlewareObj.isLoggedIn = function(req , res , next){
    if(req.isAuthenticated()){
        return next();
    }
    //req.Swal("error" , "Please Login First!");
    req.flash("error" , "You need to be logged in to do that");
    res.redirect("/login");  
};



middlewareObj.checkCampgroundOwnership = function(req , res , next){
//is user logged in?
if(req.isAuthenticated()){
    Campground.findById(req.params.id , function(err , foundCampground){
        if(err || !foundCampground){
            // take him back to where he was
            req.flash("error" , "Campground not found");
            res.redirect("back");
        }else{
            //dose user own the campground??
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                 next();
            }else{
                req.flash("error" , "You dont't have permission to do that");
                res.redirect("back");
            }
        }
    });
}else{
    //if not, redirect
    req.flash("error" , "You need to be logged in to do that");
    res.redirect("back");
}
};

middlewareObj.checkCommentOwnership = function(req , res , next){
//is user logged in?
if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id , function(err , foundComment){
        if(err || !foundComment){
            // take him back to where he was
            req.flash("error" , "Comment not found");
            res.redirect("back");
        }else{
            //dose user own the Comment??
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                 next();
            }else{
                req.flash("error" , "You dont't have permission to do that");
                res.redirect("back");
            }
        }
    });
}else{
    //if not, redirect
    req.flash("error" , "You need to be logged in to do that");
    res.redirect("back");
}
};


module.exports = middlewareObj ;