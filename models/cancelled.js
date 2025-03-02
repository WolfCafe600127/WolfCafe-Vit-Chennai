const mongoose=require('mongoose');
const dotenv = require("dotenv");
require("dotenv").config();

const mongo=process.env.MONGO;
mongoose.connect(mongo);

const cancelledSchema = new mongoose.Schema({
    email: { type: String, required: true },
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
    items: { type: Object, required: true },
    totalPrice: { type: Number, required: true },
    otp:{type:String,default:""},
    status: { type: String, default: "Processing" }, // Status of order
    createdAt: { type: Date, default: Date.now }, // Timestamp
  });
  

module.exports=mongoose.model('cancelled',cancelledSchema);