function createSVG(planetStatus) {
  // Group planets by house
  const housePositions = {};
  for (let i = 1; i <= 12; i++) {
    housePositions[i] = [];
  }

  // Get rashi numbers for each house (from Lagna)
  const lagnaRashi = planetStatus.La.rashi.number;
  const houseToRashi = {};
  for (let i = 1; i <= 12; i++) {
    houseToRashi[i] = ((lagnaRashi - 1 + (i - 1)) % 12) + 1;
  }

  // Rashi symbols
  const rashiSymbols = {
    1: "♈", 2: "♉", 3: "♊", 4: "♋", 5: "♌", 6: "♍",
    7: "♎", 8: "♏", 9: "♐", 10: "♑", 11: "♒", 12: "♓"
  };

  // Planet symbols
  const planetSymbols = {
    Su: "☉", Mo: "☽", Ma: "♂", Me: "☿", Ju: "♃",
    Ve: "♀", Sa: "♄", Ra: "☊", Ke: "☋"
  };

  // Place planets in houses
  const planets = ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"];
  planets.forEach((planet) => {
    const p = planetStatus[planet];
    if (p && p.house) {
      let status = "";
      if (p.retrograde) status += "ᴿ";
      if (p.combust) status += "ᶜ";
      if (p.exalted) status += "ᵁ";
      if (p.debilitated) status += "ᴺ";
      housePositions[p.house].push({
        symbol: planetSymbols[planet],
        name: planet,
        status: status,
        retrograde: p.retrograde,
        combust: p.combust,
        exalted: p.exalted,
        debilitated: p.debilitated
      });
    }
  });

  // House coordinates for North Indian chart
  const houseCoords = {
    1:  { rashi: { x: 250, y: 175 }, planet: { x: 250, y: 130 } },
    2:  { rashi: { x: 125, y: 75 },  planet: { x: 125, y: 45 } },
    3:  { rashi: { x: 50, y: 150 },  planet: { x: 50, y: 120 } },
    4:  { rashi: { x: 125, y: 250 }, planet: { x: 125, y: 220 } },
    5:  { rashi: { x: 50, y: 350 },  planet: { x: 50, y: 380 } },
    6:  { rashi: { x: 125, y: 425 }, planet: { x: 125, y: 455 } },
    7:  { rashi: { x: 250, y: 325 }, planet: { x: 250, y: 370 } },
    8:  { rashi: { x: 375, y: 425 }, planet: { x: 375, y: 455 } },
    9:  { rashi: { x: 450, y: 350 }, planet: { x: 450, y: 380 } },
    10: { rashi: { x: 375, y: 250 }, planet: { x: 375, y: 220 } },
    11: { rashi: { x: 450, y: 150 }, planet: { x: 450, y: 120 } },
    12: { rashi: { x: 375, y: 75 },  planet: { x: 375, y: 45 } },
  };

  // Generate rashi texts with symbols
  let rashiTexts = "";
  for (let house = 1; house <= 12; house++) {
    const coords = houseCoords[house];
    const rashiNum = houseToRashi[house];
    const symbol = rashiSymbols[rashiNum];
    // rashiTexts += `  <text x="${coords.rashi.x}" y="${coords.rashi.y}" text-anchor="middle" class="rashi">${symbol}</text>\n`;
    rashiTexts += `  <text x="${coords.rashi.x}" y="${coords.rashi.y + 18}" text-anchor="middle" class="rashi-num">${rashiNum}</text>\n`;
  }

  // Generate planet texts with symbols
  let planetTexts = "";
  for (let house = 1; house <= 12; house++) {
    const coords = houseCoords[house];
    const planetsInHouse = housePositions[house];
    if (planetsInHouse.length > 0) {
      planetsInHouse.forEach((p, index) => {
        const yOffset = index * 20;
        let colorClass = "planet";
        if (p.exalted) colorClass = "planet-exalted";
        if (p.debilitated) colorClass = "planet-debilitated";
        if (p.combust) colorClass = "planet-combust";
        if (p.retrograde) colorClass += " retrograde";
        
        planetTexts += `  <text x="${coords.planet.x}" y="${coords.planet.y + yOffset}" text-anchor="middle" class="${colorClass}">`;
        planetTexts += `${p.symbol} ${p.name}${p.status}</text>\n`;
      });
    }
  }

  const svg = `<svg width="500" height="500" viewBox="0 0 500 500" rx="15" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradients -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e94560;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff6b6b;stop-opacity:1" />
    </linearGradient>

    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffd700;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#ff8c00;stop-opacity:0.8" />
    </linearGradient>

    <!-- Glow filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Shadow filter -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="500" height="500" fill="url(#bgGradient)"/>
  
  <!-- Decorative border 
  <rect x="5" y="5" width="490" height="490" fill="none" stroke="url(#borderGradient)" stroke-width="3" rx="12" ry="12"/>
-->
  <!-- Inner glow border 
  <rect x="15" y="15" width="470" height="470" fill="none" stroke="#e94560" stroke-width="1" rx="8" ry="8" opacity="0.3"/>
-->
  <!-- Main Chart Lines -->
  <g stroke="url(#lineGradient)" stroke-width="2" filter="url(#glow)">
    <!-- Outer square -->
    <line x1="0" y1="0" x2="500" y2="500"/>
    <line x1="500" y1="0" x2="0" y2="500"/>
    
    <!-- Inner diamond -->
    <line x1="250" y1="0" x2="500" y2="250"/>
    <line x1="500" y1="250" x2="250" y2="500"/>
    <line x1="250" y1="500" x2="0" y2="250"/>
    <line x1="0" y1="250" x2="250" y2="0"/>
  </g>

  <!-- Center decoration 
  <circle cx="250" cy="250" r="40" fill="none" stroke="#e94560" stroke-width="1" opacity="0.5"/>
  <circle cx="250" cy="250" r="30" fill="none" stroke="#ffd700" stroke-width="1" opacity="0.3"/>
  <text x="250" y="255" text-anchor="middle" class="center-text">कुंडली</text> -->

  <!-- Styles -->
  <style>
    .rashi { 
      font: bold 22px 'Segoe UI Symbol', sans-serif; 
      fill: #ffd700; 
      filter: url(#glow);
    }
    .rashi-num { 
      font: 11px 'Segoe UI', sans-serif; 
      fill: #888; 
    }
    .planet { 
      font: bold 13px 'Segoe UI', sans-serif; 
      fill: #00d4ff; 
    }
    .planet-exalted { 
      font: bold 13px 'Segoe UI', sans-serif; 
      fill: #00ff88; 
      // filter: url(#glow);
    }
    .planet-debilitated { 
      font: bold 13px 'Segoe UI', sans-serif; 
      fill: #ff6b6b; 
    }
    .planet-combust { 
      font: bold 13px 'Segoe UI', sans-serif; 
      fill: #ff9f43; 
    }
    .retrograde { 
      font-style: italic; 
      fill: #ffdd57;
    }
    .center-text { 
      font: bold 14px 'Noto Sans Devanagari', sans-serif; 
      fill: #e94560; 
    }
    .header { 
      font: bold 18px 'Segoe UI', sans-serif; 
      fill: #fff; 
    }
  </style>

  <!-- Rashi Symbols -->
${rashiTexts}
  <!-- Planets -->
${planetTexts}
</svg>`;

  return svg;
}

module.exports = { createSVG };
