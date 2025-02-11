const mongoose = require('mongoose'); // ✅ Correct import

const ReviewSchema = new mongoose.Schema({
    comment: { type: String, required: true }, // ✅ Lowercased 'comment' for consistency
    rating: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
}, { timestamps: true });

const Review = mongoose.model("Review", ReviewSchema); // ✅ Corrected model name

module.exports = Review; // ✅ Corrected export
