const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const User = require("../../models/User");
const Product = require("../../models/Product");
const File = require("../../models/File");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../../middleware/auth");

const router = express.Router();

router.post(
  "/",
  [
    authenticateToken,
    [
        body("name", "name is required").notEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

    if(req?.user?.type != 'admin'){
        return res.status(400).json({massage: "you are not a admin"});
    }

    const id = req.user.id;
      const productObj = {
        name: req.body.name,
        desc: req.body.desc ?? "",
        madeIn: req.body.madeIn ?? "",
        price: req.body.price ?? "",
        expireAt: new Date(),
        fileId: req.body.fileId ?? "",
        userId: id,
      };
      const product = new Product(productObj);
      await product.save();
      if(product?.fileId){
        const createdProduct =  await Product.findById(product._id).populate(['fileId','userId']).exec()
        res.status(201).json(createdProduct);
      }
    //   res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ massage: "Something is wrong with the server" });
    }
  }
);

router.get("/", authenticateToken, async (req, res) => {
  try {
    const id = req.user.id;
    const products = await Product.find({userId: id});
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: "Something is wrong with the server" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.user.id;
      const product = await Product.findOne({userId: userId, _id: id});
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ message: "product not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ massage: "Something is wrong with the server" });
    }
  });

  router.put(
    "/:id",
    [
      authenticateToken,
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const id = req.params.id;
        const body = req.body;
        const userId = req.user.id;

        const product = await Product.findOneAndUpdate({userId: userId, _id: id}, body, { new: true });
        if (product) {
          res.status(200).json(product);
        } else {
          res.status(404).json({ message: "product not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ massage: "Something is wrong with the server" });
      }
    }
  );

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;

    const product = await Product.findOneAndDelete({userId: userId, _id: id});
    if (product) {
      res.status(200).json([product, { massage: "product deleted" }]);
    } else {
      res.status(404).json({ message: "product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: "Something is wrong with the server" });
  }
});

module.exports = router;