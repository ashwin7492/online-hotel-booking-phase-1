if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listingsRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

const app = express();

app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// let url = "mongodb://127.0.0.1:27017/AirBNB-clone";
const dbUrl = process.env.ATLAS_DBURL;

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: "supersecret",
  },
  touchAfter: 24 * 3600,
});

const sessionOptions = {
  store,
  secret: "thisisasecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/", (req, res) => {
  res.send("Welcome to Air-BNB-clone");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Listings Routes
app.use("/listings", listingsRoutes);

// Review Routes
app.use("/listings/:id/reviews", reviewsRoutes);

// User Routes
app.use("/", userRoutes);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not Found!!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong !!" } = err;
  res.status(statusCode).render("listing/error.ejs", { message });
});

app.listen(3000, () => {
  console.log("Server is listening to port 3000");
});
