const express = require("express");
const router = express.Router();
const adminHelpers = require("../helpers/adminHelpers");
const Storage = require("../middleware/multer");

const verifyLogin = (req, res, next) => {
  if (req.session.adminlogin) {
    next();
  } else {
    res.redirect("/admin");
  }
};

router.get("/", function (req, res, next) {
  res.render("admin/adminLogin", {
    logErr: req.session.adminloggErr,
    layout: false,
  });
  req.session.adminloggErr = null;
});

router.post("/adminLogin", function (req, res, next) {
  adminHelpers
    .doAdminLogin(req.body)
    .then((response) => {
      req.session.adminlogin = true;
      req.session.admin = response.admin;
      res.redirect("/admin/adminDash");
    })
    .catch((err) => {
      req.session.adminloggErr = err.msg;
      res.redirect("/admin");
    });
});

router.get("/adminDash", verifyLogin,async function (req, res, next) {  
  [OrderCount, ProductCount] = await Promise.all([
    adminHelpers.getOrderCount(),
    adminHelpers.getProductCount(),
  ]);
  adminHelpers.getAdmin().then((admin) => {
    res.render("admin/adminDash", { 
      layout: false,
      admin,
      OrderCount,
      ProductCount });
  });
});

router.get("/adminLogout", function (req, res, next) {
  res.redirect("/admin");
  req.session.destroy();
});

router.get("/productManage", verifyLogin, async function (req, res, next) {
  const products = await adminHelpers.getAllProducts();
  adminHelpers.getAdmin().then((admin) => {
    res.render("admin/productManage", { admin, products, layout: false });
  });
});

router.get("/userManage", verifyLogin, async function (req, res, next) {
  const user = await adminHelpers.getAllUsers();
  const admin = await adminHelpers.getAdmin();
  res.render("admin/userManage", { layout: false, user, admin });
});

router.get("/addbrands", verifyLogin, async (req, res) => {
  const categories = await adminHelpers.getAllCategory(); 
  res.render("admin/addBrands", {
    categories,
    layout: false,
    Err: req.session.loggE,
    Errc: req.session.loggC,
  });
  req.session.loggE = null;
  req.session.loggC = null;
});
router.post("/addBrands", (req, res) => { 
  adminHelpers
    .addBrand(req.body)
    .then((response) => {
      res.redirect("/admin/addbrands");
    })
    .catch((err) => {
      req.session.loggE = err.msg;     
      res.redirect("/admin/addbrands");
    });
});

router.post("/addCategory", (req, res) => { 
  adminHelpers
    .addCategory(req.body)
    .then((response) => {
      res.redirect("/admin/addBrands");
    })
    .catch((err) => {
      req.session.loggC = err.msg;      
      res.redirect("/admin/addbrands");
    });
});

router.post("/addSubcategory", (req, res) => {
  adminHelpers
    .addSubcategory(req.body)
    .then((response) => {
      res.redirect("/admin/addBrands");
    })
    .catch((err) => {
      req.session.loggSc = err.msg;
      console.log(req.session.loggSc);
      res.redirect("/admin/addbrands");
    });
});

router.delete("/User/:id", function (req, res, next) {
  const userId = req.params.id;
  userHelpers.deleteUser(userId).then((response) => {
    res.redirect("/admin/adminDash");
  });
});

router.get("/addProducts", verifyLogin, async (req, res) => {
  const category = await adminHelpers.getAllCategory();
  const brandName = await adminHelpers.getBrands();
  const subcategory = await adminHelpers.getAllSubcategory();  
  res.render("admin/addProduct", {
    category,
    subcategory,
    brandName,
    admin: true,
    layout: false,
  });
});

router.post(
  "/addProducts",
  Storage.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  function (req, res, next) {    
    let img1 = req.files.image1[0].filename;
    let img2 = req.files.image2[0].filename;
    let img3 = req.files.image3[0].filename;
    let img4 = req.files.image4[0].filename;
    console.log(req.body);
    adminHelpers
      .addProduct(req.body, img1, img2, img3, img4)
      .then((response) => {
        res.redirect("/admin/productManage");      
      });
  }
);
router.get("/deleteProduct/:id", verifyLogin, (req, res) => { 
  const proId = req.params.id;
  adminHelpers.deleteProduct(proId).then((response) => {
    req.session.removedProduct = response;
    res.redirect("/admin/productManage");
  });  
});
router.get("/editProduct/:id", verifyLogin, async (req, res) => {
  let product = await adminHelpers.getProductDetails(req.params.id); 
  const category = await adminHelpers.getAllCategory();
  const brandName = await adminHelpers.getBrands();
  const subcategory = await adminHelpers.getAllSubcategory(); 
  res.render("admin/editProduct", {
    subcategory,
    category,
    brandName,
    product,
    admin: true,
    layout: false,
  });
});
router.post(
  "/editProduct/:id",
  Storage.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  function (req, res) {
    const proId = req.params.id;
    const img1 = req.files.image1
      ? req.files.image1[0].filename
      : req.body.image1;
    const img2 = req.files.image2
      ? req.files.image2[0].filename
      : req.body.image2;
    const img3 = req.files.image3
      ? req.files.image3[0].filename
      : req.body.image3;
    const img4 = req.files.image4
      ? req.files.image4[0].filename
      : req.body.image4;
    console.log(img1, img2, img3, img4);
    adminHelpers
      .updateProduct(req.body, proId, img1, img2, img3, img4)
      .then((response) => {
        res.redirect("/admin/productManage");
      });
  }
);

router.get("/blockUser/:id", verifyLogin, (req, res) => {
  const proId = req.params.id;  
  adminHelpers.blockUser(proId).then((response) => {
    res.json({ status: true });
  });
});
router.get("/unBlockUser/:id", verifyLogin, (req, res) => {
  const proId = req.params.id; 
  adminHelpers.unBlockUser(proId).then((response) => {});
});

router.get("/orders", verifyLogin, async (req, res) => {
  const allOrders = await adminHelpers.allOrders();
  const admin = await adminHelpers.getAdmin();
  res.render("admin/orders", { allOrders,admin,layout:false });
});

router.get("/orderDetails/:id", verifyLogin,async (req, res) => {
  const admin =await adminHelpers.getAdmin()
  adminHelpers.orderDetails(req.params.id).then((response) => {
    const order = response;
    res.render("admin/orderDetails", { order, admin, layout: false });
  });
});
router.post("/changeProductType", (req, res) => { 
  adminHelpers.changeProductType(req.body).then((response) => {
    res.redirect("/admin/productManage");
  });
});
router.post("/changeCarosel", (req, res) => {  
  adminHelpers.changeCarosel(req.body).then((response) => {
    res.redirect("/admin/productManage");
  });
});
router.post("/changeOrderStatus", (req, res) => { 
  adminHelpers.changeOrderStatus(req.body).then((response) => {   
    res.json({modified:true}); 
  });
});
router.get("/coupon-manegement", (req, res) => {
  adminHelpers.getAllCoupons(req.body).then((response) => {
    const AllCoupons = response;
    res.render("admin/coupon-manegement", { AllCoupons, layout: false });
  });
});
router.get("/deletecoupon/:id", (req, res) => {
  adminHelpers.deletecoupon(req.params.id).then((response) => {
    res.json({ coupondeleted: true });
  });
});

router.get("/addcoupon", (req, res) => {
  res.render("admin/addcoupon", { layout: false });
});
router.post("/AddCoupon", (req, res) => {
  adminHelpers.AddCoupon(req.body).then(() => {
    res.redirect("/admin/coupon-manegement");
  });
});


module.exports = router;
