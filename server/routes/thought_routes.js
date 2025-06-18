const express = require('express');
const router = express.Router();
const Thought = require('../model/thoughts');
const authenticate = require('../../middleware/authMiddleware');

// -------------------------
// CREATE a new Thought
// -------------------------
// CREATE a new Thought
// -------------------------
console.log("Sending new thought:", {
  _id: newThought._id,
  message: newThought.message,
  hearts: newThought.hearts,
  createdAt: newThought.createdAt,
  user: req.user.userId,
});
router.post('/', authenticate, async (req, res) => {
  const { message } = req.body;

  if (!message || message.length < 5) {
    return res.status(400).json({ message: 'Thought must be at least 5 characters long.' });
  }

  try {
    const newThought = await Thought.create({
      message,
      hearts: 0,
      createdAt: new Date(),
      user: req.user.userId,
    });

    res.status(201).json({
      _id: newThought._id,
  message: newThought.message,
  hearts: newThought.hearts,
  createdAt: newThought.createdAt,
  user: req.user.userId,   // <-- directly send the user ID from the token here
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create thought', error: err.message });
  }
});


// -------------------------
// UPDATE a Thought
// -------------------------
router.put('/:id', authenticate, async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) return res.status(404).json({ message: 'Thought not found' });

    if (thought.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to update this thought' });
    }

    thought.message = req.body.message || thought.message;
    const updated = await thought.save();

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// -------------------------
// DELETE a Thought
// -------------------------
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) return res.status(404).json({ message: 'Thought not found' });

    if (thought.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this thought' });
    }

    await thought.deleteOne();
    res.status(200).json({ message: 'Thought deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

// -------------------------
// LIKE a Thought
// -------------------------
router.patch('/:id/like', authenticate, async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) return res.status(404).json({ message: 'Thought not found' });

    thought.hearts += 1;
    await thought.save();
    res.status(200).json(thought);
  } catch (err) {
    res.status(500).json({ message: 'Failed to like thought', error: err.message });
  }
});

module.exports = router;
