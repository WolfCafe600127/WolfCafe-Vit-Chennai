const mongoose=require('mongoose');
const dotenv = require("dotenv");
require("dotenv").config();

const mongo=process.env.MONGO;
mongoose.connect(mongo);

const cartSchema = new mongoose.Schema({
    email: String,
    items: Object, // Stores { itemName: { quantity: x, price: y } }
});

module.exports=mongoose.model('ordercart',cartSchema);