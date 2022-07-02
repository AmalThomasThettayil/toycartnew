const express = require("express");
const router = express.Router();
const userHelpers = require("../helpers/userHelpers");
const user = require("../models/user");
const adminHelpers = require("../helpers/adminHelpers");
const products = require("../models/product");
const { response } = require("express");
let filterResult

const verifyLogin = (req, res, next) => { 
  if (req.session.logedin) {
    next();
  } else {
    res.redirect("/userLogin");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  const user = req.session.user;
  let cartCount = null;
  let wishCount = null;
  if (user) {
    [cartCount, wishCount] = await Promise.all([
      userHelpers.getCartCount(user),
      userHelpers.getWishCount(user),
    ]);
  }

  [mostSelling, featuredCat, category, allProducts,carosel] = await Promise.all([
    userHelpers.getMostSell(),
    userHelpers.getfeaturedCat(),
    adminHelpers.getAllCategory(),
    adminHelpers.getAllProducts(),
    userHelpers.getAllCarosel()
  ]);
  res.render("user/home new", {
    category,
    user,
    allProducts,
    cartCount,
    mostSelling,
    featuredCat,
    wishCount,
    carosel
  });
});

router.get("/userLogin", function (req, res, next) {
  if (req.session.logedin) {
    res.redirect("/");
  } else
    res.render("user/uLogin", {
      signupSuccess: req.session.signupSuccess,
      loggErr: req.session.loggedInError,
      signuperror: req.session.loggErr2,
      passwordreset: req.session.message,
      title: "userLogin",
      layout: false,
    });
  req.session.signupSuccess = null;
  req.session.loggErr2 = null;
  req.session.loggedInError = null;
  req.session.message = null;
});

router.get("/uSignup", function (req, res, next) {
  let user = req.session.user;
  const passErr = req.session.passErr;
  res.render("user/uSignup", { layout: false, passErr });
  req.session.passErr = null;
});

router.post("/signUp", function (req, res, next) {
  if (req.body.password == req.body.newpassword) {
    userHelpers
      .doSignup(req.body)
      .then((response) => {
        console.log(response);
        req.session.otp = response.otp;
        req.session.userdetails = response;
        res.redirect("/otp");
      })
      .catch((err) => {
        req.session.loggErr2 = err.msg;
        res.redirect("/uSignup");
      });
  } else {
    console.log("password mismatch");
    req.session.passErr = "Password mismatch";
    res.redirect("/uSignup");
  }
});

router.get("/otp", function (req, res, next) {
  res.render("user/otpSignup", { layout: false, otpErr: req.session.otpError });
});

router.post("/otpverify", async (req, res) => {
  if (req.session.otp == req.body.otpsignup) {
    let userData = req.session.userdetails;
    const adduser = await new user({
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
    });
    await adduser.save();
    req.session.signupSuccess = "Signup Successful! Please login to continue";
    res.redirect("/userLogin");
  } else {
    console.log("otp incorrect");
    req.session.otpError = "OTP not matching!";
    res.redirect("/otp");
  }
});

router.post("/login", (req, res) => {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  console.log(req.body);
  userHelpers
    .doLogin(req.body)
    .then((response) => {
      console.log("inside dologin");
      if (response.user) {
        req.session.logedin = true;
        req.session.user = response.user;
        res.redirect("/");
      }
      // else if(response.admin){
      //   req.session.logedinadmin=true;
      //   req.session.user=response.admin
      //   res.redirect('')
      // }
      else {
        req.session.logedinErr = true;
        res.redirect("/userLogin");
      }
    })
    .catch((err) => {
      req.session.loggedInError = err.msg;
      res.redirect("/userlogin");
    });
});

router.get("/logout", function (req, res, next) {
  res.redirect("/");
  req.session.destroy();
});
router.get("/forgetPassword", function (req, res, next) {
  res.render("user/forgetPassword", { layout: false });
});

router.post("/forget", async (req, res) => {
  userHelpers
    .doresetPasswordOtp(req.body)
    .then((response) => {
      console.log(response);
      req.session.otp = response.otp;
      req.session.userdetails = response;
      req.session.userRID = response._id;
      // console.log(req.session.userRID+'hhhhh');
      res.redirect("/otpReset");
    })
    .catch((err) => {
      req.session.loggErr2 = err.msg;
      res.redirect("/userlogin");
    });
});

router.get("/otpReset", function (req, res, next) {
  res.render("user/otpReset", { layout: false, otpErr: req.session.otpError });
});

router.post("/otpResetVerify", async (req, res) => {
  if (req.session.otp == req.body.otpsignup) {
    res.redirect("/newPassword");
  } else {
    console.log("otp incorrect");
    req.session.otpError = "OTP not matching!";
    res.redirect("/otpReset");
  }
});
router.get("/newPassword", function (req, res, next) {
  res.render("user/newPassword", {
    layout: false,
    otpErr: req.session.otpError,
    passErr: req.session.passErr,
  });
  req.session.passErr = null;
  req.session.otpError = null;
});

router.post("/RPass", async (req, res) => {
  console.log(req.body);
  if (req.body.password == req.body.confirmPassword) {
    userHelpers.doresetPass(req.body, req.session.userRID).then((response) => {
      console.log(response);
      req.session.message =
        "Password changed succesfully! Please login with new password";
      res.redirect("/userLogin");
      console.log("Password updated");
    });
  } else {
    console.log("password mismatch");
    req.session.passErr = "Password mismatch";
    res.redirect("/newPassword");
  }
});

router.get("/uLogin", function (req, res, next) {
  res.render("user/uLogin", { layout: false });
});

router.get("/cartNew", verifyLogin, async function (req, res, next) { 
  let user = req.session.user;
  if (user) {
    cartCount = await userHelpers.getCartCount(user);
    wishCount = await userHelpers.getWishCount(user);
  }
  if (cartCount > 0) {
    [subTotal, totalAmount] = await Promise.all([
      userHelpers.subTotal(req.session.user._id),
      userHelpers.totalAmount(req.session.user._id),
    ]);
    const netTotal = await totalAmount.grandTotal.total;
    const deliveryCharge = await userHelpers.deliveryCharge(netTotal);
    const grandTotal = await userHelpers.grandTotal(netTotal, deliveryCharge);
    const cartItems = await userHelpers.getCartItems(user._id);

    res.render("user/cartNew", {
      cartCount,
      user,
      cartItems,
      subTotal,
      netTotal,
      deliveryCharge,
      grandTotal,
      wishCount,
    });
  } else {
    let cartItem = await userHelpers.getCartItems(req.session.user._id);
    let cartItems = cartItem ? products : [];
    netTotal = 0;
    cartCount = 0;
    deliveryCharge = 0;
    grandTotal = 0;
    res.render("user/cartNew", {
      cartItems,
      netTotal,
      cartCount,
      deliveryCharge,
      grandTotal,
      user,
      wishCount,
    });
  }
});

router.get("/add-tocart/:id", verifyLogin, (req, res) => {
  console.log("add to cart");
  userHelpers
    .addToCart(req.params.id, req.session.user._id)
    .then((response) => {
      console.log("req.session.user._id");
      res.json(response);
    })
    .catch((err) => {
      console.log("33333333333333333333333");
      console.log(err.msg);
      res.redirect("/home");
    });
});

router.get("/addToWishlist/:id", verifyLogin, (req, res) => {
  userHelpers
    .addToWish(req.params.id, req.session.user._id)
    .then((response) => {
      res.json(response);
    })
    .catch((error) => {
      res.redirect("/home");
    });
});

router.post("/change-product-quantity", (req, res) => {
  userHelpers.changeProductQuantity(req.body, req.session.user).then();
  res.json({ status: true });
});
router.post("/removeProductFromCart", (req, res) => {
  userHelpers.removeProductFromCart(req.body, req.session.user).then(() => {
    res.json(response);
  });
});

router.get("/productDetails/:id", async (req, res) => {
  const user = req.session.user
  cartCount=''
  wishCount=''
  if (user) {
    [cartCount,wishCount] = await Promise.all([
      userHelpers.getCartCount(user),
      userHelpers.getWishCount(user),
      
    ]);
  }
  const mostSelling=await userHelpers.getMostSell()
  let product = await userHelpers.getProductDetails(req.params.id); 
  res.render("user/productDetails", {
    product,
    user,
    cartCount,
    wishCount,
    category,
    mostSelling,
  });
});

router.get("/checkout", async (req, res) => {
  const user = req.session.user;
  let cartCount = null;
  let wishCount = null;
  if (user) {
    [cartCount, wishCount] = await Promise.all([
      userHelpers.getCartCount(user),
      userHelpers.getWishCount(user),
    ]);
  }
  
  const cartItems = await userHelpers.getCartItems(req.session.user._id);
  const subTotal = await userHelpers.subTotal(req.session.user._id);
  const totalAmount = await userHelpers.totalAmount(req.session.user._id);
  const netTotal = totalAmount.grandTotal.total;
  const deliveryCharge = await userHelpers.deliveryCharge(netTotal);
  const grandTotal = await userHelpers.grandTotal(netTotal, deliveryCharge);
  const category = await adminHelpers.getAllCategory()
  res.render("user/checkout", {
    netTotal,
    deliveryCharge,
    grandTotal,
    subTotal,
    user,
    cartItems,
    cartCount,
    wishCount,
    category
  });
});
router.post("/placeOrder", async (req, res) => {
  const cartItem = await userHelpers.getCartItems(req.session.user._id);
  const totalAmount = await userHelpers.totalAmount(req.session.user._id);
  const netTotal = totalAmount.grandTotal.total;
  const deliveryCharge = await userHelpers.deliveryCharge(netTotal);
  const grandTotal = await userHelpers.grandTotal(netTotal, deliveryCharge);
  userHelpers
    .placeOrder(
      req.body,
      cartItem,
      grandTotal,
      deliveryCharge,
      netTotal,
      req.session.user
    )
    .then((response) => {
      req.session.orderId = response._id;
      const orderId = response._id;
      console.log(orderId);
      if (req.body["paymentMethod"] === "cod") {
        console.log("++");
        res.json({ codSuccess: true });
      } else {
        userHelpers.createRazorpay(orderId, grandTotal).then((response) => {
          res.json(response);
        });
      }
    });
});
router.get("/viewOrderDetails", async (req, res) => {
  let user = req.session.user;
  userHelpers.getorderProducts(req.session.orderId).then((response) => {
    const orderProducts = response;
    console.log(
      orderProducts + "666666666666666666666666444444444444444444444"
    );
    res.render("user/orderSuccess", { user, orderProducts, layout: false });
  });
});

router.post("/verifyPayment", (req, res) => {
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers
        .changePayementStatus(req.body["order[receipt]"])
        .then((response) => {
          res.json({ status: true });
        });
    })
    .catch((err) => {
      res.json({ status: false });
    });
});

router.get("/orderPage", async (req, res) => {
  let user = req.session.user;
  console.log(user);
  userHelpers.getAllOrderList(user._id).then((response) => {
    const orderProducts = response;
    console.log(orderProducts + "444444444444444444444444444444444444444444");
    res.render("user/orderPage", { user, orderProducts, layout: false });
  });
});
router.get("/orderTracking/:id", async (req, res) => {
  const orderId = req.params.id;
  let user = req.session.user;
  userHelpers.getorderProducts(orderId).then((response) => {
    const orderProducts = response;
    console.log(orderProducts + "99999999999999999999999999999999999999");
    // console.log(req.session.orderId);
    res.render("user/orderTracking", { user, orderProducts, layout: false });
  });
});
router.get("/singlePProduct/:id", async (req, res) => {
  const productId = req.params.id;
  let user = req.session.user;
  console.log(user);
  console.log(productId + "777777777777777777777777777777");
  userHelpers.getorderProducts(orderId).then((response) => {
    const orderProducts = response;
    console.log(orderProducts + "99999999999999999999999999999999999999");
    // console.log(req.session.orderId);
    res.render("user/orderTracking", { user, orderProducts, layout: false });
  });
});

router.get("/wishlist", async (req, res) => {
  const user = req.session.user;
  if (user) {
    wishCount = await userHelpers.getWishCount(user);
    cartCount = await userHelpers.getCartCount(user);
  }
  const category = await adminHelpers.getAllCategory();
  userHelpers.getWishItems(user._id).then((response) => {
    const wishList = response;
    res.render("user/wishlist", {
      user,
      wishList,
      wishCount,
      category,
      cartCount,
    });
  });
});
router.delete("/ProductFromWish", (req, res, next) => {
  console.log("inside remove");
  userHelpers.removeProductFromWish(req.body, req.session.user).then(() => {
    res.json({ status: true });
  });
});

// router.get("/shop",(req,res)=>{
//   const allProducts = adminHelpers.getAllProducts()
//   res.render("user/category",{allProducts})
// })

router.post('/search-filter', (req, res) => {
  // console.log("gjhdukhjlsd;===================");
  console.log(req.body);
  let a = req.body
  let price = parseInt(a.Prize)
  let brandFilter =a.brand
  let categoryFilter = a.category

  // for (let i of a.brand) {
  //   brandFilter.push({ 'brand': i })
  // }
  // for (let i of a.category) {
  //   categoryFilter.push({ 'category': i })
  // }
  userHelpers.searchFilter(brandFilter, categoryFilter, price).then((result) => {
    filterResult = result
    // console.log("==============================================");
// console.log(result);
    res.json({ status: true })
  })

})

router.post("/search", async (req, res) => {
  // console.log("=============================================");
  // console.log(req.body);
  // console.log("[[[[[[[[");
  let key = req.body.key;
  // console.log(key);
  userHelpers.getSearchProducts(key).then((response)=>{
    // console.log(";;;;;;;;;;;;;;");
    filterResult=response
    res.redirect("/filterPage")
// res.json(response)
    // filterResult = response
    // res.redirect('/filterPage')

  })
});

router.get('/shop', (req, res) => {
  userHelpers.allproducts().then(async (products) => {
    filterResult = products
    res.redirect('/filterPage')
  })

})

router.get('/filterPage', async (req, res) => { 
  let cartcount = ''
  let user = req.session.user
  if (user) {
    cartcount=await userHelpers.getCartCount(req.session.user._id)
// console.log(cartcount);
  }
  let category =await adminHelpers.getAllCategory();
  let brands =await adminHelpers.getBrands()
  // console.log(filterResult);
  // console.log();
  res.render('user/b', { filterResult, category, brands, cartcount, layout:false})

})



// router.get("/product-details/:id", async (req, res) => {
//   let product = await userHelper.getproductdetalis(req.params.id);
//   console.log(product);
//   res.render("product-details", {product,layout:false});
// });

module.exports = router;
