const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Match Zone Backend"
  });
});

app.get("/api/live", async (req, res) => {
  try {
    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        headers: {
          "x-apisports-key": process.env.API_KEY
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Football API request failed"
      });
    }

    const data = await response.json();

    res.json(data);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Match Zone Backend running on port ${PORT}`);
});
