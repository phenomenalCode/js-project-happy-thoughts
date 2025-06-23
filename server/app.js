require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/login_out');       // your auth routes
const thoughtRoutes = require('./routes/thought_routes'); // your thoughts routes

// Middleware
const allowedOrigins = [ // backend test
  'https://js-project-happy-thoughts.onrender.com', // live backend
  'https://happy-thoughts-darius.netlify.app', // frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('⛔ Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
console.log("✅ Loaded MONGO_URI from .env:", process.env.MONGO_URI);

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Happy Thoughts backend is running!");
});

app.use('/auth', authRoutes);
app.use('/thoughts', thoughtRoutes);
console.log("Connecting to MongoDB at:", process.env.MONGO_URI);

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
