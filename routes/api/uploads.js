const express = require("express");
const router = express.Router();
const File = require("../../models/File");
const multer = require("multer");
// const upload = multer({ dest: './public/files/' })
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/files/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // const uniqueSuffix = "nature.jpg"
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const fileObj = {
      name: req.file.filename,
      path: req.file.path,
    };
    const file = new File(fileObj);
    await file.save();
    res.status(201).json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ massage: "Something is wrong with the server" });
  }
});

module.exports = router;
