const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// Check API key
if (!API_KEY) {
    console.error("ERROR: API_KEY is not set");
}

// =========================
// HOME
// =========================

app.get("/", (req, res) => {
    res.json({
        app: "MatchZone Live",
        status: "online"
    });
});

// =========================
// LIVE MATCHES
// =========================

app.get("/live", async (req, res) => {

    try {

        if (!API_KEY) {
            return res.status(500).json({
                error: "API_KEY is missing"
            });
        }

        const response = await fetch(
            "https://v3.football.api-sports.io/fixtures?live=all",
            {
                method: "GET",
                headers: {
                    "x-apisports-key": API_KEY
                }
            }
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "API Error:",
                errorText
            );

            return res.status(response.status).json({
                error: "Football API request failed"
            });
        }

        const data =
            await response.json();

        const matches =
            (data.response || []).map((match) => ({

                id: match.fixture.id,

                home: {
                    name: match.teams.home.name,
                    logo: match.teams.home.logo
                },

                away: {
                    name: match.teams.away.name,
                    logo: match.teams.away.logo
                },

                score: {
                    home: match.goals.home,
                    away: match.goals.away
                },

                time:
                    match.fixture.status.elapsed,

                status:
                    match.fixture.status.short,

                league: {
                    name: match.league.name,
                    country: match.league.country,
                    logo: match.league.logo
                }

            }));

        res.json(matches);

    } catch (error) {

        console.error(
            "Live Matches Error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to load live matches"
        });
    }

});

// =========================
// TODAY'S FIXTURES
// =========================

app.get("/fixtures", async (req, res) => {

    try {

        if (!API_KEY) {
            return res.status(500).json({
                error: "API_KEY is missing"
            });
        }

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        const response =
            await fetch(
                `https://v3.football.api-sports.io/fixtures?date=${today}`,
                {
                    method: "GET",

                    headers: {
                        "x-apisports-key":
                            API_KEY
                    }
                }
            );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "API Error:",
                errorText
            );

            return res.status(response.status).json({
                error:
                    "Football API request failed"
            });
        }

        const data =
            await response.json();

        const matches =
            (data.response || [])
                .map((match) => ({

                    id:
                        match.fixture.id,

                    home: {
                        name:
                            match.teams.home.name,

                        logo:
                            match.teams.home.logo
                    },

                    away: {
                        name:
                            match.teams.away.name,

                        logo:
                            match.teams.away.logo
                    },

                    score: {
                        home:
                            match.goals.home,

                        away:
                            match.goals.away
                    },

                    date:
                        match.fixture.date,

                    status:
                        match.fixture.status.short,

                    league: {
                        name:
                            match.league.name,

                        country:
                            match.league.country,

                        logo:
                            match.league.logo
                    }

                }));

        res.json(matches);

    } catch (error) {

        console.error(
            "Fixtures Error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to load fixtures"
        });
    }

});

// =========================
// START SERVER
// =========================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `MatchZone Backend running on port ${PORT}`
        );

    }
);
