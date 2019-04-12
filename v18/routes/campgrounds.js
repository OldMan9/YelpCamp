var express       = require("express");
var router        = express.Router({mergeParams: true});
var Campground    = require("../models/campground");
var middleware    = require("../middleware");
var NodeGeocoder  = require('node-geocoder');
var multer        = require('multer');
var User          = require("../models/user");
var Notification = require("../models/notification");


// multer config
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

// cloudinary config
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: "nassercloud", 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

 
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);



//INDEX - show all campgrounds
router.get("/campgrounds" , function(req , res){
    var noMatch ;
    if(req.query.search){
        var regex = new RegExp(escapeRegex(req.query.search), 'gi');
        
        Campground.find({name: regex}, function(err , allCampgrounds){
            if(err){
                console.log(err);
            }else{
                if(allCampgrounds.length < 1){
                    noMatch = "Ops , Sorry , No campgrounds match that Name, please try again."
                }
                res.render("campgrounds/index" , {campgrounds: allCampgrounds , noMatch: noMatch , page: 'campgrounds'}) ;
            }
        });
    } else{
        // Get all campgrounds from DB
        Campground.find({}, function(err , allCampgrounds){
            if(err){
                console.log(err);
            }else{
                res.render("campgrounds/index" , {campgrounds: allCampgrounds , noMatch: noMatch , page: 'campgrounds'}) ;
            }
        });
    }
});



//CREATE - add new campground to DB
router.post("/campgrounds" , middleware.isLoggedIn , upload.single('image') , async function(req , res){
    cloudinary.v2.uploader.upload(req.file.path, async function(err, result) {
        var name = req.body.name ;
        var price = req.body.price ;
        var image = result.secure_url;
        var imageId = result.public_id;
        var desc = req.body.description ;
        var author = {
            id: req.user._id,
            username: req.user.username,
        };
        geocoder.geocode(req.body.location, async function (err, data) {
            if (err || !data.length) {
              req.flash('error', 'Invalid address');
              return res.redirect('back');
            }
            var lat = data[0].latitude;
            var lng = data[0].longitude;
            var location = data[0].formattedAddress;
            var newCampground = {name: name , price: price , image: image , imageId: imageId , description: desc , author: author , location: location, lat: lat, lng: lng} ;
            // Create a new campground and save to DB
            
            try{
                let campground = await Campground.create(newCampground);
                let user = await User.findById(req.user._id).populate('followers').exec();
                let newNotification = {username: req.user.username , campgroundId: campground.id }
                for(const follower of user.followers) {
                    let notification = await Notification.create(newNotification);
                    follower.notifications.push(notification);
                    follower.save();
                }
                req.flash("success","Successfully Created!");
                res.redirect("/campgrounds/" + campground.id);
            }catch(err){
                req.flash('error', err.message);
                res.redirect('back');
            }
            
            /*Campground.create(newCampground , function(err , newlyCreated){
               if(err){
                   req.flash('error', err.message);
                   return res.redirect('back');
               }
                res.redirect('/campgrounds/' + newlyCreated.id);
               
            });*/
        });
    });
});



//NEW - show form to create new campground
router.get("/campgrounds/new" , middleware.isLoggedIn , function(req , res){
    res.render("campgrounds/new") ;
}) ;


// SHOW - shows more info about one campground
router.get("/campgrounds/:id" , function(req , res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error" , "Campground not found!");
            res.redirect("back");
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDITE CAMPGROUND ROUTE
router.get("/campgrounds/:id/edit" , middleware.checkCampgroundOwnership , function(req , res){
    Campground.findById(req.params.id , function(err , foundCampground){
        res.render("campgrounds/edit" , {campground: foundCampground});
    });
       
       //if not, redirect
});

//UPDATE GAMPGROUND ROUTE
router.put("/campgrounds/:id" , middleware.checkCampgroundOwnership , upload.single('image') , function(req , res){
    Campground.findById(req.params.id , async function(err , Campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
       } else{
           if(req.file){
               try{
                   await cloudinary.v2.uploader.destroy(Campground.imageId);
                   let result = await cloudinary.v2.uploader.upload(req.file.path); 
                   Campground.imageId = result.public_id;
                   Campground.image = result.secure_url;
               } catch(err) {
                   req.flash("error", err.message);
                   res.redirect("back");
               }
           }
           await geocoder.geocode(req.body.location, function (err, data) {
                if (err || !data.length) {
                  req.flash('error', 'Invalid address');
                  return res.redirect('back');
                }
                req.body.campground.lat = data[0].latitude;
                req.body.campground.lng = data[0].longitude;
                req.body.campground.location = data[0].formattedAddress;
                Campground.lat = req.body.campground.lat ;
                Campground.lng = req.body.campground.lng ;
                Campground.location = req.body.campground.location ;
                
           });
           Campground.name = req.body.campground.name ;
           Campground.price = req.body.campground.price ;
           Campground.description = req.body.campground.description ;
           Campground.save();
           req.flash("success","Successfully Updated!");
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});



// DESTROY CAMPGROUND ROUTE
router.delete("/campgrounds/:id" , middleware.checkCampgroundOwnership , function(req , res){
   Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports  = router ;

