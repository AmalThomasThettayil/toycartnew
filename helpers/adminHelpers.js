const userData = require("../models/user");
const brand = require("../models/brands");
const category = require("../models/categories");
const subcategory = require("../models/subcategories");
const productData=require('../models/product');
const orderModel = require('../models/order')
const adminData=require('../models/admin');
const bcrypt = require("bcrypt");

module.exports = {
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await userData.find().lean();
      resolve(users);
    });
  },

  addBrand: (data) => {
    return new Promise(async (resolve, reject) => {
      const brandNames = data.brand;
      console.log(brandNames,'sfasfasfasfas');
      const brandOld = await brand.findOne({ brandName: brandNames });
      if (brandOld) {
        reject({ status: false, msg: "Brand already added!" });
      } else {
        const addBrand = await new brand({
          brandName: brandNames,
        });
        await addBrand.save(async (err, result) => {
          if (err) {
            reject({ msg: "Brand not added" });
          } else {
            resolve({ result, msg: "Brand added" });
          }
        });
      }
    });
  },
  addCategory: (data) => {
    return new Promise(async (resolve, reject) => {
      const categoryNames = data.category;
      console.log(categoryNames,'sfasfasfasfas');
      const categoryOld = await category.findOne({ category: categoryNames });
      if (categoryOld) {
        reject({ status: false, msg: "Category already added!" });
      } else {
        const addCategory = await new category({
          category: categoryNames
        });
        await addCategory.save(async (err, result) => {
          if (err) {
            reject({ msg: "Category not added" });
          } else {
            resolve({ result, msg: "Category added" });
          }
        });
      }
    });
  },
  getAllCategory:()=>{
    return new Promise(async(resolve,reject)=>{
        const allCategory=await category.find({}).lean()       
        resolve(allCategory);
    })
},
getBrands:()=>{
  return new Promise(async(resolve,reject)=>{
      const allBrands=await brand.find({}).lean()
      resolve(allBrands);
  })
},
getAllSubcategory:()=>{
  return new Promise(async(resolve,reject)=>{
      const AllSubcategory=await subcategory.find({}).lean()
      resolve(AllSubcategory);
  })
},
addSubcategory:(data)=>{
  return new Promise(async (resolve, reject) => {
    const subcategoryNames = data.subcategory;
    console.log(subcategoryNames,'sfasfasfasfas');
    const subcategoryOld = await subcategory.findOne({ subcategory: subcategoryNames });
    if (subcategoryOld) {
      reject({ status: false, msg: "Sub-Category already added!" });
    } else {
      const addSubcategory = await new subcategory({
        subcategory: subcategoryNames
      });
      await addSubcategory.save(async (err, result) => {
        if (err) {
          reject({ msg: "Sub-Category not added" });
        } else {
          resolve({ result, msg: "sub_Category added" });
        }
      });
    }
  });
},
addProduct:(data,image1,image2,image3,image4)=>{
  return new Promise(async(resolve,reject)=>{
    console.log('in add product');
      const subcategoryData=await subcategory.findOne({subcategory:data.subcategory})
      const brandData = await brand.findOne({brandName:data.brand})
      const categoryData=await category.findOne({category:data.category})
      console.log(subcategoryData);
      console.log(brandData); 
      // const categorydata=await category.findOne({category:data.categoryname})
    //   console.log(product.productName+'/////////////');.
    console.log(image1);
if(!image2){ 
reject({msg:'upload image'})
}else{
      const newProduct=await productData({
        productName:data.productName,
        description:data.description,
        price:data.price,
        discount:data.discount,       
        stock:data.stock,        
        subCategory:subcategoryData._id,
        category:categoryData._id,
        brand:brandData._id,
        image:{image1,image2,image3,image4}
      })
     await newProduct.save(async(err,res)=>{
if(err){

}
resolve({data:res,msg:'Product add success'})
     })
    }
  })

},
getAllProducts:()=>{
  console.log('in get all products');
  return new Promise(async(resolve,reject)=>{
    console.log('inside rs');
    const allProducts= await productData.find({}).lean();
    resolve(allProducts)
  })
},
deleteProduct:(proId)=>{
  return new Promise(async(resolve,reject)=>{
    const removedProduct = await productData.findByIdAndDelete({_id:proId})
    resolve(removedProduct)
  })
},
getProductDetails:(proId)=>{
return new Promise(async(resolve,reject)=>{
  const productDetails = await productData.findOne({_id:proId}).lean().then((productDetails)=>{
    resolve(productDetails)
    console.log(productDetails);
  })
})
},
updateProduct:(data,proId,image1,image2,image3,image4)=>{
  return new Promise(async(resolve,reject)=>{
    console.log('HGGGGGGGGGGGGGGGGGGGGGGGGGGGGD');
    console.log(image1);
    console.log(proId);
    const subcategoryData=await subcategory.findOne({subcategory:data.subcategory})
    const brandData = await brand.findOne({brandName:data.brand})
    const categoryData=await category.findOne({category:data.category})
    const updateProduct=await productData.findByIdAndUpdate({_id:proId},{
      $set:{
        productName:data.productName,
        description:data.description,
        price:data.price,
        discount:data.discount,
        stock:data.stock,
        subcategory:subcategoryData._id,
        category:categoryData._id,
        brand:brandData._id,
        image:{image1,image2,image3,image4}
      }
    })
    resolve({updateProduct,msg:'success'})
  })
},
blockUser: (userId) => {
  console.log(userId);
  return new Promise(async (resolve, reject) => {
    const user = await userData.findByIdAndUpdate(
      { _id: userId },
      { $set: { block: true } },
      { upsert: true }
    );
    resolve(user);
  });
},

unBlockUser: (userId) => {
  return new Promise(async (resolve, reject) => {
    const user = await userData.findByIdAndUpdate(
      { _id: userId },
      { $set: { block: false } },
      { upsert: true }
    );
    resolve(user);
  });
},
allOrders:()=>{
  return new Promise(async(resolve,reject)=>{
      const allOrders= await orderModel.find({}).populate("product.pro_Id").lean()
      resolve(allOrders)
  })
},
orderDetails:(orderId)=>{return new Promise(async(resolve,reject)=>{
    const orderDetails=await orderModel.findOne({_id:orderId}).populate("product.pro_Id").lean()
    resolve(orderDetails)
  })

},
changeProductType:(data) =>{
  return new Promise(async (resolve,reject)=>{
      await productData.findByIdAndUpdate(
          { _id: data.proId },
          { $set: { productType: data.productType } }
      ).then((response)=>{
          console.log("777777777777777777777777777777777777777777777777777")
          resolve(response)
      }).catch((err)=>{
          console.log(err,"7777777777777777777777777777777777777777777777777777777777")
      })
  })
},
changeCarosel:(data) =>{
  return new Promise(async (resolve,reject)=>{
      await productData.findByIdAndUpdate(
          { _id: data.proId },
          { $set: { carosel: data.carosel } }
      ).then((response)=>{          
          resolve(response)
      }).catch((err)=>{
          console.log(err)
      })
  })
},
doAdminLogin: (data) => {
  return new Promise(async (resolve, reject) => {
    let response = {};
    const admin = await adminData.findOne({ email: data.email });
    if (admin) {      
      bcrypt.compare(data.password, admin.password).then((status) => {
        if (status) {
          console.log("admin login true");
          response.admin = admin;
          response.status = true;
          resolve(response);
        } else {
          console.log("login error");
          reject({ status: false,msg: "Your password is incorrect" });
        }
      });
    } else {
      console.log("Login Failed");
      reject({ status: false,msg: "Your username is incorrect" });
    }
  });
},


}
