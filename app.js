const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

const app = express();

app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))


let url = "mongodb://127.0.0.1:27017/AirBNB-clone";

main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err);
});
async function main() {
    await mongoose.connect(url);
}

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMssg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMssg);
    }
    next();
}

app.get('/', (req, res) => {
    res.send("Welcome to Air-BNB-clone");
});

// Index route
app.get('/listings', wrapAsync(async (req, res) => {
    try {
        let listings = await Listing.find({});
        res.render("listing/index.ejs", { listings });
    } catch (err) {
        console.log(err);
    }
}));

// New route
app.get("/listings/new", wrapAsync(async (req, res) => {
    res.render("listing/new.ejs");
}));

app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    let listing = new Listing(req.body.listing);
    console.log(listing);
    await listing.save();
    res.redirect("/listings");

}));



// Show route
app.get('/listings/:id', wrapAsync(async (req, res) => {

    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listing/show.ejs", { listing });
}));

// Edit route

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {

    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listing/edit.ejs", { listing });
}));

app.patch("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.newListing, { new: true, runValidators: true });
    console.log("list updated");
    res.redirect("/listings");
}));

// Delete route 
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    console.log("Deleted");
    res.redirect("/listings");
}));

// Test route
// you can use a test route for testing different type of errors.

// 404! Error
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not Found!!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong !!" } = err;
    res.status(statusCode).render("listing/error.ejs", { message });
    // res.status(statusCode).send(message);
})

app.listen(3000, () => {
    console.log("Server is listening to port 3000");

})
