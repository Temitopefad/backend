const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json({limit: "25mb"}));
app.use(express.urlencoded({limit: "25mb", extended: true}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({ 
    origin: 'http://localhost:5173',
    credentials: true
}));

// Routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.routes');
const reviewRoutes = require('./src/reviews/reviews.router'); // ✅ Ensure correct file name

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes); // ✅ Fixed syntax

// Connect to MongoDB
main().then(() => console.log("MongoDB is successfully connected"))
      .catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.DB_URL);
}

// Test route
app.get('/', (req, res) => {
  res.send('bigtems server is running!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
