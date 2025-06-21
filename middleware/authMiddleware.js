const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("🔐 Incoming auth header:", req.headers.authorization);

    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔓 Decoded JWT payload:", decoded);
    
    // ✅ Covers all possible variations
    const userId = decoded.userId || decoded._id || decoded.id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token: no user ID found" });
    }
  req.user = {
      userId: userId, // ✅ USE the fallback-safe ID
      username: decoded.username,
    };
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
