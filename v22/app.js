require('dotenv').config();
var express          = require("express") ;
var app              = express() ;
var bodyParser       = require("body-parser") ;
var mongoose         = require("mongoose") ;
var flash            = require("connect-flash");
const Swal           = require('sweetalert2');
app.locals.moment    = require('moment');
var passport         = require("passport");
var LocalStrategy    = require("passport-local");
var methodOverride   = require("method-override");
var Campground       = require("./models/campground");
var Comment          = require("./models/comment") ;
var User             = require("./models/user");
var seedDB           = require("./seeds");
var commentRoutes    = require("./routes/comments");
var reviewRoutes     = require("./routes/reviews");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes      = require("./routes/index");

//requirung routes
var commentRoutes      = require("./routes/comments");
var campgroundRoutes   = require("./routes/campgrounds");
var indexRoutes        = require("./routes/index");





mongoose.connect("mongodb://localhost:27017/Yelp_camp_v20" , {useNewUrlParser: true}) ;
app.use(bodyParser.urlencoded({extended: true})) ;
app.set("view engine" , "ejs") ;
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//app.use(sweetAlert());
//seedDB(); //seed the database

// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "SWE499 Project",
    resave: false,
    saveUninitialized: false,
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function(req , res , next){
   res.locals.currentUser = req.user ;
   if(req.user){
       try{
           let user = await User.findById(req.user._id).populate("notifications", null, { isRead: false }).exec();
           res.locals.notifications = user.notifications.reverse();
       } catch(err){
           console.log(err.message);
       }
   }
   res.locals.error = req.flash("error") ;
   res.locals.success = req.flash("success") ;
   //res.locals.message = req.Swal("error") ;
   next();
});


//app.use("/" , indexRoutes);
app.use(indexRoutes);
app.use(campgroundRoutes);
// MORE CLEAN CODE TO DO THIS
//app.use("/campgrounds" , campgroundRoutes);
app.use(commentRoutes);
//app.use("/campgrounds/:id/comments" , commentRoutes);
app.use(reviewRoutes);
/*app.use("/campgrounds/:id/reviews", reviewRoutes);*/



app.listen(process.env.PORT , process.env.IP , function(){
    console.log("The YelpCamp Server Has Started") ;
}) ;
