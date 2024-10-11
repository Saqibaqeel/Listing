const mongoose=require('mongoose');
const Listing =require('../models/listing');
const  intiData=require('./data');


const URL='mongodb://127.0.0.1:27017/destination'
main().then(()=>{
    console.log("connetion succes")
}).catch((e)=>{
    console.log(e)
})


async function main() {

    await mongoose.connect(URL);
    
}

const insertData =async()=>{
   
   await Listing.insertMany(intiData.data);
   console.log("data inserted sucessfully")

}
insertData()