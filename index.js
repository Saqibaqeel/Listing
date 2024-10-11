const express=require('express');
const Listing =require('./models/listing')

const mongoose=require('mongoose');
const methodOverride=require('method-override')
const path=require ('path');
const ejsMate=require ('ejs-mate');
const app=express();
const PORT=3000;

const URL='mongodb://127.0.0.1:27017/destination'
main().then(()=>{
    console.log("connetion succes")
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



  //for edit the listing

  app.get("/listing/:id/edit",async(req,res)=>{
    let {id}=req.params;
     let editList=await Listing.findById(id);
    res.render('listing/edit.ejs',{editList});

 })
//  for delete

 app.delete('/listings/:id', async (req, res) => {
    const { id } = req.params;
  
   
    const deletedList = await Listing.findByIdAndDelete(id);
 
    console.log(deletedList);
 
    res.redirect('/listing');
  });


// app.delete('/listings', async (req, res) => {
//     // const { id } = req.params;
  
   
//     // const deletedList = await Listing.findByIdAndDelete(id);

//     await Listing.deleteMany({});
 
//     // console.log(deletedList);
 
//     res.redirect('/listing');
//   });


  

 //for update put req

 app.put('/listings/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, image, price, country, location } = req.body;

    try {
        
        await Listing.findByIdAndUpdate(id, { title, description, image, price, country, location });

       
        res.redirect(`/listing/${id}`)
    } catch (err) {
        console.error('Error updating the listing:', err);
        res.status(500).send('Internal server error');
    }
});


//For creating id

app.get('/listings/new',(req,res)=>{
   res.render('listing/newListing-form.ejs')

})
// for All Listing 
app.get('/listing',async(req,res)=>{

    let listings= await Listing.find({});
    res.render('listing/index.ejs',{listings});

    
})
//Listing based on Id
app.get('/listing/:id',async(req,res)=>{
    let {id}=req.params
    // console.log(id)
     let listing =await Listing.findById(id)
     res.render('listing/showListing.ejs',{listing})
})

// app.post('/listings',async(req,res)=>{

//     const{title,description,image,price,country,location}=req.body
//     const newListing = new Listing({
//         title,
//         description,
//         image,
//         price,
//         country,
//         location
//     });
//     await newListing.save();
//     res.redirect('/listing')



// })



app.post('/listings', async (req, res) => {
    try {
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

        // Save the new listing to the database
        await newListing.save();

        // Redirect to the listing page after successful insertion
        res.redirect('/listing');
    } catch (error) {
        // Handle errors appropriately
        console.error('Error creating listing:', error);
        res.status(500).send('Internal Server Error');
    }
});




app.get('/',(req,res)=>{
    res.send('well come to my app')
})

app.listen(PORT,()=>{
    console.log(`app is listen on ${PORT}`)
})





