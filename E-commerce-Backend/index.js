require("dotenv").config();
const express = require("express");
const server = express();
const mongoose = require("mongoose");
const productsRouter = require("./routes/Products");
const categoriesRouter = require("./routes/Categories");
const brandsRouter = require("./routes/Brands");
const usersRouter = require("./routes/User");
const authRouter = require("./routes/Auth");
const cartsRouter = require("./routes/Carts");
const ordersRouter = require("./routes/Orders");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const { User } = require("./model/User");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const {
  isAuth,
  sanitizeUser,
  cookieExtractor,
} = require("./controller/Services/Common");
const JwtStrategy = require("passport-jwt").Strategy;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
const { Order } = require("./model/Order");

//middlewares
server.use(cookieParser());
server.use(express.static(path.resolve(__dirname, 'build')));
server.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, 
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Helps prevent XSS attacks
      maxAge:60000 * 60,

    },
  })
);
server.use(passport.authenticate("session"));
server.use(
  cors({
    origin: 'http://localhost:3000', 
    credentials: true,
    methods:["GET","POST","PUT","DELETE","PATCH"],
    exposedHeaders: ["X-Total-Count"],
  })
);
server.use(express.json());
server.use("/products",productsRouter.router);
server.use("/categories",  categoriesRouter.router);
server.use("/brands",  brandsRouter.router);
server.use("/auth", authRouter.router);
server.use("/users",  usersRouter.router);
server.use("/orders",  ordersRouter.router);
server.use("/cart",  cartsRouter.router);

server.get("*", (req, res) =>
  res.sendFile(path.resolve(__dirname,"build", "index.html"))
);



// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);

//webhook
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

server.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        // Then define and call a function to handle the event payment_intent.succeeded
        try {
          const order = await Order.findById(
            paymentIntentSucceeded.metadata.orderId
          );
          if (order) {
            order.paymentStatus = "received";
            order.status = "confirmed";
            await order.save();
          }
        } catch (err) {
          console.error("Error updating order payment status:", err);
          return response.sendStatus(500);
        }
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);




//this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});

//this changes session variable req.user on being called from callbacks

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

server.post("/create-payment-intent", async (req, res) => {
  try {
    const { totalAmount, orderId } = req.body;
    
    if (!totalAmount || !orderId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents and ensure it's an integer
      currency: "usd", // Changed from "aud" to "usd" for better compatibility
      metadata: {
        orderId,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

main().catch((error) => console.log(error));

async function main() {
  await mongoose.connect(process.env.MONGO_DB_URL);
  console.log("Database connected");
}

server.listen(process.env.PORT || 10000, () => {
  console.log("server started at " + process.env.PORT);
});
