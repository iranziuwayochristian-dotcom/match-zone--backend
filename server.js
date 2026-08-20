const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = "https://v3.football.api-sports.io";

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Match Zone Live Backend",
    version: "1.0.0",
    message: "Server is running successfully"
  });
});


// ===============================
// HEALTH CHECK
// ===============================

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Match Zone Live Backend"
  });
});


// ===============================
// API KEY CHECK
// ===============================

function checkApiKey(res) {
  if (!API_KEY) {
    res.status(500).json({
      success: false,
      error: "API_FOOTBALL_KEY is missing",
      message:
        "Add API_FOOTBALL_KEY to your environment variables."
    });

    return false;
  }

  return true;
}


// ===============================
// API REQUEST HELPER
// ===============================

async function apiFootballRequest(endpoint) {

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        "x-apisports-key": API_KEY,
        "Accept": "application/json"
      }
    }
  );

  const data = await response.json();

  return {
    status: response.status,
    data
  };
}


// ===============================
// LIVE MATCHES
// FRONTEND:
// /api/fixtures/live
// ===============================

app.get("/api/fixtures/live", async (req, res) => {

  try {

    if (!checkApiKey(res)) return;

    const result =
      await apiFootballRequest(
        "/fixtures?live=all"
      );

    res
      .status(result.status)
      .json(result.data);

  } catch (error) {

    console.error(
      "LIVE MATCH ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to fetch live matches",
      message: error.message
    });
  }
});


// ===============================
// FIXTURES BY DATE
// Example:
// /api/fixtures?date=2026-08-20
// ===============================

app.get("/api/fixtures", async (req, res) => {

  try {

    if (!checkApiKey(res)) return;

    const { date } = req.query;

    if (!date) {

      return res.status(400).json({
        success: false,
        error: "Date is required",
        example:
          "/api/fixtures?date=2026-08-20"
      });
    }

    const result =
      await apiFootballRequest(
        `/fixtures?date=${encodeURIComponent(date)}`
      );

    res
      .status(result.status)
      .json(result.data);

  } catch (error) {

    console.error(
      "FIXTURE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to fetch fixtures",
      message: error.message
    });
  }
});


// ===============================
// FIXTURES BY LEAGUE
//
// Example:
// /api/fixtures/league/39?season=2025
// ===============================

app.get(
  "/api/fixtures/league/:leagueId",
  async (req, res) => {

    try {

      if (!checkApiKey(res)) return;

      const {
        leagueId
      } = req.params;

      const {
        season
      } = req.query;

      if (!season) {

        return res.status(400).json({
          success: false,
          error: "Season is required",
          example:
            "/api/fixtures/league/39?season=2025"
        });
      }

      const result =
        await apiFootballRequest(
          `/fixtures?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}`
        );

      res
        .status(result.status)
        .json(result.data);

    } catch (error) {

      console.error(
        "LEAGUE FIXTURE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        error: "Failed to fetch league fixtures",
        message: error.message
      });
    }
  }
);


// ===============================
// LEAGUES
// ===============================

app.get("/api/leagues", async (req, res) => {

  try {

    if (!checkApiKey(res)) return;

    const result =
      await apiFootballRequest(
        "/leagues"
      );

    res
      .status(result.status)
      .json(result.data);

  } catch (error) {

    console.error(
      "LEAGUE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to fetch leagues",
      message: error.message
    });
  }
});


// ===============================
// STANDINGS
//
// Example:
// /api/standings?league=39&season=2025
// ===============================

app.get("/api/standings", async (req, res) => {

  try {

    if (!checkApiKey(res)) return;

    const {
      league,
      season
    } = req.query;

    if (!league || !season) {

      return res.status(400).json({
        success: false,
        error:
          "league and season are required",
        example:
          "/api/standings?league=39&season=2025"
      });
    }

    const result =
      await apiFootballRequest(
        `/standings?league=${encodeURIComponent(league)}&season=${encodeURIComponent(season)}`
      );

    res
      .status(result.status)
      .json(result.data);

  } catch (error) {

    console.error(
      "STANDINGS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to fetch standings",
      message: error.message
    });
  }
});


// ===============================
// TEAMS SEARCH
//
// Example:
// /api/teams?search=Arsenal
// ===============================

app.get("/api/teams", async (req, res) => {

  try {

    if (!checkApiKey(res)) return;

    const {
      search
    } = req.query;

    if (!search) {

      return res.status(400).json({
        success: false,
        error: "search is required"
      });
    }

    const result =
      await apiFootballRequest(
        `/teams?search=${encodeURIComponent(search)}`
      );

    res
      .status(result.status)
      .json(result.data);

  } catch (error) {

    console.error(
      "TEAM SEARCH ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to search teams",
      message: error.message
    });
  }
});


// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {

  console.error(
    "SERVER ERROR:",
    err
  );

  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});


// ===============================
// 404
// ===============================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl
  });

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

  console.log(
    "===================================="
  );

  console.log(
    "⚽ MATCH ZONE LIVE BACKEND"
  );

  console.log(
    `🚀 Server running on port ${PORT}`
  );

  console.log(
    `🌐 http://localhost:${PORT}`
  );

  console.log(
    "===================================="
  );

});
