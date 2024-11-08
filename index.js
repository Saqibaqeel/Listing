const express=require('express');
const Listing =require('./models/listing')
const review =require('./models/review.js')   

const mongoose=require('mongoose');
const methodOverride=require('method-override')
const path=require ('path');
const ejsMate=require ('ejs-mate');
const wrapAsync=require('./utility/wrapAsync.js');
const expressError=require('./utility/expressError');
const { listingSchema, reviewSchema } = require('./schema'); 
const session = require('express-session');
const flash=require('connect-flash');
const LocalStrategy = require('passport-local')
const passport=require('passport')
const User=require('./models/user.js')

//custom middleware for authentication
const {isAuthenticate,saveUrl} = require('./middleware');
const app=express();
const PORT=3000;
const validate=(req,res,next)=>{
    let {err} =listingSchema.validate(req.body);
    if(err){
        throw new expressError(404,"validation error")
    }
    else{
        next()
    }
   

}

//for server-side review validation

const validateReview=(req,res,next)=>{
    let {err} = reviewSchema.validate(req.body);
    if(err){
        throw new expressError(404,"validation error")
    }
    else{
        next()
    }
   

}

const URL='mongodb+srv://<db_username>:<db_password>@cluster0.kzg7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
main().then(()=>{
    console.log("connection succes")
}).catch((e)=>{
    console.log(e)
})


async function main() {

    await mongoose.connect(URL);
    
}

//serving static file

app.use(express.static(path.join(__dirname,'/public')))
//setting ejs mate
app.engine('ejs',ejsMate);

app.set('view engine','ejs');
// app.set('views',path.join(__dirname('views')));
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}))

app.use(methodOverride('_method'));

///for express -session
///for express -session
const sessionOption = {
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      httpOnly:true,

    }
  };
  
  app.use(session(sessionOption));
  //for connect-flash
  app.use(flash());
 
// Configure Passport to use the local strategy provided by passport-local-mongoose
passport.initialize()
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));




// Configure Passport to handle serialization and deserialization of the user

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
    //middle-ware for flash

   app.use((req,res,next)=>{
     res.locals.success=req.flash('success');
     res.locals.error=req.flash('error');
     res.locals.currentUser=req.user;
     next();
   })
  
  
  
  //for edit the listing

  app.get("/listings/:id/edit",isAuthenticate,wrapAsync(async(req,res)=>{
    let {id}=req.params;
     let editList=await Listing.findById(id);
    res.render('listing/edit.ejs',{editList});

 }))
//  for delete

 app.delete('/listings/:id',isAuthenticate, wrapAsync(isAuthenticate,async (req, res) => {
    const { id } = req.params;
  
   
    const deletedList = await Listing.findByIdAndDelete(id);
 
    console.log(deletedList);
    req.flash('success', "Delete successfull")
    if(!id){
        req.flash('error', "this post not exist")
        res.redirect('/listings');

    }else{

        res.redirect('/listings');
    }
 
    
  }));


 //for update put req

 app.put('/listings/:id',
    validate,
    
    wrapAsync(async   (req, res) => {
    const { id } = req.params;
    const { title, description, image, price, country, location } = req.body;

    
        
        await Listing.findByIdAndUpdate(id, { title, description, image, price, country, location });
        req.flash('success', "updated succesfull!")

       
        res.redirect(`/listings/${id}`)
   
      
    
}));


//For creating id

app.get('/listings/new' ,isAuthenticate,(req,res)=>{

    
   res.render('listing/newListing-form.ejs')

})
// for All Listing 
app.get('/listings',wrapAsync(async(req,res)=>{

    let listings= await Listing.find({});
    res.render('listing/index.ejs',{listings});

    
}))
//Listing based on Id
app.get('/listings/:id',wrapAsync(async(req,res)=>{
    let {id}=req.params
    // console.log(id)
     let listing =await Listing.findById(id).populate('reviews').populate('owner');
     console.log("Retrieved listing:", listing); 
     res.render('listing/showListing.ejs',{listing})
}))





app.post('/listings', 
    validate,
    
    wrapAsync (async (req, res,next) => {
    
        const { title, description, imageFilename, imageUrl, price, country, location } = req.body;
       

        // Create a new listing instance based on the schema
        const newListing = new Listing({
            
            title,
            description,
            image: {
                filename: imageFilename, // Captured filename from the form
                url: imageUrl            // Captured URL from the form
            },
            price,
            country,
            location
        });
        newListing.owner=req.user._id;

        // Save the new listing to the database
        await newListing.save();
         //flash message
         req.flash('success', "new listing is created")
        // Redirect to the listing page after successful insertion
        res.redirect('/listings');
    
}));

//Review Route
app.post('/listings/:id/reviews', validateReview, async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new review(req.body.review);
    
    await newReview.save();
    // console.log("New review saved:", newReview); // Log the new review
    listing.reviews.push(newReview._id);
    
    await listing.save();
    // console.log("Updated listing with new review:", listing); // Log the updated listing

    res.redirect(`/listings/${listing._id}`);
});

//for deleting review

app.delete('/listings/:id/reviews/:reviewId', async (req, res) => {
    const { id, reviewId } = req.params;

    // Update the listing to remove the reference to the review
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    
    // Delete the review document itself
    await review.findByIdAndDelete(reviewId);
    
    // Redirect back to the listing page
    res.redirect(`/listings`);
});

app.get('/signUp',(req,res)=>{
    res.render('users/signUp.ejs')

})


app.post('/signUp', wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // Validate input (add more validations as necessary)
        if (!username || !email || !password) {
            req.flash('error', "All fields are required.");
            return res.redirect('/signup'); // Adjust the path based on your signup route
        }

        // Create a new user instance
        const newUser = new User({
            
            username,
            email,
        });

       

        // Register the user
        let registerUser = await User.register(newUser, password);
        console.log(registerUser);
        //login method

        req.login(registerUser,(err)=>{
            if(err){
                return next(err);
            }
             // Set success message
        
        req.flash('success', "Welcome to Explore-More!");

        // Redirect to listings
        res.redirect('/listings');
        })
       
    } catch (error) {
        console.error(error);

        // Handle registration errors
        req.flash('error', "Registration failed. Please try again.");
        res.redirect('/signup'); // Adjust the path based on your signup route
    }
}));


//login 

app.get('/login',(req,res)=>{
    res.render('users/login.ejs')
})

app.post('/login', saveUrl,
    passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureFlash: true  // Optional: Display error messages if using flash
    }),
    (req, res) => {
        // Successful login
        if(!res.locals.redirectUrl ){
            res.redirect('/listings');
        }
        else{
            res.redirect(res.locals.redirectUrl );
        }



      });

//for logout 

app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            
             return next(err); }
        req.flash('success', 'You have been logged out');
        res.redirect('/login');
    });
});





app.get('/',(req,res)=>{
    res.send('well come to my app')
})

app.all('*', (req, res, next) => {
    next(new expressError(404,"page not found"));
});

// Middleware for handling errors
app.use((err, req, res, next) => {
    const { statuscode = 500, message = "Page not found" } = err;
    res.status(statuscode).render('listing/error.ejs', { err });
});



app.listen(PORT,()=>{
    console.log(`app is listen on ${PORT}`)
})


