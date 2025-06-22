const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Thought = require('../model/thoughts');
const authenticate = require('../../middleware/authMiddleware');

// -------------------------
// CREATE a new Thought
// -------------------------
router.post('/', authenticate, async (req, res) => {
  const userId = req.user?.userId;
  const { message } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: missing user ID from token' });
  }

  if (!message || message.trim().length < 5) {
    return res.status(400).json({ message: 'Thought must be at least 5 characters long.' });
  }

  try {
    const newThought = await Thought.create({
      message: message.trim(),
      hearts: 0,
      createdAt: new Date(),
      user: new mongoose.Types.ObjectId(userId)
    });

    res.status(201).json(newThought);
  } catch (err) {
    console.error('Error creating thought:', err);
    res.status(500).json({ message: 'Failed to create thought', error: err.message });
  }
});

// -------------------------
// UPDATE a Thought
// -------------------------
router.patch('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Thought ID' });
  }

  if (message && message.trim().length < 5) {
    return res.status(400).json({ message: 'Thought must be at least 5 characters long.' });
  }

  try {
    const updatedThought = await Thought.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      { $set: { message: message.trim() } },
      { new: true }
    );

    if (!updatedThought) {
      return res.status(404).json({ message: 'Thought not found or unauthorized' });
    }

    res.status(200).json(updatedThought);
  } catch (err) {
    console.error('Error updating thought:', err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// -------------------------
// DELETE a Thought
// -------------------------
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const thought = await Thought.findById(id);

    if (!thought) {
      return res.status(404).json({ message: 'Thought not found' });
    }

    if (thought.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this thought' });
    }

    await thought.deleteOne();
    res.status(200).json({ message: 'Thought deleted successfully' });
  } catch (err) {
    console.error('Error deleting thought:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

// -------------------------
// LIKE a Thought
// -------------------------
router.patch('/:id/like', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const thought = await Thought.findById(id);

    if (!thought) {
      return res.status(404).json({ message: 'Thought not found' });
    }

    thought.hearts += 1;
    await thought.save();

    res.status(200).json(thought);
  } catch (err) {
    console.error('Error liking thought:', err);
    res.status(500).json({ message: 'Failed to like thought', error: err.message });
  }
});

// -------------------------
// GET a Thought by ID
// -------------------------
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const thought = await Thought.findById(id);

    if (!thought) {
      return res.status(404).json({ message: 'Thought not found' });
    }

    res.status(200).json(thought);
  } catch (err) {
    console.error('Error retrieving thought:', err);
    res.status(500).json({ message: 'Error retrieving thought', error: err.message });
  }
});

// -------------------------
// GET all Thoughts
// -------------------------
router.get('/', async (_req, res) => {
  try {
    const thoughts = await Thought.find()
      .populate('user', 'username email') // adjust fields as per your User model
      .sort({ createdAt: -1 });

    res.status(200).json(thoughts);
  } catch (err) {
    console.error('Failed to fetch thoughts:', err);
    res.status(500).json({ message: 'Failed to fetch thoughts', error: err.message });
  }
});


module.exports = router;
