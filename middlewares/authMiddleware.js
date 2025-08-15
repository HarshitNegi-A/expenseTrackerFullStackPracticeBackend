const jwt = require("jsonwebtoken");
const User = require("../model/UserModel");
require('dotenv').config()

module.exports = async (req, res, next) => {
  try {
    const header = req.headers["authorization"];
    if (!header) return res.status(401).json({ message: "No token provided" });

    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = parts[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email"],
    });
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Auth failure" });
  }
};
