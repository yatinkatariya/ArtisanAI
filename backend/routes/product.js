const express = require("express");
const router = express.Router();
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");

// ======================
// Multer Setup
// ======================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const suffix = file.mimetype.includes("audio")
      ? ".wav"
      : path.extname(file.originalname);

    cb(null, Date.now() + "-" + file.fieldname + suffix);
  },
});

const upload = multer({ storage });

// ======================
// Gemini Setup
// ======================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔥 FINAL SAFE MODEL (WORKS IN MOST ACCOUNTS)
const GEMINI_MODEL = "gemini-2.0-flash";

// ======================
// 1. GET ALL PRODUCTS
// ======================
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;

    const query = search
      ? {
          $or: [
            { title_en: { $regex: search, $options: "i" } },
            { title_gu: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(query).sort({ _id: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// 2. ANALYZE IMAGE
// ======================
router.post("/analyze", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "ફોટો મળ્યો નથી!" });
    }

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
    });

    const promptText = `
Return ONLY valid JSON:
{
  "title_en": "",
  "title_gu": "",
  "desc_en": "",
  "desc_gu": "",
  "suggestedPrice": ""
}
`;

    const imagePart = {
      inlineData: {
        data: fs.readFileSync(req.file.path).toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent([promptText, imagePart]);
    const response = await result.response;

    const text = response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
        raw: text,
      });
    }

    return res.json({
      success: true,
      image: req.file.filename,
      ...data,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ======================
// 3. ANALYZE VOICE
// ======================
router.post("/analyze-voice", protect, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Audio file missing!" });
    }

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
    });

    const audioBuffer = fs.readFileSync(req.file.path);

    const result = await model.generateContent([
      {
        text: `Convert audio into JSON:
{
  "title_en": "",
  "title_gu": "",
  "desc_en": "",
  "desc_gu": "",
  "suggestedPrice": ""
}`,
      },
      {
        inlineData: {
          data: audioBuffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      },
    ]);

    const text = result.response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    fs.unlinkSync(req.file.path);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON",
        raw: text,
      });
    }

    return res.json({ success: true, ...data });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ======================
// 4. SAVE PRODUCT
// ======================
router.post("/save", protect, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// 5. EDIT PRODUCT
// ======================
router.put("/edit/:id", protect, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// 6. DELETE PRODUCT
// ======================
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "ડીલીટ થઈ ગઈ!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;