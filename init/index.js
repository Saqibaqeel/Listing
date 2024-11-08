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

const insertData = async () => {
    // Map over the data and add the 'owner' property to each object
    intiData.data = intiData.data.map((obj) => ({
        ...obj,
        owner: '67233c2b5eef0c235b4fc49b'
    }));

    // Insert modified data
    await Listing.insertMany(intiData.data);
    console.log("Data inserted successfully");
}

insertData();
