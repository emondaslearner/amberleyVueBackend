const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./connectDB");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const router = express.Router();

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

const invoiceSchema = new mongoose.Schema(
  {
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
    pdf: { pdf: Buffer, contentType: String },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("invoice_informations", invoiceSchema);

router.get("/", (req, res) => {
  res.json({ it: "com" });
});

router.post("/doSomething", async (req, res) => {
  try {
    if (req.files == null) {
      const item = JSON.parse(req.body.items);
      const data = await Invoice.create({
        name: req.body.name,
        email: req.body.email,
        invoiceNo: req.body.invoiceNo,
        purchaseNo: req.body.purchaseNo,
        customerName: req.body.customerName,
        issueDate: req.body.issueDate,
        dueDate: req.body.dueDate,
        item: item,
        total: req.body.total,
        description: req.body.description,
      });
      res.send(data);
    } else {
      const item = JSON.parse(req.body.items);
      const file = req.files.file;
        const pdf = {
          pdf: file.data,
          contentType: file.mimetype,
        };
        const invoiceDataWithFile = {
          name: req.body.name,
          email: req.body.email,
          invoiceNo: req.body.invoiceNo,
          purchaseNo: req.body.purchaseNo,
          customerName: req.body.customerName,
          issueDate: req.body.issueDate,
          dueDate: req.body.dueDate,
          item: item,
          total: req.body.total,
          description: req.body.description,
          pdf,
        };
        const data = await Invoice.create(invoiceDataWithFile);

        if(data){
          res.status(200).json({
            success: true,
            message: "Bodda khuda laiggi"
          })
        }
    }
  } catch (err) {
    res.status(400).send({ error: "bad request" });
  }
});
app.use("/.netlify/functions/api", router);

module.exports = app;
module.exports.handler = serverless(app);
