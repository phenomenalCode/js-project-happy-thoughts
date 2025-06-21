const express = require('express');
const router = express.Router();
const Thought = require('../model/thoughts');
const authenticate = require('../../middleware/authMiddleware');
const mongoose = require('mongoose');
// -------------------------
// CREATE a new Thought
// -------------------------
router.post('/', authenticate, async (req, res) => {
  console.log('POST /thoughts called');
  console.log('Request body:', req.body);
  console.log('Authenticated user:', req.user);
  
if (!req.user?.userId) {
  return res.status(401).json({ message: "Unauthorized: Missing user ID in token" });
}

  const { message } = req.body;
  console.log('Message:', message);

  if (!message || message.length < 5) {
    console.log('Validation failed: Message too short or missing');
    return res.status(400).json({ message: 'Thought must be at least 5 characters long.' });
  }

  try {
    const newThought = await Thought.create({
      message,
      hearts: 0,
      createdAt: new Date(),
      user: req.user.userId,
    });

    console.log('New thought created:', newThought);
    console.log('User field in new thought:', newThought.user);
    console.log('Type of user field:', typeof newThought.user);

    res.status(201).json({
      _id: newThought._id,
      message: newThought.message,
      hearts: newThought.hearts,
      createdAt: newThought.createdAt,
      user: newThought.user,
    });

    console.log('Response sent for created thought'); 
    console.log("✅ Thought saved:", newThought);

  } catch (err) {
    console.error('Error creating thought:', err);
    res.status(500).json({ message: 'Failed to create thought', error: err.message });
  }
});

// -------------------------
// UPDATE a Thought console.log('PATCH /thoughts/:id called');
 

router.patch('/:id', authenticate, async (req, res) => {
  const rawId = req.params.id;
  const id = rawId.trim();                // <- strip any stray whitespace/newlines
  const { message } = req.body;

  // Quick ID validation:
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Thought ID' });
  }
 console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('Authenticated user:', req.user);
  // Message length validation
  if (message && message.length < 5) {
    return res.status(400).json({ message: 'Thought must be at least 5 characters long.' });
  }

  try {
    // Find by _id AND owner in one go, then update
    const updatedThought = await Thought.findOneAndUpdate(
      { _id: id, user: req.user.userId },   // match both id and owner
      { $set: { message } },                // only update message
      { new: true }                         // return the updated document
    );

    if (!updatedThought) {
      // either it didn't exist, or it wasn't owned by this user
      return res.status(404).json({ message: 'Thought not found or unauthorized' });
    }

    return res.status(200).json(updatedThought);
  } catch (err) {
    console.error('❌ Error updating thought:', err);
    return res.status(500).json({ message: 'Update failed', error: err.message });
  }
});
// -------------------------
// DELETE a Thought
// -------------------------
router.delete('/:id', authenticate, async (req, res) => {
  console.log('DELETE /thoughts/:id called');
  console.log('Request params:', req.params);
  console.log('Authenticated user:', req.user);

  try {
    const thought = await Thought.findById(req.params.id);
    console.log('Fetched thought for delete:', thought);

    if (!thought) {
      console.log('Thought not found for delete with ID:', req.params.id);
      return res.status(404).json({ message: 'Thought not found' });
    }

    if (thought.user.toString() !== req.user.userId) {
      console.log('Unauthorized delete attempt by user:', req.user.userId);
      return res.status(403).json({ message: 'Unauthorized to delete this thought' });
    }

    await thought.deleteOne();
    console.log('Thought deleted:', req.params.id);

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
  console.log('PATCH /thoughts/:id/like called');
  console.log('Request params:', req.params);
  console.log('Authenticated user:', req.user);

  try {
    const thought = await Thought.findById(req.params.id);
    console.log('Fetched thought for liking:', thought);

    if (!thought) {
      console.log('Thought not found for like:', req.params.id);
      return res.status(404).json({ message: 'Thought not found' });
    }

    console.log('Current hearts:', thought.hearts);
    thought.hearts += 1;
    console.log('Hearts after increment:', thought.hearts);

    await thought.save();
    console.log('Thought liked and saved');

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
  console.log('GET /thoughts/:id called');
  console.log('Request params:', req.params);

  try {
    const thought = await Thought.findById(req.params.id);
    console.log('Fetched thought:', thought);

    if (!thought) {
      console.log('Thought not found with ID:', req.params.id);
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
  console.log('GET /thoughts called');

  try {
    const thoughts = await Thought.find().sort({ createdAt: -1 });
    console.log(`Fetched ${thoughts.length} thoughts`);

    const sanitized = thoughts.map((t) => ({
      _id: t._id,
      message: t.message,
      hearts: t.hearts,
      createdAt: t.createdAt,
      user: t.user?.toString() || null,
    }));

    console.log('Sanitized thoughts:', sanitized);

    res.status(200).json(sanitized);
  } catch (err) {
    console.error('Failed to fetch thoughts:', err);
    res.status(500).json({ message: 'Failed to fetch thoughts', error: err.message });
  }
});

module.exports = router;
