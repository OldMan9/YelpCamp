var express         = require("express") ;
var app             = express() ;
var bodyParser      = require("body-parser") ;
var mongoose        = require("mongoose") ;
var passport        = require("passport");
var LocalStrategy   = require("passport-local");
var Campground      = require("./models/campground");
var Comment         = require("./models/comment") ;
var User            = require("./models/user");
var seedDB          = require("./seeds");

//requirung routes
var commentRoutes      = require("./routes/comments");
var campgroundRoutes   = require("./routes/campgrounds");
var indexRoutes        = require("./routes/index");





mongoose.connect("mongodb://localhost:27017/Yelp_camp_v9" , {useNewUrlParser: true}) ;
app.use(bodyParser.urlencoded({extended: true})) ;
app.set("view engine" , "ejs") ;
app.use(express.static(__dirname + "/public"));
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

app.use(function(req , res , next){
   res.locals.currentUser = req.user ;
   next();
});


//app.use("/" , indexRoutes);
app.use(indexRoutes);
app.use(campgroundRoutes);
// MORE CLEAN CODE TO DO THIS
//app.use("/campgrounds" , campgroundRoutes);
app.use(commentRoutes);
//app.use("/campgrounds/:id/comments" , commentRoutes);




app.listen(process.env.PORT , process.env.IP , function(){
    console.log("The YelpCamp Server Has Started") ;
}) ;

