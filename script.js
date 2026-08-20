// ==========================================
// MATCH ZONE LIVE - FINAL SCRIPT
// ==========================================

const API_BASE = "https://match-zone-backend-1.onrender.com";
const LIVE_API = `${API_BASE}/api/fixtures/live`;

const REFRESH_INTERVAL = 15000;

let liveMatches = [];
let selectedLeague = "all";


// ==========================================
// GET ELEMENTS
// ==========================================

const matchesContainer =
  document.getElementById("matchesContainer");

const lastUpdate =
  document.getElementById("lastUpdate");


// ==========================================
// LOAD LIVE MATCHES
// ==========================================

async function loadLiveMatches() {

  if (!matchesContainer) {
    console.error(
      "Match Zone: #matchesContainer was not found."
    );
    return;
  }

  setLoading();

  try {

    const response = await fetch(LIVE_API, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Backend returned HTTP ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Match Zone API response:", data);


    // API error

    if (
      data.errors &&
      Object.keys(data.errors).length > 0
    ) {

      throw new Error(
        Object.values(data.errors).join(", ")
      );

    }


    liveMatches =
      Array.isArray(data.response)
        ? data.response
        : [];


    renderMatches();

    updateLastUpdate();

  }

  catch (error) {

    console.error(
      "Match Zone error:",
      error
    );

    showError();

  }

}


// ==========================================
// LOADING
// ==========================================

function setLoading() {

  matchesContainer.innerHTML = `

    <div class="empty-box">

      <div class="loader"></div>

      <h3>Connecting...</h3>

      <p>
        Loading live matches...
      </p>

    </div>

  `;

}


// ==========================================
// ERROR
// ==========================================

function showError() {

  matchesContainer.innerHTML = `

    <div class="empty-box">

      <div class="empty-icon">
        ⚠️
      </div>

      <h3>
        Unable to load live matches
      </h3>

      <p>
        Check your backend connection
        and try again.
      </p>

      <button
        class="primary-btn"
        onclick="loadLiveMatches()"
      >
        🔄 Retry
      </button>

    </div>

  `;

}


// ==========================================
// RENDER MATCHES
// ==========================================

function renderMatches() {

  let matches = [...liveMatches];


  // Filter league

  if (selectedLeague !== "all") {

    matches = matches.filter(match => {

      const country =
        match.league?.country
          ?.toLowerCase() || "";

      return country.includes(
        selectedLeague.toLowerCase()
      );

    });

  }


  // No matches

  if (matches.length === 0) {

    matchesContainer.innerHTML = `

      <div class="empty-box">

        <div class="empty-icon">
          ⚽
        </div>

        <h3>
          No Live Matches
        </h3>

        <p>
          There are currently no live matches.
        </p>

      </div>

    `;

    return;

  }


  // Create cards

  matchesContainer.innerHTML =
    matches.map(createMatchCard).join("");

}


// ==========================================
// MATCH CARD
// ==========================================

function createMatchCard(match) {

  const fixture = match.fixture || {};
  const league = match.league || {};
  const teams = match.teams || {};
  const goals = match.goals || {};
  const status = fixture.status || {};

  const home = teams.home || {};
  const away = teams.away || {};


  const homeName =
    home.name || "Home";

  const awayName =
    away.name || "Away";


  const homeLogo =
    home.logo || "";

  const awayLogo =
    away.logo || "";


  const homeScore =
    goals.home ?? 0;

  const awayScore =
    goals.away ?? 0;


  // Match minute

  let minute = "LIVE";

  if (status.short === "HT") {

    minute = "HT";

  }

  else if (status.short === "ET") {

    minute = "ET";

  }

  else if (
    status.elapsed !== null &&
    status.elapsed !== undefined
  ) {

    minute =
      `${status.elapsed}'`;

  }


  return `

    <article
      class="match-card"
      data-fixture-id="${fixture.id || ""}"
    >

      <!-- LEAGUE -->

      <div class="league-header">

        <div class="league-info">

          ${
            league.logo
              ? `
                <img
                  class="league-logo"
                  src="${league.logo}"
                  alt="${escapeHTML(
                    league.name || "League"
                  )}"
                  loading="lazy"
                >
              `
              : ""
          }

          <div>

            <strong>
              ${escapeHTML(
                league.name || "Football"
              )}
            </strong>

            <span>
              ${escapeHTML(
                league.country || ""
              )}
            </span>

          </div>

        </div>

        <span class="live-badge">
          🔴 LIVE
        </span>

      </div>


      <!-- MATCH -->

      <div class="match-body">


        <!-- HOME -->

        <div class="team home-team">

          ${
            homeLogo
              ? `
                <img
                  class="team-logo"
                  src="${homeLogo}"
                  alt="${escapeHTML(homeName)}"
                  loading="lazy"
                  onerror="this.style.display='none'"
                >
              `
              : `
                <div class="team-placeholder">
                  ⚽
                </div>
              `
          }

          <span class="team-name">
            ${escapeHTML(homeName)}
          </span>

        </div>


        <!-- SCORE -->

        <div class="score">

          <span class="live-label">
            LIVE
          </span>

          <div class="score-number">

            <span>
              ${homeScore}
            </span>

            <b>:</b>

            <span>
              ${awayScore}
            </span>

          </div>

          <span class="live-minute">
            ${minute}
          </span>

        </div>


        <!-- AWAY -->

        <div class="team away-team">

          <span class="team-name">
            ${escapeHTML(awayName)}
          </span>

          ${
            awayLogo
              ? `
                <img
                  class="team-logo"
                  src="${awayLogo}"
                  alt="${escapeHTML(awayName)}"
                  loading="lazy"
                  onerror="this.style.display='none'"
                >
              `
              : `
                <div class="team-placeholder">
                  ⚽
                </div>
              `
          }

        </div>

      </div>


      <!-- FOOTER -->

      <div class="match-footer">

        <span>
          ${escapeHTML(
            status.long || "Live"
          )}
        </span>

        <span>
          ${escapeHTML(
            fixture.venue?.city || ""
          )}
        </span>

      </div>

    </article>

  `;

}


// ==========================================
// LEAGUE FILTER
// ==========================================

function filterLeague(
  country,
  button
) {

  selectedLeague =
    country || "all";


  // Remove active state

  document
    .querySelectorAll(
      ".league-btn"
    )
    .forEach(btn => {

      btn.classList.remove(
        "active"
      );

    });


  // Add active state

  if (button) {

    button.classList.add(
      "active"
    );

  }


  renderMatches();

}


// ==========================================
// REFRESH
// ==========================================

function refreshMatches() {

  loadLiveMatches();

}


// ==========================================
// LAST UPDATE
// ==========================================

function updateLastUpdate() {

  if (!lastUpdate) {
    return;
  }

  const now =
    new Date();

  lastUpdate.textContent =
    `Last update: ${now.toLocaleTimeString()}`;

}


// ==========================================
// SCROLL TO LIVE
// ==========================================

function goToLive() {

  const liveSection =
    document.getElementById("live");

  if (liveSection) {

    liveSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


// ==========================================
// SAFE TEXT
// ==========================================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ==========================================
// AUTO START
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadLiveMatches();

    setInterval(
      loadLiveMatches,
      REFRESH_INTERVAL
    );

  }
);


// ==========================================
// HTML ACCESS
// ==========================================

window.loadLiveMatches =
  loadLiveMatches;

window.refreshMatches =
  refreshMatches;

window.filterLeague =
  filterLeague;

window.goToLive =
  goToLive;
