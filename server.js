const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const FOOTBALL_DATA_TOKEN = process.env.FOOTBALL_DATA_TOKEN;


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

async function apiRequest(url) {

    if (!FOOTBALL_DATA_TOKEN) {
        throw new Error(
            "FOOTBALL_DATA_TOKEN is missing"
        );
    }

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-Auth-Token": FOOTBALL_DATA_TOKEN,
            "Accept": "application/json"
        }
    });

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        data = {
            message: text
        };
    }

    if (!response.ok) {
        const error = new Error(
            "Football-data.org API request failed"
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}


// ========================================
// FORMAT MATCH
// ========================================

function formatMatch(match) {

    return {
        id: match.id,

        date: match.utcDate,

        status: match.status,

        home: {
            name: match.homeTeam?.name || "Home",
            logo: match.homeTeam?.crest || null
        },

        away: {
            name: match.awayTeam?.name || "Away",
            logo: match.awayTeam?.crest || null
        },

        score: {
            home: match.score?.fullTime?.home ?? null,
            away: match.score?.fullTime?.away ?? null
        },

        league: {
            name: match.competition?.name || "Football",
            country: match.area?.name || "",
            logo: match.competition?.emblem || null
        }
    };
}


// ========================================
// COMPETITIONS
// ========================================

app.get("/competitions", async (req, res) => {

    try {

        const data = await apiRequest(
            "https://api.football-data.org/v4/competitions"
        );

        const competitions =
            (data.competitions || []).map(item => ({
                id: item.id,
                name: item.name,
                code: item.code,
                country: item.area?.name || "",
                logo: item.emblem || null
            }));

        res.json({
            count: competitions.length,
            competitions
        });

    } catch (error) {

        console.error(
            "Competitions Error:",
            error
        );

        res.status(error.status || 500).json({
            error: "Unable to load competitions",
            details: error.data || error.message
        });
    }

});


// ========================================
// FIXTURES BY DATE
// ========================================

app.get("/fixtures", async (req, res) => {

    try {

        const date = req.query.date;

        if (!date) {
            return res.status(400).json({
                error: "Please provide a date"
            });
        }

        const url =
            `https://api.football-data.org/v4/matches?dateFrom=${encodeURIComponent(date)}&dateTo=${encodeURIComponent(date)}`;

        const data =
            await apiRequest(url);

        const matches =
            (data.matches || []).map(formatMatch);

        res.json({
            date,
            count: matches.length,
            matches
        });

    } catch (error) {

        console.error(
            "Fixtures Error:",
            error
        );

        res.status(error.status || 500).json({
            error: "Unable to load fixtures",
            details: error.data || error.message
        });
    }

});


// ========================================
// LIVE MATCHES
// ========================================

app.get("/live", async (req, res) => {

    try {

        const data =
            await apiRequest(
                "https://api.football-data.org/v4/matches?status=LIVE"
            );

        const matches =
            (data.matches || []).map(formatMatch);

        res.json(matches);

    } catch (error) {

        console.error(
            "Live Error:",
            error
        );

        res.status(error.status || 500).json({
            error: "Unable to load live matches",
            details: error.data || error.message
        });
    }

});


// ========================================
// SEARCH TEAMS
// ========================================

app.get("/search", async (req, res) => {

    try {

        const query =
            String(req.query.query || "")
                .trim()
                .toLowerCase();

        if (query.length < 3) {

            return res.status(400).json({
                error:
                    "Search must contain at least 3 characters"
            });
        }

        const data =
            await apiRequest(
                "https://api.football-data.org/v4/teams"
            );

        const teams =
            (data.teams || [])
                .filter(team => {

                    const name =
                        String(
                            team.name || ""
                        ).toLowerCase();

                    const shortName =
                        String(
                            team.shortName || ""
                        ).toLowerCase();

                    return (
                        name.includes(query) ||
                        shortName.includes(query)
                    );
                })
                .map(team => ({
                    id: team.id,
                    name: team.name,
                    shortName: team.shortName,
                    tla: team.tla,
                    logo: team.crest,
                    country: team.area?.name || ""
                }));

        res.json({
            query,
            count: teams.length,
            teams
        });

    } catch (error) {

        console.error(
            "Search Error:",
            error
        );

        res.status(error.status || 500).json({
            error: "Unable to search teams",
            details: error.data || error.message
        });
    }

});


// ========================================
// 404
// ========================================

app.use((req, res) => {

    res.status(404).json({
        error: "Endpoint not found",
        path: req.originalUrl
    });

});


// ========================================
// START SERVER
// ========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `MatchZone Backend running on port ${PORT}`
        );

    }
);
