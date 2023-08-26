const express = require("express");
const router = express.Router();
const multer  = require('multer')
// const upload = multer({ dest: './public/files/' })
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/files/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // const uniqueSuffix = "nature.jpg"
    cb(null, file.fieldname + '-' + uniqueSuffix +'-'+ file.originalname)
  }
})
const upload = multer({ storage: storage })

router.post("/", upload.single('file'), (req, res) => {
    res.json(req.file)
})

module.exports = router;
