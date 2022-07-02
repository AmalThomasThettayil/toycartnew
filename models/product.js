const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productSchema = new Schema({
    productName:String,
    price:Number,
    discount:Number,
    stock:Number,
    description:String,
    category:{
    type:mongoose.Schema.Types.ObjectId,
        ref:'category',
        require:true
    },
    subCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'subcategory',
        require:true
    },
    brand:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'brand',
        require:true
    },
    image:{
        type:Array
    },
    productType:{
        type:String,
        default:'New Arrival'
    },
    carosel:{
        type:String,
        default:'No'
    }

    
})
const product=mongoose.model('product',productSchema)
module.exports=product