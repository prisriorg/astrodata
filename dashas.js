// Vimshottari Dasha order and years
const dashaOrder = ["Ke", "Ve", "Su", "Mo", "Ma", "Ra", "Ju", "Sa", "Me"];
const dashaYears = {
  Ke: 7,
  Ve: 20,
  Su: 6,
  Mo: 10,
  Ma: 7,
  Ra: 18,
  Ju: 16,
  Sa: 19,
  Me: 17,
};

// Nakshatra to starting dasha lord mapping
const nakshatraToLord = {
  "Ashwini": "Ke",
  "Bharani": "Ve",
  "Krittika": "Su",
  "Rohini": "Mo",
  "Mrigashira": "Ma",
  "Ardra": "Ra",
  "Punarvasu": "Ju",
  "Pushya": "Sa",
  "Ashlesha": "Me",
  "Magha": "Ke",
  "Purva Phalguni": "Ve",
  "Uttara Phalguni": "Su",
  "Hasta": "Mo",
  "Chitra": "Ma",
  "Swati": "Ra",
  "Vishakha": "Ju",
  "Anuradha": "Sa",
  "Jyeshtha": "Me",
  "Mula": "Ke",
  "Purva Ashadha": "Ve",
  "Uttara Ashadha": "Su",
  "Shravana": "Mo",
  "Dhanishta": "Ma",
  "Shatabhisha": "Ra",
  "Purva Bhadrapada": "Ju",
  "Uttara Bhadrapada": "Sa",
  "Revati": "Me",
};

// Calculate remaining dasha at birth
function getRemainingDasha(moonLongitude) {
  const nakshatraSpan = 13.333333; // 13°20' per nakshatra
  const nakshatraIndex = Math.floor(moonLongitude / nakshatraSpan);
  const positionInNakshatra = moonLongitude % nakshatraSpan;
  const remainingFraction = 1 - (positionInNakshatra / nakshatraSpan);
  
  return remainingFraction;
}

// Get Mahadasha periods
function getMahadasha(birthChart, birthDate) {
  const moon = birthChart.meta.Mo;
  const nakshatraName = moon.nakshatra.name;
  const moonLongitude = moon.longitude;
  
  // Get starting dasha lord
  const startingLord = nakshatraToLord[nakshatraName];
  const startIndex = dashaOrder.indexOf(startingLord);
  
  // Calculate remaining period of first dasha
  const remainingFraction = getRemainingDasha(moonLongitude);
  const firstDashaYears = dashaYears[startingLord] * remainingFraction;
  
  const mahadashas = [];
  let currentDate = new Date(birthDate);
  
  // First Mahadasha (partial)
  const firstEndDate = new Date(currentDate);
  firstEndDate.setFullYear(firstEndDate.getFullYear() + Math.floor(firstDashaYears));
  firstEndDate.setMonth(firstEndDate.getMonth() + Math.floor((firstDashaYears % 1) * 12));
  
  mahadashas.push({
    lord: startingLord,
    years: parseFloat(firstDashaYears.toFixed(2)),
    startDate: currentDate.toISOString().split('T')[0],
    endDate: firstEndDate.toISOString().split('T')[0],
  });
  
  currentDate = new Date(firstEndDate);
  
  // Remaining Mahadashas (full periods)
  for (let i = 1; i <= 9; i++) {
    const lordIndex = (startIndex + i) % 9;
    const lord = dashaOrder[lordIndex];
    const years = dashaYears[lord];
    
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + years);
    
    mahadashas.push({
      lord,
      years,
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
    
    currentDate = new Date(endDate);
  }
  
  return mahadashas;
}

// Get Antardasha within a Mahadasha
function getAntardasha(mahadashaLord, startDate, totalYears) {
  const startIndex = dashaOrder.indexOf(mahadashaLord);
  const antardashas = [];
  let currentDate = new Date(startDate);
  const totalDays = totalYears * 365.25;
  
  for (let i = 0; i < 9; i++) {
    const lordIndex = (startIndex + i) % 9;
    const lord = dashaOrder[lordIndex];
    
    // Antardasha duration = (Mahadasha years × Antardasha years) / 120
    const antarYears = (totalYears * dashaYears[lord]) / 120;
    const antarDays = antarYears * 365.25;
    
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + Math.floor(antarDays));
    
    antardashas.push({
      lord,
      years: parseFloat(antarYears.toFixed(2)),
      months: parseFloat((antarYears * 12).toFixed(1)),
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
    
    currentDate = new Date(endDate);
  }
  
  return antardashas;
}

// Get current running dasha
function getCurrentDasha(mahadashas, currentDate = new Date()) {
  const today = currentDate.toISOString().split('T')[0];
  
  for (const maha of mahadashas) {
    if (today >= maha.startDate && today <= maha.endDate) {
      const antardashas = getAntardasha(maha.lord, maha.startDate, maha.years);
      
      for (const antar of antardashas) {
        if (today >= antar.startDate && today <= antar.endDate) {
          return {
            mahadasha: maha.lord,
            antardasha: antar.lord,
            mahaStart: maha.startDate,
            mahaEnd: maha.endDate,
            antarStart: antar.startDate,
            antarEnd: antar.endDate,
          };
        }
      }
    }
  }
  return null;
}

module.exports = { getMahadasha, getAntardasha, getCurrentDasha, dashaYears, dashaOrder };