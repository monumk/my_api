let mongoose = require('mongoose');
let hotelSchema = new mongoose.Schema({
    hotelName: String,
    hotelAddress: String,
    hotelEmail: String,
    hotelHonor: String,
    hotelMobile: String,
    hotelAvailable:Boolean
})

mongoose.model('hotel',hotelSchema);
module.exports = mongoose.model('hotel');