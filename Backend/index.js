require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/entries", require("./routes/entries"));

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" ? "Server error" : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`),
);
