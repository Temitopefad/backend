const express = require('express');
const router = express.Router();
const Reviews = require('../reviews/reviews.model'); // Import Reviews model
const Products = require('../products/products.model'); // Import Products model

// Post a new review
router.post('/post-review', async (req, res) => {
    try {
        const { comment, rating, productId, userId } = req.body;
        if (!comment || !rating || !productId || !userId) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        // Check if the user already reviewed this product
        let existingReview = await Reviews.findOne({ productId, userId });
        if (existingReview) {
            existingReview.comment = comment;
            existingReview.rating = rating;
            await existingReview.save();
        } else {
            existingReview = new Reviews({ comment, rating, productId, userId });
            await existingReview.save();
        }

        // Calculate the new average rating
        const reviews = await Reviews.find({ productId });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = totalRating / reviews.length;

            const product = await Products.findById(productId);
            if (product) {
                product.rating = averageRating;
                await product.save({ validateBeforeSave: false });
            } else {
                return res.status(404).json({ message: 'Product not found' });
            }
        }

        res.status(200).json({
            message: 'Review created successfully',
            review: existingReview
        });

    } catch (error) {
        console.error("Error posting review:", error);
        res.status(500).json({ message: "Failed to post review" });
    }
});

// Get total reviews count
router.get('/total-reviews', async (req, res) => {
    try {
        const totalReviews = await Reviews.countDocuments({});
        res.status(200).json({ totalReviews });
    } catch (error) {
        console.error("Error fetching total reviews:", error);
        res.status(500).json({ message: "Failed to fetch total reviews" });
    }
});

// Get reviews by user ID
router.get('/reviews-by-user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const reviews = await Reviews.find({ userId }).sort({ createdAt: -1 });
        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this user' });
        }

        res.status(200).json({ reviews });

    } catch (error) {
        console.error("Error fetching reviews by user:", error);
        res.status(500).json({ message: "Failed to fetch reviews" });
    }
});

module.exports = router;
