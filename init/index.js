const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

let url =
  "mongodb+srv://ashwin7492_db_user:luzPu0vcorZSu7ew@cluster0.raljodu.mongodb.net/?appName=Cluster0";

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });
async function main() {
  await mongoose.connect(url);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "69cabfe854bc3278317217ef",
  }));
  await Listing.insertMany(initData.data);
  console.log("Database Initialized with sample data");
};

initDB();
