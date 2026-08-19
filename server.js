const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({
        app: "MatchZone Live",
        status: "online"
    });
});

app.get("/live", async (req, res) => {

    try {

        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "API_KEY is missing"
            });
        }

        const response = await fetch(
            "https://v3.football.api-sports.io/fixtures?live=all",
            {
                headers: {
                    "x-apisports-key": apiKey
                }
            }
        );

        const data = await response.json();

        const matches = data.response.map(match => ({
            id: match.fixture.id,
            league: match.league.name,
            country: match.league.country,

            home: match.teams.home.name,
            away: match.teams.away.name,

            homeLogo: match.teams.home.logo,
            awayLogo: match.teams.away.logo,

            homeScore: match.goals.home ?? 0,
            awayScore: match.goals.away ?? 0,

            minute: match.fixture.status.elapsed
                ? `${match.fixture.status.elapsed}'`
                : "",

            status: match.fixture.status.short
        }));

        res.json(matches);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });
    }
});

});

app.get("/fixtures", async (req, res) => {

    try {

        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "API_KEY is missing"
            });
        }

        const today = new Date()
            .toISOString()
            .split("T")[0];

        const response = await fetch(
            `https://v3.football.api-sports.io/fixtures?date=${today}`,
            {
                headers: {
                    "x-apisports-key": apiKey
                }
            }
        );

        if (!response.ok) {
            return res.status(response.status).json({
                error: "Football API request failed"
            });
        }

        const data = await response.json();

        const matches = (data.response || []).map(match => ({
            id: match.fixture.id,

            league: match.league.name,

            country: match.league.country,

            home: match.teams.home.name,

            away: match.teams.away.name,

            homeLogo: match.teams.home.logo,

            awayLogo: match.teams.away.logo,

            homeScore: match.goals.home,

            awayScore: match.goals.away,

            date: match.fixture.date,

            status: match.fixture.status.short
        }));

        res.json(matches);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });

    }

});

app.listen(PORT, () => {
    console.log(
        `MatchZone backend running on port ${PORT}`
    );
});
app.listen(PORT, () => {
    console.log(
        `MatchZone backend running on port ${PORT}`
    );
});
