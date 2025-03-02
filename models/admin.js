const mongoose=require('mongoose');
const dotenv = require("dotenv");
require("dotenv").config();

const mongo=process.env.MONGO;
mongoose.connect(mongo);


const adminSchema=mongoose.Schema({
    email:String,
    password:String
});

module.exports=mongoose.model('admin',adminSchema);