const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing =  require("../models/listing.js");

let url = "mongodb://127.0.0.1:27017/AirBNB-clone";

main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err);
});
async function main() {
    await mongoose.connect(url);
}


const initDB = async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Database Initialized with sample data");
}

initDB();