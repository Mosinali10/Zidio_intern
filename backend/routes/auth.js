const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const verifyToken = require("../middleware/authMiddleware");

// Secret key for JWT (ideally store this in .env file)
const JWT_SECRET = "yourSuperSecretKey";

// POST /api/register
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(200).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(400).json({ message: "Error registering user", error: err.message });
  }
});

// POST /api/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Convert user to object and remove password
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;


// ✅ Protected route
router.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({ message: "Access granted!", user: req.user });
});

module.exports = router;
