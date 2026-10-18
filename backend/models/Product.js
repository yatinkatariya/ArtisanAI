const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title_en: { type: String, required: true },
    title_gu: { type: String, required: true },
    desc_en: { type: String, required: true },
    desc_gu: { type: String, required: true },
    suggestedPrice: { type: Number, required: true },

    image: {
        type: String,
        default: ""
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);