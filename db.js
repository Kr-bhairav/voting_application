const mongoose = require('mongoose');
require('dotenv').config();

const URL = process.env.URL;

mongoose.connect(URL);

const db = mongoose.connection;

db.on('connected', ()=>{
    console.log("MongoDB Connected successfully");
})
db.on('error', ()=>{
    console.log("error identified");
})
db.on('disconnected', ()=>{
    console.log("Disconnected successfully");
})



module.exports = db;