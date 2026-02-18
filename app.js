const express = require("express");
const vedicAstrology = require("vedic-astrology");
const { getRashi, getPlanetStatus } = require("./helper");
const { getAntardasha, getMahadasha, getCurrentDasha } = require("./dashas");
const { createSVG } = require("./svg");
const app = express();
const port = 3000;

const date = new Date();
// Default values
const defaults = {
  dateString: `${new Date().getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
  timeString: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
  lat: 25.7464,
  lng: 82.6837,
  timezone: +5.5,
};

console.log(date.getDate());
app.get("/", (req, res) => {
  // Get values from query params or use defaults
  const dateString = req.query.date || defaults.dateString;
  const timeString = req.query.time || defaults.timeString;
  const lat = parseFloat(req.query.lat) || defaults.lat;
  const lng = parseFloat(req.query.lng) || defaults.lng;
  const timezone = parseFloat(req.query.tz) || defaults.timezone;

  const data = {};

  const birthChart = vedicAstrology.positioner.getBirthChart(
    dateString,
    timeString,
    lat,
    lng,
    timezone,
  );
  const novaChart = vedicAstrology.positioner.getNavamsaChart(birthChart);
  const d1Chart = vedicAstrology.compatibility.getHousesOfChart(birthChart);
  const d9Chart = vedicAstrology.compatibility.getHousesOfChart(novaChart);

  const planetStatus = getPlanetStatus(birthChart, d1Chart);

  const d9PlanetStatus = getPlanetStatus(novaChart, d9Chart);

  data.planetStatus = planetStatus;
  data.d9PlanetStatus = d9PlanetStatus;

  data.mahadasha = getMahadasha(birthChart, dateString);

  // Current running dasha
  data.currentDasha = getCurrentDasha(data.mahadasha);

  // Antardasha of current Mahadasha
  if (data.currentDasha) {
    const currentMaha = data.mahadasha.find(
      (m) => m.lord === data.currentDasha.mahadasha,
    );
    data.currentAntardashas = getAntardasha(
      currentMaha.lord,
      currentMaha.startDate,
      currentMaha.years,
    );
  }

  // data.svg = createSVG(planetStatus);

  data.rashis = getRashi(birthChart);
  res.json(data);
});

app.get("/svg", (req, res) => {
  // Get values from query params or use defaults
  const dateString = req.query.date || defaults.dateString;
  const timeString = req.query.time || defaults.timeString;
  const lat = parseFloat(req.query.lat) || defaults.lat;
  const lng = parseFloat(req.query.lng) || defaults.lng;
  const timezone = parseFloat(req.query.tz) || defaults.timezone;

  const data = {};

  const birthChart = vedicAstrology.positioner.getBirthChart(
    dateString,
    timeString,
    lat,
    lng,
    timezone,
  );
  const novaChart = vedicAstrology.positioner.getNavamsaChart(birthChart);
  const d1Chart = vedicAstrology.compatibility.getHousesOfChart(birthChart);

  const d9Chart = vedicAstrology.compatibility.getHousesOfChart(novaChart);

  data.planetStatus = getPlanetStatus(birthChart, d1Chart);

  const svg = createSVG(data.planetStatus);

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
});


app.get("/get", (req, res) => {
  const question = req.query.question;
  const random = Math.random() < 0.5 ? "Yes ✓" : "No ✗";
  
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ask the Universe 🔮</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 20px;
      }
      .container {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
      }
      h1 {
        color: #fff;
        font-size: 2rem;
        margin-bottom: 10px;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
      }
      .subtitle {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 30px;
        font-size: 0.9rem;
      }
      .crystal-ball {
        font-size: 4rem;
        margin-bottom: 20px;
        animation: float 3s ease-in-out infinite;
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .input-group {
        position: relative;
      }
      input[type="text"] {
        width: 100%;
        padding: 15px 20px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 50px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 1rem;
        outline: none;
        transition: all 0.3s ease;
      }
      input[type="text"]::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
      input[type="text"]:focus {
        border-color: #e94560;
        box-shadow: 0 0 20px rgba(233, 69, 96, 0.3);
      }
      button {
        padding: 15px 40px;
        border: none;
        border-radius: 50px;
        background: linear-gradient(135deg, #e94560, #0f3460);
        color: #fff;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      button:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 30px rgba(233, 69, 96, 0.4);
      }
      button:active {
        transform: scale(0.98);
      }
      .answer-box {
        margin-top: 30px;
        padding: 30px;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: ${question ? 'block' : 'none'};
        animation: fadeIn 0.5s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .question-text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        margin-bottom: 15px;
        font-style: italic;
      }
      .answer {
        font-size: 3rem;
        font-weight: bold;
        color: ${random.includes('Yes') ? '#4ade80' : '#f87171'};
        text-shadow: 0 0 30px ${random.includes('Yes') ? 'rgba(26, 222, 98, 0.5)' : 'rgba(248, 113, 113, 0.5)'};
        animation: pulse 1s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .stars {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        z-index: -1;
      }
      .star {
        position: absolute;
        width: 3px;
        height: 3px;
        background: white;
        border-radius: 50%;
        animation: twinkle 2s infinite;
      }
    </style>
  </head>
  <body>
    <div class="stars" id="stars"></div>
    <div class="container">
      <div class="crystal-ball">🔮</div>
      <h1>Ask the Universe</h1>
      <p class="subtitle">Ask any Yes/No question and discover your destiny</p>
      
      <form action="/get" method="GET">
        <div class="input-group">
          <input type="text" name="question" placeholder="Type your question here..." value="${question || ''}" required>
        </div>
        <button type="submit">🌟 Reveal Answer</button>
      </form>
      
      <div class="answer-box">
        <p class="question-text">"${question || ''}"</p>
        <div class="answer">${random}</div>
      </div>
    </div>
    
    <script>
      // Create stars
      const starsContainer = document.getElementById('stars');
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.opacity = Math.random();
        starsContainer.appendChild(star);
      }
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});




