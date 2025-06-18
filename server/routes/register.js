router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields are required.' });

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'That email address already exists.' });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ message: 'That username already exists.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });
    return res.status(201).json({ message: 'User created successfully', userId: newUser._id });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});
