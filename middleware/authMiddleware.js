const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // must match the secret used during token signing
    console.log(" Decoded JWT payload:", decoded); // Log to verify the field name

console.log(payload);

    // Use the correct field from the token (likely _id, not id)
    req.user = { userId: decoded._id }; 

    next();
  } catch (err) {
    console.error(" Invalid token:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
