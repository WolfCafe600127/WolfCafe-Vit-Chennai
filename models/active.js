const mongoose=require('mongoose');
const dotenv = require("dotenv");
require("dotenv").config();

const mongo=process.env.MONGO;
mongoose.connect(mongo);


const activeSchema=mongoose.Schema({
    active: { type: Boolean, default: false }  
});

module.exports=mongoose.model('active',activeSchema);