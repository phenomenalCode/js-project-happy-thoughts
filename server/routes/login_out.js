const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/users');


const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecret';
const authenticate = require('../../middleware/authMiddleware');
router.post('/protected', authenticate, (req, res) => {
  res.json({ message: 'Protected route accessed!', user: req.user });
});

// @route   POST /register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required.' });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(409).json({ message: 'Username already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });

    return res.status(201).json({ message: 'User created successfully', userId: newUser._id });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// @route   POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required.' });

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;