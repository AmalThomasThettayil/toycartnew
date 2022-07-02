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
});
const User = mongoose.model("user", UserSchema);
module.exports = User;
