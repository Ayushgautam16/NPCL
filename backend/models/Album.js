const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    photographerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    eventDate: { type: Date },
    isPrivate: { type: Boolean, default: false },
    accessCode: { type: String }, // For private access
    pricePerPhoto: { type: Number, default: 0 },
    priceFullAlbum: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Album', albumSchema);
