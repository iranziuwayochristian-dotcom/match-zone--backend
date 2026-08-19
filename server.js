const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.FOOTBALL_API_KEY;

const API_URL = "https://api.football-data.org/v4";

if (!API_KEY) {
    console.error("ERROR: FOOTBALL_API_KEY is not set");
}

// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
    res.json({
        app: "MatchZone Live",
        status: "online",
        api: "football-data.org"
    });
});

// ========================================
// API REQUEST HELPER
// ========================================

async function footballAPI(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: {
            "X-Auth-Token": API_KEY
        }
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Football-data.org Error:", data);

        throw new Error(
            data.message || "Football API request failed"
        );
    }

    return data;
}

// ========================================
// LIVE MATCHES
// ========================================

app.get("/live", async (req, res) => {
    try {

        if (!API_KEY) {
            return res.status(500).json({
                error: "FOOTBALL_API_KEY is missing"
            });
        }

        const data = await footballAPI("/matches?status=LIVE");

        const matches = (data.matches || []).map(formatMatch);

        res.json(matches);

    } catch (error) {

        console.error("Live Error:", error);

        res.status(500).json({
            error: "Unable to load live matches",
            message: error.message
        });
    }
});

// ========================================
// TODAY'S MATCHES
// ========================================

app.get("/matches", async (req, res) => {
    try {

        if (!API_KEY) {
            return res.status(500).json({
                error: "FOOTBALL_API_KEY is missing"
            });
        }

        const data = await footballAPI("/matches");

        const matches = (data.matches || []).map(formatMatch);

        res.json({
            count: matches.length,
            matches: matches
        });

    } catch (error) {

        console.error("Matches Error:", error);

        res.status(500).json({
            error: "Unable to load matches",
            message: error.message
        });
    }
});

// ========================================
// MATCHES BY DATE
// Example:
// /fixtures?date=2026-08-19
// ========================================

app.get("/fixtures", async (req, res) => {
    try {

        if (!API_KEY) {
            return res.status(500).json({
                error: "FOOTBALL_API_KEY is missing"
            });
        }

        const date = req.query.date;

        if (!date) {
            return res.status(400).json({
                error: "Please provide a date"
            });
        }

        const data = await footballAPI(
            `/matches?dateFrom=${encodeURIComponent(date)}&dateTo=${encodeURIComponent(date)}`
        );

        const matches = (data.matches || []).map(formatMatch);

        res.json({
            date: date,
            count: matches.length,
            matches: matches
        });

    } catch (error) {

        console.error("Fixtures Error:", error);

        res.status(500).json({
            error: "Unable to load fixtures",
            message: error.message
        });
    }
});

// ========================================
// COMPETITIONS
// ========================================

app.get("/competitions", async (req, res) => {
    try {

        if (!API_KEY) {
            return res.status(500).json({
                error: "FOOTBALL_API_KEY is missing"
            });
        }

        const data = await footballAPI("/competitions");

        res.json({
            count: (data.competitions || []).length,
            competitions: data.competitions || []
        });

    } catch (error) {

        console.error("Competitions Error:", error);

        res.status(500).json({
            error: "Unable to load competitions",
            message: error.message
        });
    }
});

// ========================================
// LEAGUE TABLE
// Example:
// /standings/PL
// ========================================

app.get("/standings/:competition", async (req, res) => {
    try {

        if (!API_KEY) {
            return res.status(500).json({
                error: "FOOTBALL_API_KEY is missing"
            });
        }

        const competition = req.params.competition;

        const data = await footballAPI(
            `/competitions/${encodeURIComponent(competition)}/standings`
        );

        res.json(data);

    } catch (error) {

        console.error("Standings Error:", error);

        res.status(500).json({
            error: "Unable to load standings",
            message: error.message
        });
    }
});

// ========================================
// FORMAT MATCH
// ========================================

function formatMatch(match) {

    return {
        id: match.id,

        date: match.utcDate,

        status: match.status,

        time: match.minute || null,

        home: {
            name: match.homeTeam?.name || "Unknown",
            logo: match.homeTeam?.crest || null
        },

        away: {
            name: match.awayTeam?.name || "Unknown",
            logo: match.awayTeam?.crest || null
        },

        score: {
            home: match.score?.fullTime?.home ?? null,
            away: match.score?.fullTime?.away ?? null
        },

        halfTime: {
            home: match.score?.halfTime?.home ?? null,
            away: match.score?.halfTime?.away ?? null
        },

        league: {
            name: match.competition?.name || "Unknown",
            country: match.area?.name || "Unknown",
            logo: match.competition?.emblem || null
        }
    };
}

// ========================================
// TEST API
// ========================================

app.get("/test-api", async (req, res) => {
    try {

        if (!API_KEY) {
            return res.status(500).json({
                error: "FOOTBALL_API_KEY is missing"
            });
        }

        const data = await footballAPI("/competitions");

        res.json({
            httpStatus: 200,
            status: "success",
            message: "football-data.org API is connected",
            competitions: data.competitions?.length || 0
        });

    } catch (error) {

        console.error("Test API Error:", error);

        res.status(500).json({
            error: "Unable to connect to football-data.org",
            message: error.message
        });
    }
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `MatchZone Backend running on port ${PORT}`
    );

});
