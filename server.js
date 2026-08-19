const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("ERROR: API_KEY is not set");
}


// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {

    res.json({
        app: "MatchZone Live",
        status: "online"
    });

});


// ========================================
// LIVE MATCHES
// ========================================

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
                "Football API Error:",
                errorText
            );

            return res.status(
                response.status
            ).json({
                error:
                    "Football API request failed"
            });
        }


        const data =
            await response.json();


        const matches =
            (data.response || [])
                .map(formatMatch);


        res.json(matches);


    } catch (error) {

        console.error(
            "Live Error:",
            error
        );


        res.status(500).json({
            error:
                "Unable to load live matches"
        });
    }

});


// ========================================
// FIXTURES BY DATE
// ========================================

app.get("/fixtures", async (req, res) => {

    try {

        if (!API_KEY) {

            return res.status(500).json({
                error: "API_KEY is missing"
            });

        }


        const date =
            req.query.date;


        if (!date) {

            return res.status(400).json({
                error:
                    "Please provide a date"
            });
        }


        const response = await fetch(

            `https://v3.football.api-sports.io/fixtures?date=${encodeURIComponent(date)}`,

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
                "Fixtures API Error:",
                errorText
            );

            return res.status(
                response.status
            ).json({
                error:
                    "Football API request failed"
            });
        }


        const data =
            await response.json();


        const matches =
            (data.response || [])
                .map(formatMatch);


        res.json({

            date: date,

            count: matches.length,

            matches: matches

        });


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


// ========================================
// SEARCH TEAMS
// Example:
// /search?query=Arsenal
// ========================================

app.get("/search", async (req, res) => {

    try {

        if (!API_KEY) {

            return res.status(500).json({
                error: "API_KEY is missing"
            });

        }


        const query =
            String(
                req.query.query || ""
            ).trim();


        if (query.length < 3) {

            return res.status(400).json({

                error:
                    "Search must contain at least 3 characters"

            });
        }


        const response = await fetch(

            `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(query)}`,

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
                "Search API Error:",
                errorText
            );

            return res.status(
                response.status
            ).json({
                error:
                    "Football API search failed"
            });
        }


        const data =
            await response.json();


        const teams =
            (data.response || [])
                .map(item => ({

                    id:
                        item.team?.id,

                    name:
                        item.team?.name,

                    logo:
                        item.team?.logo,

                    country:
                        item.team?.country

                }));


        res.json({

            query: query,

            count: teams.length,

            teams: teams

        });


    } catch (error) {

        console.error(
            "Search Error:",
            error
        );


        res.status(500).json({
            error:
                "Unable to search teams"
        });
    }

});


// ========================================
// FORMAT MATCH
// ========================================

function formatMatch(match) {

    return {

        id:
            match.fixture?.id,

        date:
            match.fixture?.date,

        status:
            match.fixture?.status?.short,

        time:
            match.fixture?.status?.elapsed,

        home: {

            name:
                match.teams?.home?.name,

            logo:
                match.teams?.home?.logo

        },

        away: {

            name:
                match.teams?.away?.name,

            logo:
                match.teams?.away?.logo

        },

        score: {

            home:
                match.goals?.home,

            away:
                match.goals?.away

        },

        league: {

            name:
                match.league?.name,

            country:
                match.league?.country,

            logo:
                match.league?.logo

        }

    };

}

app.get("/test-api", async (req, res) => {
    try {
        const response = await fetch(
            "https://v3.football.api-sports.io/status",
            {
                headers: {
                    "x-apisports-key": API_KEY
                }
            }
        );

        const data = await response.json();

        res.json({
            httpStatus: response.status,
            apiResponse: data
        });

    } catch (error) {
        console.error("Test API Error:", error);

        res.status(500).json({
            error: "Unable to connect to Football API"
        });
    }
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
