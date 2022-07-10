const db = require("../config/connections");
const userData = require("../models/user");
const nodeMailer = require("nodemailer");
const bcrypt = require("bcrypt");
const cart = require("../models/cart");
const productData = require("../models/product");
const { default: mongoose } = require("mongoose");
const orderModel = require("../models/order");
const Razorpay = require("razorpay");
const { log } = require("console");
const wishlist = require("../models/wishlist");
const couponmodel = require("../models/Coupon");
require("dotenv").config();

const instance = new Razorpay({
  key_id: "rzp_test_qtIvd5oa07B1XV",
  key_secret: "5R3TKTrqZCjAdtpqS8lPteIo",
});

module.exports = {
  doSignup: (doData) => {
    return new Promise(async (resolve, reject) => {
      const user = await userData.findOne({ email: doData.email });
      if (user) {
        reject({ status: false, msg: "Email already taken!" });
      } else {
        doData.password = await bcrypt.hash(doData.password, 10);

        const otpGenerator = await Math.floor(1000 + Math.random() * 9000);
        const newUser = await {
          name: doData.name,
          phone: doData.phone,
          email: doData.email,
          password: doData.password,
          otp: otpGenerator,
        };
        console.log(newUser);
        if (newUser) {
          try {
            const mailTransporter = nodeMailer.createTransport({
              host: "smtp.gmail.com",
              service: "gmail",
              port: 465,
              secure: true,
              auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
              },
              tls: {
                rejectUnauthorized: false,
              },
            });

            const mailDetails = {
              from: "pinnacleautoagencies@gmail.com",
              to: doData.email,
              subject: "just testing nodemailer",
              text: "just random texts ",
              html: "<p>hi " + doData.name + "your otp " + otpGenerator + "",
            };
            mailTransporter.sendMail(mailDetails, (err, Info) => {
              if (err) {
                console.log(err);
              } else {
                console.log("email has been sent ", Info.response);
              }
            });
          } catch (error) {
            console.log(error.message);
          }
        }
        resolve(newUser);
      }
    });
  },
  doLogin: (userDataaa) => {
    console.log(userDataaa);
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await userData.findOne({ email: userDataaa.email });
      // let admin= await adminData.findOne({email:userDataaa.email})
      // console.log(userData);
      // console.log(user.email);

      if (user) {
        if (user.block) {
          reject({ status: false, msg: "Your account has been blocked!" });
        } else {
          bcrypt.compare(userDataaa.password, user.password).then((status) => {
            if (status) {
              console.log("Login Success!");
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              console.log("Login Failed");
              reject({ status: false, msg: "Password not matching!" });
            }
          });
        }
      } else {
        console.log("Login Failed");
        reject({ status: false, msg: "Email not registered, please sign up!" });
      }
    });
  },

  doresetPasswordOtp: (resetData) => {
    return new Promise(async (resolve, reject) => {
      const user = await userData.findOne({ email: resetData.email });

      console.log(user);
      if (user) {
        const otpGenerator = await Math.floor(1000 + Math.random() * 9000);
        const newUser = await {
          email: resetData.email,
          otp: otpGenerator,
          _id: user._id,
        };
        console.log(newUser);

        try {
          const mailTransporter = nodeMailer.createTransport({
            host: "smtp.gmail.com",
            service: "gmail",
            port: 465,
            secure: true,
            auth: {
              user: "pinnacleautoagencies@gmail.com",
              pass: "jdvutmzeunufdmav",
            },
            tls: {
              rejectUnauthorized: false,
            },
          });

          const mailDetails = {
            from: "pinnacleautoagencies@gmail.com",
            to: resetData.email,
            subject: "just testing nodemailer",
            text: "just random texts ",
            html:
              "<p>Hi " +
              "user, " +
              "your otp for resetting Toycart account password is " +
              otpGenerator +
              ".",
          };
          mailTransporter.sendMail(mailDetails, (err, Info) => {
            if (err) {
              console.log(err);
            } else {
              console.log("email has been sent ", Info.response);
            }
          });
        } catch (error) {
          console.log(error.message);
        }

        resolve(newUser);
      } else {
        reject({ status: false, msg: "Email not registered, please sign up!" });
      }
    });
  },

  doresetPass: (rData, rid) => {
    console.log(rData);
    return new Promise(async (resolve, reject) => {
      let response = {};
      rData.password = await bcrypt.hash(rData.password, 10);

      let userId = rid;
      console.log(userId + "12");
      let resetuser = await userData.findByIdAndUpdate(
        { _id: userId },
        { $set: { password: rData.password } }
      );
      resolve(resetuser);
    });
  },
  addToCart: (pro_Id, user_Id) => {
    return new Promise(async (resolve, reject) => {
      const alreadyCart = await cart.findOne({ user_Id: user_Id });
      const product = await productData.findById({ _id: pro_Id });
      if (alreadyCart) {
        let proExist = alreadyCart.products.findIndex(
          (products) => products.pro_Id == pro_Id
        );
        if (proExist != -1) {
          cart
            .updateOne(
              { "products.pro_Id": pro_Id, user_Id: user_Id },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((response) => {
              resolve({ msg: "already in cart" });
            });
        } else {
          await cart
            .findOneAndUpdate(
              { user_Id: user_Id },
              { $push: { products: { pro_Id: pro_Id, price: product.price } } }
            )
            .then(async (res) => {
              resolve({ msg: '"Added", count: res.product.length + 1 ' });
            });
        }
      } else {
        const newcart = new cart({
          user_Id: user_Id,
          products: { pro_Id: pro_Id, price: product.price },
        });
        await newcart.save((err, result) => {
          if (err) {
            resolve({ err: "cart not created" });
          } else {
            resolve({ msg: "cart created", count: 1 });
          }
        });
      }
    });
  },

  addToWish: (pro_Id, user_Id) => {
    console.log("inside add to wish");
    return new Promise(async (resolve, reject) => {
      const alreadyWish = await wishlist.findOne({ user_Id: user_Id });
      if (alreadyWish) {
        let proExist = alreadyWish.products.findIndex(
          (products) => products.pro_Id == pro_Id
        );
        if (proExist != -1) {
          resolve({ err: "Product already in wishlist" });
        } else {
          await wishlist
            .findOneAndUpdate(
              { user_Id: user_Id },
              { $push: { products: { pro_Id: pro_Id } } }
            )
            .then(async (res) => {
              resolve({ msg: '"Added"' });
            });
        }
      } else {
        const newwish = new wishlist({
          user_Id: user_Id,
          products: { pro_Id: pro_Id },
        });
        await newwish.save((err, result) => {
          console.log("inside new wishsave");
          if (err) {
            resolve({ err: "wishlist not created" });
          } else {
            resolve({ msg: "wishlist created" });
          }
        });
      }
    });
  },

  getCartItems: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItem = await cart
        .findOne({ user_Id: userId })
        .populate("products.pro_Id")
        .lean();
      resolve(cartItem);
    });
  },
  getProductDetails: (proId) => {
    console.log(proId);
    return new Promise(async (resolve, reject) => {
      const product = await productData
        .findOne({ _id: proId })        
        .lean()
        .then((product) => {
          resolve(product);
        });
    });
  },
  changeProductQuantity: (data, user) => {
    return new Promise(async (resolve, response) => {
      const procount = parseInt(data.count);
      if (procount == -1 && data.quantity == 1) {
        await cart
          .findOneAndUpdate(
            { user_Id: user._id },
            {
              $pull: { products: { _id: data.cartid } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        await cart
          .findOneAndUpdate(
            { user_Id: user._id, "products.pro_Id": data.product },
            { $inc: { "products.$.quantity": procount } }
          )
          .then((response) => {
            resolve(true);
          });
      }
    });
  },
  removeProductFromCart: (data, user) => {
    return new Promise(async (resolve, reject) => {
      await cart
        .findOneAndUpdate(
          { user: user._id },
          {
            $pull: { products: { _id: data.cartid } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let user = await cart.findOne({ user_Id: userId });
      if (user) {
        count = user.products.length;
      }
      resolve(count);
    });
  },

  subTotal: (user) => {
    let id = mongoose.Types.ObjectId(user);
    return new Promise(async (resolve, reject) => {
      const amount = await cart.aggregate([
        {
          $match: { user_Id: id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            id: "$products.pro_Id",
            total: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      ]);
      let cartData = await cart.findOne({ user_Id: id });
      if (cartData) {
        amount.forEach(async (amt) => {
          await cart.updateMany(
            { "products.pro_Id": amt.id },
            { $set: { "products.$.subTotal": amt.total } }
          );
        });
        resolve();
      }
    });
  },
  totalAmount: (userData) => {   
    const id = mongoose.Types.ObjectId(userData);    
    return new Promise(async (resolve, reject) => {
      const total = await cart.aggregate([
        {
          $match: { user_Id: id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            quantity: "$products.quantity",
            price: "$products.price",
          },
        },
        {
          $project: {
            productname: 1,
            quantity: 1,
            price: 1,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$price"] } },
          },
        },
      ]);
      
      console.log("total amount");
      if (total.length == 0) {
        resolve({ status: true });
      } else {
        let grandTotal = total.pop();
        resolve({ grandTotal, status: true });
      }
    });
  },
  deliveryCharge: (amount) => {
    return new Promise((resolve, reject) => {
      if (amount < 500) {
        resolve(50);
      } else {
        resolve(0);
      }
    });
  },
  grandTotal: (netTotal, deliveryCharge) => {
    return new Promise((resolve, reject) => {
      const grandTotal = netTotal + deliveryCharge;
      resolve(grandTotal);      
    });
  },
  placeOrder: (order, cartItem, grandTotal, DeliveryCharges, netTotal, user) => {
    return new Promise(async (resolve, reject) => {
      grandTotal = parseInt(order.total) + parseInt(DeliveryCharges);
      let id = mongoose.Types.ObjectId(user._id);
      const status = order.paymentMethod === "cod" ? "placed" : "pending";
     
      const orderObj = await orderModel({
        user_Id: user._id,
        Total: grandTotal,
        ShippingCharge: DeliveryCharges,
        grandTotal: order.mainTotal,
        coupondiscountedPrice: order.discountedPrice,
        couponPercent: order.discoAmountpercentage,
        couponName: order.couponName,
        PaidAmount: order.mainTotal,
        payment_status: status,
        paymentMethod: order.paymentMethod,
        ordered_on: new Date(),
        product: cartItem.products,
        deliveryDetails: {
          name: order.name,
          number: order.number,
          email: order.email,
          house: order.house,
          localplace: order.localplace,
          town: order.town,
          district: order.district,
          state: order.state,
          pincode: order.pincode,
        },
      });
      await orderObj.save(async (err, res) => {
        const data = await cart.aggregate([
          {
            $match: { user: id },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              quantity: "$products.quantity",
              id: "$products.pro_Id",
            },
          },
        ]);
        data.forEach(async (amt) => {
          await productData.findOneAndUpdate(
            {
              _id: amt.id,
            },
            { $inc: { stock: -amt.quantity } }
          );
        });
        await cart.remove({ user: order.userId });
        resolve(orderObj);
      });
    });
  },
  getorderProducts: (orderid) => {
    return new Promise(async (resolve, reject) => {
      const orderdetails = await orderModel
        .findOne({ _id: orderid })        
        .lean();
      resolve(orderdetails);
    });
  },
  createRazorpay: (orderid, grandTotal) => {    
    return new Promise((resolve, reject) => {
      instance.orders.create(
        {
          amount: grandTotal * 100,
          currency: "INR",
          receipt: "" + orderid,
        },
        function (err, order) {
          if (err) {
            console.log(err);
          } else {            
            resolve(order);
          }
        }
      );
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "5R3TKTrqZCjAdtpqS8lPteIo");

      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {        
        resolve();
      } else {        
        reject();
      }
    });
  },
  changePayementStatus: (orderid) => {
    return new Promise(async (resolve, reject) => {
      const changestatus = await orderModel
        .findOneAndUpdate(
          { _id: orderid },
          {
            $set: { payment_status: "placed" },
          }
        )
        .then((changestatus) => {
          resolve(changestatus);
        });
    });
  },
  getAllOrderList: (userId) => {
    return new Promise(async (resolve, reject) => {
      const orderList = await orderModel
        .find({ user_Id: userId })
        .populate("product.pro_Id")
        .lean();
      resolve(orderList);
    });
  },
  getMostSell: () => {
    return new Promise(async (resolve, reject) => {
      const mostSell = await productData
        .find({ productType: "Most Selling" })
        .limit(5)
        .lean();
      resolve(mostSell);
    });
  },
  getfeaturedCat: () => {
    return new Promise(async (resolve, reject) => {
      const FeaturedCat = await productData
        .find({ productType: "Featured Product" })
        .lean()
        .populate("subCategory")
        .limit(4);     
      resolve(FeaturedCat);
    });
  },
  getAllCarosel: () => {
    return new Promise(async (resolve, reject) => {
      const carosel = await productData
        .find({ carosel: "Yes" })
        .lean()
        .limit(4);
      resolve(carosel);
    });
  },

  getWishItems: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishItem = await wishlist
        .findOne({ user_Id: userId })
        .populate("products.pro_Id")
        .lean();
      resolve(wishItem);
      console.log(
        wishItem + "0000000000000000000000000000000000000000000000000000"
      );
    });
  },
  getWishCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let user = await wishlist.findOne({ user_Id: userId });
      if (user) {
        count = user.products.length;
      }
      resolve(count);
    });
  },
  removeProductFromWish: (data, user) => {
    return new Promise(async (resolve, reject) => {
      await wishlist
        .findOneAndUpdate(
          { user: user._id },
          {
            $pull: { products: { _id: data.wishid } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },

  allproducts: () => {
    return new Promise(async (resolve, reject) => {
      const products = await productData.find({}).lean();
      resolve(products);
    });
  },
  filterbrands: (brandFilter) => {
    return new Promise(async (resolve, reject) => {
      let brandid = mongoose.Types.ObjectId(brandFilter);
      result = await productData.aggregate([
        {
          $match: { Brand: brandid },
        },
      ]);

      resolve(result);
    });
  },

  searchFilter: (brandFilter, categoryFilter, price) => {
    return new Promise(async (resolve, reject) => {
      let result;

      if (brandFilter && categoryFilter) {
        let brandid = mongoose.Types.ObjectId(brandFilter);
        let categoryid = mongoose.Types.ObjectId(categoryFilter);
        // console.log(brandid);
        // console.log(categoryid);
        result = await productData.aggregate([
          {
            $match: { brand: brandid },
          },

          {
            $match: { category: categoryid },
          },
          {
            $match: { price: { $lt: price } },
          },
        ]);
        // console.log("1");
      } else if (brandFilter) {
        let brandid = mongoose.Types.ObjectId(brandFilter);
        result = await productData.aggregate([
          {
            $match: { brand: brandid },
          },
          {
            $match: { price: { $lt: price } },
          },
        ]);
        // console.log("2");
        // console.log(result);
      } else if (categoryFilter) {
        let categoryid = mongoose.Types.ObjectId(categoryFilter);
        result = await productData.aggregate([
          {
            $match: { category: categoryid },
          },
          {
            $match: { price: { $lt: price } },
          },
        ]);
        // console.log("3");
      } else {
        result = await productData.aggregate([
          {
            $match: { price: { $lt: price } },
          },
        ]);
        // console.log("4");
      }
      resolve(result);
    });
  },

  getSearchProducts: (key) => {
    console.log(";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
    return new Promise(async (resolve, reject) => {
      const products = await productData
        .find({
          $or: [
            { productName: { $regex: new RegExp("^" + key + ".*", "i") } },
            // { Brand: { $regex: new RegExp("^" + key + ".*", "i") } },
            // { Category: { $regex: new RegExp("^" + key + ".*", "i") } },
          ],
        })
        .lean();
      console.log("====================");
      console.log(products);
      resolve(products);
    });
  },
  validateCoupon: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(data.coupon);
      obj = {};
      const coupon = await couponmodel.findOne({ couponCode: data.coupon });
      if (coupon) {
        if (coupon.limit > 0) {
          checkUserUsed = await couponmodel.findOne({
            couponCode: data.coupon,
            usedUsers: { $in: [userId] },
          });
          if (checkUserUsed) {
            obj.couponUsed = true;
            obj.msg = " You Already Used A Coupon";
            console.log(" You Already Used A Coupon");
            resolve(obj);
          } else {
            let nowDate = new Date();
            date = new Date(nowDate);
            if (date <= coupon.expirationTime) {
              await couponmodel.updateOne(
                { couponCode: data.coupon },
                { $push: { usedUsers: userId } }
              );
              await couponmodel.findOneAndUpdate(
                { couponCode: data.coupon },
                { $inc: { limit: -1 } }
              );
              let total = parseInt(data.total);
              let percentage = parseInt(coupon.discount);
              let discoAmount = ((total * percentage) / 100).toFixed();
              obj.discoAmountpercentage = percentage;
              obj.total = total - discoAmount;
              obj.success = true;
              resolve(obj);
            } else {
              obj.couponExpired = true;
              resolve(obj);
            }
          }
        } else {
          obj.couponMaxLimit = true;
          resolve(obj);
        }
      } else {
        obj.invalidCoupon = true;
        resolve(obj);
      }
    });
  },
  getAddresses: (user) => {
    return new Promise(async (resolve, response) => {
      const Addresses = await userData.findOne({ _id: user }).lean();
      resolve(Addresses);
    });
  },
  userprofile: (userid) => {
    return new Promise(async (resolve, reject) => {
      const user = await userData.findOne({ _id: userid }).lean();
      resolve(user);
    });
  },
  Editproflie: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      const Editproflie = await userData.findByIdAndUpdate(
        { _id: userId },
        { $set: { name: data.name, phone: data.mobile } }
      );
      resolve(Editproflie);
    });
  },
  addAddress: (data,userId) => {
    console.log();
    return new Promise(async (resolve, reject) => {
      const user = userData.findOne({ _id: userId });
      await userData.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            address: {
              fname: data.fname,
              lname: data.lname,
              house: data.house,
              towncity: data.towncity,
              district: data.district,
              state: data.state,
              pincode: data.pincode,
              email: data.email,
              mobile: data.mobile,
            },
          },
        }
      );
      resolve();
    });
  },


};
