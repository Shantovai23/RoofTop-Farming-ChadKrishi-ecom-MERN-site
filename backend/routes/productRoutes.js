import express from "express";
import asyncHandler from "express-async-handler";
import products from "../data/products.js";
import Product from "../models/productModel.js";

const router = express.Router();

//Fetch all Products
//GET/api/products
//access public

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await Product.find({});
    // throw new Error('Error!')
    res.json(products);
  })
);

//Fetch single Product
//GET/api/products/:id
//access public

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404)
      throw new Error('Product Not Found')
    }
  })
);

export default router;