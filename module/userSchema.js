let mongoose = require('mongoose');
let userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: Number,
    address: String,
    isActivated: Boolean,
    createdAt: Date,
    UpdatedAt: Date,
    loginFail: Number
})

mongoose.model('testMongoose',userSchema);

module.exports = mongoose.model('testMongoose');