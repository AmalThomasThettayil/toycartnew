const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:String,
    phone:Number,
    email:String,
    password:String
})
const admin=mongoose.model('admin',UserSchema)
module.exports=admin