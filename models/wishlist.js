const mongoose=require('mongoose')
const wishSchema = new mongoose.Schema({
    user_Id:{type:mongoose.Schema.Types.ObjectId,
        ref:'users'},
        total:{type:Number,default:0},
    products:[{
        pro_Id:{type:mongoose.Schema.Types.ObjectId,
        ref:'product'}           
}]
    
})
const wishlist= mongoose.model('wishlist',wishSchema)
module.exports=wishlist