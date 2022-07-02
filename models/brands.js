const mongoose = require ('mongoose')
const Schema = mongoose.Schema;

const brandSchema = new Schema({
    brandName:String,
})
const brand=mongoose.model('brand',brandSchema)
module.exports=brand