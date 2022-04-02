const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./connectDB");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const sendOTP = require("./otp");

const app = express();
const router = express.Router();

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
function randomOTP() {
  const keyword = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomKey = "";
  for (let i = 0; i < 6; i++)
    randomKey += keyword.charAt(Math.floor(Math.random() * keyword.length));

  return randomKey;
}

async function hash(key) {
  return new Promise((resolve, reject) => {
    // generate random 16 bytes long salt
    const salt = crypto.randomBytes(16).toString("hex");

    crypto.scrypt(key, salt, 16, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

async function verify(password, hash) {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    crypto.scrypt(password, salt, 16, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key == derivedKey.toString("hex"));
    });
  });
}

// Model

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, "Please Enter Your Email"],
  },
  OTP: {
    type: String,
    required: [true, "Please Enter Your Email"],
  },
});
const otpModel = mongoose.model("otpModels",otpSchema)

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
      if (data) {
        res.status(200).json({
          success: true,
          message: "Bodda khuda laiggi",
        });
      }
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

      if (data) {
        res.status(200).json({
          success: true,
          message: "Bodda khuda laiggi",
        });
      }
    }
  } catch (err) {
    res.status(400).send({ error: "bad request" });
  }
});

router.get("/createOtp", async (req, res) => {
  try {
     res
     .status(200).json({ success: true, message: "Please check email" });
      
  } catch (err) {
    console.log(err);
  }
});

router.get("/validateOTP/:OTP/:email", async (req, res) => {
  // console.log(req.headers.cookie, 'vairfdfjd');
  const validOTP = await otpModel.findOne({ email: req.params.email });
  if (!validOTP) {
    return res.status(200).json({
      success: false,
      message: "Email not found, Try again",
      validOTP,
    });
  }
  const data = await verify(req.params.OTP, validOTP?.OTP);
  if (!data) {
    return res
      .status(200)
      .json({ success: false, message: "OTP  didn't Matched" });
  }
  await otpModel.deleteOne({ _id: data._id });
  res.status(200).json({ success: true, message: "OTP Matched Successfully" });
});

app.use("/.netlify/functions/api", router);

module.exports = app;
module.exports.handler = serverless(app);
