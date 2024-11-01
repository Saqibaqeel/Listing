// const mongoose = require('mongoose');

// const reviewSchema=new mongoose.Schema({
//      rating:Number,
//      comment:String,
//      createdAt:{
//         type:Date,
//         default:Date.now,
//      }
// })

// const review=mongoose.model("review",reviewSchema);
// module.exports=review


const mongoose = require('mongoose');

const reviewSchema=new   mongoose. Schema({
    Comment:String,
    rating :{
        type:Number,
        min:1,
        max:5,
    }
    ,
    createdAt:{
        type:Date,
        default:Date.now

    }

});
const review=mongoose.model("review",reviewSchema);
module.exports=review;