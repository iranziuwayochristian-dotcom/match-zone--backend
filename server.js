const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.FOOTBALL_API_KEY;

const FOOTBALL_API =
    "https://api.football-data.org/v4/matches";

/* HOME */
app.get("/", (req, res) => {
    res.json({
        message: "⚽ MatchZone API is running!",
        status: "online"
    });
});

/* LIVE MATCHES */
app.get("/live", async (req, res) => {

    try {

        if (!API_KEY) {
            return res.status(500).json({
                error: "FOOTBALL_API_KEY is missing"
            });
        }

        const response = await fetch(FOOTBALL_API, {
            headers: {
                "X-Auth-Token": API_KEY
            }
        });

        if (!response.ok) {
            const errorText = await response.text();

            console.error(
                "Football API Error:",
                response.status,
                errorText
            );

            return res.status(response.status).json({
                error: "Football API request failed"
            });
        }

        const data = await response.json();

        const matches = data.matches || [];

        /*
         * Football-data.org can return matches
         * with different status values.
         */

        const liveMatches = matches.filter(match => {

            return [
                "LIVE",
                "IN_PLAY",
                "PAUSED"
            ].includes(match.status);

        });

        res.json(liveMatches);

    } catch (error) {

        console.error("SERVER ERROR:", error);

        res.status(500).json({
            error: "Unable to fetch football matches"
        });

    }

});


/* ALL TODAY'S MATCHES */
app.get("/matches", async (req, res) => {

    try {

        if (!API_KEY) {
            return res.status(500).json({
                error: "FOOTBALL_API_KEY is missing"
            });
        }

        const response = await fetch(FOOTBALL_API, {
            headers: {
                "X-Auth-Token": API_KEY
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: "Football API request failed"
            });
        }

        const data = await response.json();

        res.json(data.matches || []);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Unable to fetch matches"
        });

    }

});


/* SERVER */
app.listen(PORT, () => {

    console.log(
        `⚽ MatchZone backend running on port ${PORT}`
    );

});
