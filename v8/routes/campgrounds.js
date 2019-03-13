var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");



//INDEX - show all campgrounds
router.get("/campgrounds" , function(req , res){
    // Get all campgrounds from DB
    Campground.find({}, function(err , allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index" , {campgrounds: allCampgrounds}) ;
        }
    });
    //res.render("campgrounds" , {campgrounds: campgrounds}) ;
}) ;


//CREATE - add new campground to DB
router.post("/campgrounds" , function(req , res){
    // get data from form and add to campgrounds array
    var name = req.body.name ;
    var image = req.body.image ;
    var desc = req.body.description ;
    var newCampground = {name: name , image: image , description: desc} ;
    // Create a new campground and save to DB
    //campgrounds.push(newCampground) ;
    Campground.create(newCampground , function(err , newlyCreated){
       if(err){
           console.log(err);
       } else{
            res.redirect("/campgrounds") ;
       }
    });
   // res.redirect("/campgrounds") ;
}) ;


//NEW - show form to create new campground
router.get("/campgrounds/new" , function(req , res){
    res.render("campgrounds/new") ;
}) ;


// SHOW - shows more info about one campground
router.get("/campgrounds/:id" , function(req , res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


module.exports  = router ;

