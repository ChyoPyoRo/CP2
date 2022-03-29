const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Article = new Schema({
    _id: Schema.Types.ObjectId,
    title :{
        type:String
    },
    content:{
        type: String
    },
    createDate : {
        type: Date,
        required : true,
        default : () => new Date()
    },
    writer:{
        type: Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique: false
    }
})

Article.plugin(passportLocalMongoose);
module.exports = mongoose.model('Article',Article)