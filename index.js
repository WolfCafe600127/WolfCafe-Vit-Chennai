const express = require("express");
const app = express();

const path = require("path");
const dotenv = require("dotenv");
const Razorpay=require('razorpay');
const crypto=require('crypto');
const nodemailer = require("nodemailer");
// initializing jswt and cookie parser for session management

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
app.set("view engine", "ejs"); // ejs for frontend
app.use(express.static(path.join(__dirname, "public"))); // for public files like css folder , javascript folder as well as for images

//  json response and urlencoded will help in session management
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
const secret = process.env.SECRET_JWT;

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

const transporter = nodemailer.createTransport({   // to send password on registered email id.
  service: "gmail",
  auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASSWORD, // Use App Password if using Gmail
  },
});

const userModel = require("./models/user");
const ordercart = require("./models/ordercart");
const liveorders = require("./models/liveorders");
const adminModel = require("./models/admin");
const activeModel = require("./models/active");
const ordered=require("./models/ordered");
const otpModel=require("./models/OTP");

const cancelled=require("./models/cancelled");

// console.log(OTP);

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  // console.log("verify token: "+token);
  if (!token) return res.redirect("/login");

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.redirect("/login");
    req.user = user;
    next();
  });
};


function adminAuthMiddleware(req, res, next) {
  const token = req.cookies.token;
  
  if (!token) {
    return res.redirect("/admin"); // Redirect to admin login if no token
  }

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      return res.redirect("/admin"); // Redirect if token is invalid
    }

    const admin = await adminModel.findOne({ email: decoded.email });

    if (!admin) {
      return res.redirect("/admin"); // Ensure user is an admin
    }

    req.admin = admin; // Store admin details in request object
    next(); // Proceed to admin dashboard
  });
}



app.get("/", verifyToken, function (req, res) {
  return res.render("home");
});

app.get("/signup", function (req, res) {
  res.clearCookie("token");
  return res.render("signup");
});

app.get("/login", function (req, res) {
  res.clearCookie("token");
  return res.render("login");
});

app.get("/sendPassword",function(req,res){
  return res.render("sendpassword");
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
      const user = await userModel.findOne({ email });
      if (!user) return res.status(404).json({ error: "Email not registered!" });

      const otp = crypto.randomInt(100000, 999999).toString();
      console.log(otp);

      const current=await otpModel.findOne({email});
      console.log(current);

      if(!current){
        console.log(otp);
        await otpModel.create({ email, otp });
      }
      await otpModel.deleteOne({email});

      await otpModel.create({email,otp});
      console.log("OK");

      const mailOptions = {
          from: process.env.GMAIL,
          to: email,
          subject: "Your OTP Code",
          text: `Your OTP is: ${otp}. It expires in 5 minutes.`
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: "OTP sent successfully!" });
  } catch (err) {
      res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ✅ Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
      const otpRecord = await otpModel.findOne({ email, otp });
      if (!otpRecord) return res.status(400).json({ error: "Invalid or expired OTP!" });

      await otpModel.deleteOne({ email }); // Remove OTP after verification
      res.json({ message: "OTP verified successfully!" });
  } catch (err) {
      res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// 🔑 Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userModel.updateOne({ email }, { password: hashedPassword });

      res.json({ message: "Password reset successfully!" });
  } catch (err) {
      res.status(500).json({ error: "Failed to reset password" });
  }
});





app.post("/signup/create", async function (req, res) {
  let { name, phone, email, password } = req.body;

  let user = await userModel.findOne({ email: email });

  if (user) return res.send("User already exist!!,please Login!!");
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      // console.log(hash);
      let createdUser = await userModel.create({
        name: name,
        phone: phone,
        email: email,
        password: hash,
      });
      var token = jwt.sign({ email: email }, secret, { expiresIn: "1h" });
      // console.log("signup token"+token);
      res.cookie("token", token, { httpOnly: true, secure: false });
      return res.redirect("/");
    });
  });
});

app.post("/login/read", async function (req, res) {
  let { email, password } = req.body;
  // console.log(email+": "+password);
  let user = await userModel.findOne({ email: email });
  if (!user) return res.redirect("/signup");
  // console.log(user.password);
  await bcrypt.compare(password, user.password, function (err, result) {
    // console.log(result);
    if (result) {
      res.clearCookie("token");
      var token = jwt.sign({ email: email }, secret, { expiresIn: "1h" });
      res.cookie("token", token, { httpOnly: true, secure: false });
      return res.redirect("/");
    } else return res.send("Incorrect password!!");
  });

  // return res.send("something went wrong!!");
});

app.get("/order", verifyToken, async function (req, res) {
  try {
      const userEmail = req.user.email;

      // Check if the kitchen is active or not (assuming only one document exists)
      const activeStatus = await activeModel.findOne(); // Fetch the single active record

      if (!activeStatus || !activeStatus.active) {
          return res.render("order", { hasLiveOrder: false, kitchenClosed: true });
      }

      // Check if the user has a live order
      const existingOrder = await liveorders.findOne({ email: userEmail });

      if (existingOrder) {
          return res.render("order", { hasLiveOrder: true, kitchenClosed: false });
      }

      res.render("order", { hasLiveOrder: false, kitchenClosed: false });
  } catch (error) {
      console.error("Error fetching order status:", error);
      res.status(500).send("Internal Server Error");
  }
});


app.post("/ordercart", verifyToken, async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login"); // ✅ Stops execution after sending response
  }
  const decoded = jwt.verify(token, secret);
  const email = decoded.email;

  try {
    
    console.log(email); // working

    let user = await ordercart.findOne({ email: email });
    console.log(user);

    if(user) {
      console.log(user.email);  
      await ordercart.deleteOne({ email: email }); // ✅ Ensure deletion completes before response
      console.log(`Deleted cart data for: ${user.email}`);
    }
  } catch (error) {
    console.error("Error deleting cart:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error" }); // ✅ Return added to avoid duplicate responses
  }

  try {
    console.log("in cart");
    const { cart } = req.body;

    const totalPrice = Object.values(cart).reduce((sum, item) => sum + (item.quantity * item.price), 0);
    // console.log("Cart"+cart);  //running


    let newcart = await ordercart.create({
        email:email,
        items:cart
    });
    
    // console.log(newcart);
    // console.log("hehe");

    res.cookie("cart", JSON.stringify(cart), { maxAge: 15 * 60 * 1000, httpOnly: true });
    res.cookie("totalPrice", totalPrice, { maxAge: 15 * 60 * 1000, httpOnly: true });

    return res.json({ success: true, message: "Cart saved, redirecting...", redirectUrl: "/cart" });

    

  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error saving cart", error });
  }

});

// app.get("/cart", verifyToken, function (req, res) {
//     console.log("carttt");
//     return res.send("cart");
// });

app.get("/cart", verifyToken, async (req, res) => {
    console.log("Fetching cart...");
  
    let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : null;
    let totalPrice = req.cookies.totalPrice || null;

    
    
    if (!cart || !totalPrice) {
      console.log("Cookies not found, fetching from DB...");
      try {
        const userCart = await ordercart.findOne({ email: req.user.email });
  
        if (userCart) {
          cart = userCart.items;
          totalPrice = Object.values(cart).reduce((sum, item) => sum + (item.quantity * item.price), 0);
          // Restore missing cookies
          res.cookie("cart", JSON.stringify(cart), { maxAge: 15 * 60 * 1000, httpOnly: true });
          res.cookie("totalPrice", totalPrice, { maxAge: 15 * 60 * 1000, httpOnly: true });
        } else {
          cart = {};
          totalPrice = 0;
        }
      } catch (error) {
        console.error("Error fetching cart from DB:", error);
        return res.status(500).json({ success: false, message: "Error fetching cart" });
      }
    }
  
    return res.render("cart",{cart,totalPrice});;
  });

  app.post("/cart/processing", verifyToken, async (req, res) => {
    try {
      const email = req.user.email;
  
      // Fetch cart details
      const userCart = await ordercart.findOne({ email });
      if (!userCart || Object.keys(userCart.items).length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }
  
      const totalAmount = Object.values(userCart.items).reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      ) * 100; // Razorpay requires amount in paise
  
      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: totalAmount,
        currency: "INR",
        receipt: `order_rcpt_${Date.now()}`,
        payment_capture: 1,
      });
  
      res.json({ success: true, order });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ success: false, message: "Error creating order" });
    }
  });
  
  // 2️⃣ VERIFY PAYMENT AFTER SUCCESS
  app.post("/cart/verify-payment", verifyToken, async (req, res) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
      // Verify payment signature
      const generatedSignature = crypto
        .createHmac("sha256", razorpay.key_secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
  
      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed" });
      }

      const userCart = await ordercart.findOne({ email: req.user.email });
      if (!userCart) {
        return res.status(400).json({ success: false, message: "No cart found" });
      }
      let neworder=await liveorders.create({
        email: req.user.email,
        razorpay_order_id,
        razorpay_payment_id,
        otp:"0000",
        items: userCart.items,
        totalPrice: Object.values(userCart.items).reduce((sum, item) => sum + item.quantity * item.price, 0),
      });
      // Clear cart after successful payment
      await ordercart.deleteOne({ email: req.user.email });
  
      res.json({ success: true, message: "Payment successful! Redirecting..." });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ success: false, message: "Payment verification failed" });
    }
  });

app.get("/track-order", verifyToken, async (req, res) => {
    try {
        const userEmail = req.user.email; // Assuming email is stored in req.user after authentication

        // Find the live order for the user
        const order = await liveorders.findOne({ email: userEmail });

        if (!order) {
            return res.render("trackorder",{hasOrder:false});
        }

        // Render the track order page with order details
        res.render("trackorder", {hasOrder:true, order });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/api/order-status", verifyToken, async (req, res) => {    // to reload after every 20 sec to get current status
    try {
        const userEmail = req.user.email;
        const order = await liveorders.findOne({ email: userEmail });

        if (!order) {
            return res.json({ hasOrder: false });
        }

        res.json({ hasOrder: true, order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




//  For Admin use ....

app.get("/admin",function(req,res){
  // res.clearCookie();
  return res.render("adminlogin");
});


app.post("/admin/read",async function(req,res){
  
  let { email, password } = req.body;
  let admin=await adminModel.findOne({email:email});
  if (!admin) return res.redirect("/admin");
  // console.log(user.password);
  await bcrypt.compare(password, admin.password, function (err, result) {
    // console.log(result);
    if (result) {
      res.clearCookie("token");
      var token = jwt.sign({ email: email }, secret, { expiresIn: "1h" });
      res.cookie("token", token, { httpOnly: true, secure: false });
      
      return res.redirect("/adminDashboard");
    } else return res.send("Incorrect password!!");
  });

});

app.get("/adminDashboard", adminAuthMiddleware, function (req, res) {
  return res.render("admindashboard");
});

app.get("/api/live-orders", async (req, res) => {
  console.log("📌 Fetching live orders...");
  try {
      const orders = await liveorders.find().lean(); // Convert to plain JSON
      if (!Array.isArray(orders)) {
          console.error("❌ Error: orders is not an array!", orders);
          return res.status(500).json({ error: "Database returned invalid data" });
      }
      console.log("✅ Live orders fetched:", orders);
      res.json(orders);
  } catch (error) {
      console.error("❌ Error fetching orders:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


// Update order status and generate OTP when needed
app.post("/api/update-status", async (req, res) => {
  console.log("Updating order status...");
  const { orderId, status } = req.body;

  try {
      let updateData = { status };

      // Generate OTP for orders being delivered
      if (status === "Delivering") {
          updateData.otp = Math.floor(1000 + Math.random() * 9000).toString();
      }

      // Find the original order first so we can copy it to canceled orders if needed
      const orderToUpdate = await liveorders.findById(orderId);
      
      if (!orderToUpdate) {
          return res.status(404).json({ success: false, message: "Order not found" });
      }

      // Special handling for canceled orders
      if (status === "Cancelled") {
          // Create a new entry in the canceledorders collection
          

          const o = await liveorders.findById(orderId);
          o.status="Cancelled";

          await cancelled.create(o.toObject()); // Convert Mongoose doc to plain object

          // Update the original order
          await liveorders.findByIdAndUpdate(orderId, updateData);
          await liveorders.findByIdAndDelete(orderId);
          
          return res.json({ 
              success: true, 
              message: "Order canceled and moved to canceled orders database!" 
          });
      }

      // For non-canceled orders, just update normally
      await liveorders.findByIdAndUpdate(orderId, updateData);
      res.json({ 
          success: true, 
          message: "Order status updated!", 
          otp: updateData.otp 
      });
  } catch (error) {
      console.error("❌ Error updating order:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Toggle order availability (ON/OFF)
// Get current order availability status
app.get("/api/get-order-status", async (req, res) => {
  try {
      const statusData = await activeModel.findOne(); // Fetch current status
      res.json({ active: statusData ? statusData.active : false });
  } catch (error) {
      console.error("❌ Error fetching order status:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Toggle order status (ON/OFF)
app.post("/api/toggle-orders", async (req, res) => {
  try {
      const { active } = req.body;

      let statusData = await activeModel.findOne();
      if (statusData) {
          statusData.active = active;
          await statusData.save();
      } else {
          statusData = await activeModel.create({ active });
      }

      res.json({ success: true, message: `Orders are now ${active ? "ON" : "OFF"}` });
  } catch (error) {
      console.error("❌ Error toggling order status:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post("/api/validate-otp", async (req, res) => {
  const { otp } = req.body;

  try {
      console.log(otp);
      const order = await liveorders.findOne({ otp });
      console.log(order);
      if (!order) {
          return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
      
      // Remove order from liveorders after delivery
      const o = await liveorders.findById(order._id);
      o.status="Delivered";

      await ordered.create(o.toObject()); // Convert Mongoose doc to plain object

      // Delete the order from liveorders
      await liveorders.findByIdAndDelete(order._id);

      res.json({success:true, message:"OTP verified!!"});
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to render success page
app.get("/success", (req, res) => {
  res.render("success");
});




app.listen(3000, function (req, res) {
  console.log("Server is  running at port 3000");
});
