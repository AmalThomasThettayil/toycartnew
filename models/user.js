const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  signed: {
    type: Date,
    default: Date.now,
  },
  block: {
    type: Boolean,
  },
  address:[{
    fname:String,
    lname:String,
    house:String,
    towncity:String, 
    district:String,
    state:String,
    pincode:Number, 
    email:String,
    mobile:String,
    locality:String,
}],
});
const User = mongoose.model("user", UserSchema);
module.exports = User;
