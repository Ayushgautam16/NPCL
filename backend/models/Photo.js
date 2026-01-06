const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
    originalUrl: { type: String, required: true }, // Secure URL
    watermarkedUrl: { type: String, required: true }, // Public URL
    thumbnailUrl: { type: String },
    price: { type: Number }, // Optional override
    metadata: {
        width: Number,
        height: Number,
        size: Number,
    },
    tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Photo', photoSchema);
