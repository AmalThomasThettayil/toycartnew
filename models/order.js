const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  user_Id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  paymentMethod: { type: String },
  coupondiscountedPrice:{type:Number,default:0},
  couponPercent:{type:Number,default:0},
  couponName:{type:String},
  PaidAmount:{type:Number},
  reFund:{type:Number,default:0},
  product: [
    {
      pro_Id: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
      price: { type: Number },
      quantity: { type: Number, default: 1 },
      subTotal: { type: Number, default: 0 },
      orderCancelled:{type:Boolean,default:false},
      productName:{type:String},
      status:{type:String,default:'Order placed'}
    },
  ],
  deliveryDetails:
    {
      name: String,
      number: String,
      email: String,
      house: String,
      localplace: String,
      town: String,
      district: String,
      state: String,
      pincode: Number,
    }
,
  Total:{type:Number},
  ShippingCharge:{type:Number},
  grandTotal: { type: Number, default: 0 },
  ordered_on: { type: Date },
  payment_status: { type: String },
});
const orderModel = mongoose.model("order", orderSchema);
module.exports = orderModel;