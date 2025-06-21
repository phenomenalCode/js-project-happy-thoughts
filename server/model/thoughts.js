const mongoose = require('mongoose');

const thoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    trim: true,
  },
  hearts: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    default: 'General',
    enum: ['General', 'Food', 'Project', 'Home', 'Work', 'Health', 'Other'],
  },
  tags: {
    type: [String],
    default: [],
  }, user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true // ✅ This enforces it!
}
 // <- Make sure you have a User model
   
  },      )
module.exports = mongoose.model('Thought', thoughtSchema);
