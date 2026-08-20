const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;

const API_URL = "https://v3.football.api-sports.io";

// Middleware
app.use(cors());
app.use(express.json());

// Home
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Match Zone Live Backend",
    version: "1.0.0"
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy"
  });
});

// LIVE MATCHES
app.get("/api/fixtures/live", async (req, res) => {

  try {

    if (!API_KEY) {
      return res.status(500).json({
        error: "API_FOOTBALL_KEY is missing"
      });
    }

    const response = await fetch(
      `${API_URL}/fixtures?live=all`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": API_KEY
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {

    console.error("Live fixtures error:", error);

    res.status(500).json({
      error: "Failed to fetch live matches",
      message: error.message
    });
  }
});


// FIXTURES BY DATE
app.get("/api/fixtures", async (req, res) => {

  try {

    if (!API_KEY) {
      return res.status(500).json({
        error: "API_FOOTBALL_KEY is missing"
      });
    }

    const date = req.query.date;

    if (!date) {
      return res.status(400).json({
        error: "date is required",
        example: "/api/fixtures?date=2026-08-20"
      });
    }

    const response = await fetch(
      `${API_URL}/fixtures?date=${encodeURIComponent(date)}`,
      {
        headers: {
          "x-apisports-key": API_KEY
        }
      }
    );

    const data = await response.json();

    res.status(response.status).json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to fetch fixtures"
    });
  }
});


// SERVER
app.listen(PORT, () => {

  console.log(
    `MATCH ZONE LIVE backend running on port ${PORT}`
  );

});
