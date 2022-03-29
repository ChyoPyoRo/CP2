const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const User = new Schema({
    _id: Schema.Types.ObjectId,
    name: {
        type: String,
        maxlength: 50,
        required:'please enter your name'
    },
    username: {
        type: String,
        trim: true,

        required: 'Please enter you',

    },
    password: {
        type: String,
        required: 'Please enter your password',

    },
    signupDate :{
        type: Date,
        required : true,
        default : () => new Date()
    }
});

User.plugin(passportLocalMongoose);


module.exports = mongoose.model('User', User);