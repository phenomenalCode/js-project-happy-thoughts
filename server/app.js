require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/login_out');       // your auth routes
const thoughtRoutes = require('./routes/thought_routes'); // your thoughts routes

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/thoughts', thoughtRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/happy-thoughts')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  });
