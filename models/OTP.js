const mongoose=require('mongoose');
const dotenv = require("dotenv");
require("dotenv").config();

const mongo=process.env.MONGO;
mongoose.connect(mongo);

const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, expires: "5m", default: Date.now }
});

module.exports= mongoose.model("OTP", OTPSchema);