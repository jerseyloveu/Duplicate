// user_backend/server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000; // Hardcoded port

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
