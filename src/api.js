const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./connectDB");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const path = require("path")

const app = express();
const router = express.Router();

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

const invoiceModel = mongoose.model("invoice_informations", {
  name: String,
  email: String,
  invoiceNo: Number,
  purchaseNo: Number,
  customerName: String,
  issueDate: Date,
  dueDate: Date,
  item: Array,
  total: Number,
  description: String,
  pdf: Buffer,
});

router.get('/',(req,res) => {
  res.json({
    "it":"hello"
  })
})

router.post("/doSomething", async (req, res) => {
  try {
    if (req.files == null) {
      const item = JSON.parse(req.body.items);
      const data = await invoiceModel({
        name: req.body.name,
        email: req.body.email,
        invoiceNo: req.body.invoiceNo,
        purchaseNo: req.body.purchaseNo,
        customerName: req.body.customerName,
        issueDate: req.body.issueDate,
        dueDate: req.body.dueDate,
        item: req.body.item,
        total: req.body.total,
        description: req.body.description,
      });
      const dataSave = await data.save();
      res.send(dataSave);
    } else {
      const file = req.files.file;
      const filePath = `/media/emon/information/learn vue/amberleyBackend/src/files/${file.name}`
      file.mv(filePath, (err) => {
        if (err) {
          res.send(err);
        }
        const pdf = file.data
        const invoiceDataWithFile = {
          name: req.body.name,
          email: req.body.email,
          invoiceNo: req.body.invoiceNo,
          purchaseNo: req.body.purchaseNo,
          customerName: req.body.customerName,
          issueDate: req.body.issueDate,
          dueDate: req.body.dueDate,
          item: req.body.item,
          total: req.body.total,
          description: req.body.description,
          pdf,
        };
        const data = invoiceModel(invoiceDataWithFile);

        //save data to database
        const dataSave =  data.save();
        res.send(JSON.stringify({name:"success"}))
      });
    }
  } catch (err) {
    res.status(400).send({ error: "bad request" });
  }
});
app.use("/.netlify/functions/api", router);

module.exports = app;
module.exports.handler = serverless(app);
