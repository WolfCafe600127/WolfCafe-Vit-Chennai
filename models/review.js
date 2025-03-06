const mongoose=require('mongoose');
const dotenv = require("dotenv");
require("dotenv").config();

const mongo=process.env.MONGO;
mongoose.connect(mongo);


const reviewSchema = new mongoose.Schema({
    email:{type:String,required:true},
    stars: { type: Number, required: true, min: 1, max: 5 }, 
    suggestion: { type: String, required: true }
  }, { timestamps: true });

module.exports=mongoose.model('review',reviewSchema);