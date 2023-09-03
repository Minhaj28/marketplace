const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../../middleware/auth");
const Order = require("../../models/Order");
const Product = require("../../models/Product");


const router = express.Router();

router.post(
  "/",
  [
    authenticateToken,
    [
        body("productId", "productId is required").notEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    const id = req.user.id;
    const product = await Product.findById(req?.body?.productId)
    if(!product){
        return res.status(400).json({ massage: "product not found" });
    }
    const total = product.price * req.body.qty 
      const orderObj = {
        userId: id,
        productId: product._id,
        purchaseDate: new Date(),
        qty: req.body.qty ?? 1,
        status: 'in-progress',
        location: req.body.location ?? "",
        total: total ?? 0
      };

      const order = new Order(orderObj);
      await order.save();
      res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ massage: "Something is wrong with the server" });
    }
  }
);

router.get("/", authenticateToken, async (req, res) => {
  try {
    const id = req.user.id;
    const orders = await Order.find({userId: id});
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: "Something is wrong with the server" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const order = await Order.findOne({_id: id});
      if (order) {
        res.status(200).json(order);
      } else {
        res.status(404).json({ message: "order not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ massage: "Something is wrong with the server" });
    }
  });

router.put(
    "/status/:id",
    [
      authenticateToken,
      body("status", "status is invalid").isIn(['delivered','in-progress']),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const id = req.params.id;
        const status = req.body.status;

        const order = await Order.findOneAndUpdate({_id: id}, {status: status}, { new: true });
        if (order) {
          res.status(200).json(order);
        } else {
          res.status(404).json({ message: "order not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ massage: "Something is wrong with the server" });
      }
    }
  );

  // router.put(
  //   "/:id",
  //   [
  //     authenticateToken,
  //     body("status", "status is invalid").isIn(['delivered','in-progress']),
  //   ],
  //   async (req, res) => {
  //     try {
  //       const errors = validationResult(req);
  //       if (!errors.isEmpty()) {
  //         return res.status(400).json({ errors: errors.array() });
  //       }
  //       const id = req.params.id;
  //       const body = req.body;
  //       const order = await Order.findOneAndUpdate({_id: id}, body, { new: true });
  //       if (order) {
  //         res.status(200).json(order);
  //       } else {
  //         res.status(404).json({ message: "order not found" });
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       res.status(500).json({ massage: "Something is wrong with the server" });
  //     }
  //   }
  // );

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findOneAndDelete({_id: id});
    if (order) {
      res.status(200).json([order, { massage: "order deleted" }]);
    } else {
      res.status(404).json({ message: "order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: "Something is wrong with the server" });
  }
});

module.exports = router;