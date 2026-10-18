require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/product');
const authRoutes = require('./routes/auth');   // NEW
const path = require('path');

const app = express();

// ========================
// Middlewares
// ========================
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));

// ========================
// Test Route
// ========================
app.get('/', (req, res) => {
    res.send("ArtisanAI Backend Server is running successfully!");
});

// ========================
// Routes
// ========================
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);   // NEW

// ========================
// MongoDB Connection
// ========================
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Database Connected Successfully!");
    })
    .catch((err) => {
        console.error("Database connection error:", err);
    });

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});