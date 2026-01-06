const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional logic for guest checkout?
    customerEmail: { type: String, required: true },
    items: [{
        photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' },
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    paymentGatewayId: { type: String },
    downloadLinks: [{
        photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' },
        token: String,
        expiresAt: Date
    }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
