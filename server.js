const express = require("express");
const app = express();

require("dotenv").config(); 



const bodyParser = require('body-parser')
app.use(bodyParser.json());

const connectDB = require("./config/db");
connectDB();

app.get("/", (req, res) => {
    res.status(200).json({ msg: "I am connected" });
  });



app.use('/api/users', require('./routes/api/users'));
app.use('/api/products', require('./routes/api/products'));
app.use('/api/uploads', require('./routes/api/uploads'));
app.use('/api/orders', require('./routes/api/orders'));



const port = process.env.PORT;
app.listen(port, () => {
  console.log(`I am running on port ${port}`);
});