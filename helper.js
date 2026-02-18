function getRashi(birthChart) {
  return birthChart.meta.Mo.rashi;
}

const rashi = {
  Ar: { number: 1, short: "Ar", name: "Aries" },
  Ta: { number: 2, short: "Ta", name: "Taurus" },
  Ge: { number: 3, short: "Ge", name: "Gemini" },
  Cn: { number: 4, short: "Cn", name: "Cancer" },
  Le: { number: 5, short: "Le", name: "Leo" },
  Vi: { number: 6, short: "Vi", name: "Virgo" },
  Li: { number: 7, short: "Li", name: "Libra" },
  Sc: { number: 8, short: "Sc", name: "Scorpio" },
  Sg: { number: 9, short: "Sg", name: "Sagittarius" },
  Cp: { number: 10, short: "Cp", name: "Capricorn" },
  Aq: { number: 11, short: "Aq", name: "Aquarius" },
  Pi: { number: 12, short: "Pi", name: "Pisces" },
};

const grahas = {
  Su: "Sun",
  Mo: "Moon",
  Ma: "Mars",
  Me: "Mercury",
  Ju: "Jupiter",
  Ve: "Venus",
  Sa: "Saturn",
  Ra: "Rahu",
  Ke: "Ketu",
  La: "Lagna",
};

function getRashiByShort(short) {
  return rashi[short];
}
function longitudeToDegree(longitude) {
  const signNumber = Math.floor(longitude / 30) + 1;
  const degreeInSign = longitude % 30;

  return degreeInSign;
}

function decimalToDMS(decimalDegree) {
  const degrees = Math.floor(decimalDegree);
  const minutesDecimal = (decimalDegree - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);

  return {
    degrees,
    minutes,
    seconds,
    formatted: `${degrees}° ${minutes}' ${seconds}"`,
  };
}

// Exaltation and Debilitation data
const exaltationData = {
  Su: { uchSign: 1, uchDegree: 10, neechSign: 7 }, // Aries / Libra
  Mo: { uchSign: 2, uchDegree: 3, neechSign: 8 }, // Taurus / Scorpio
  Ma: { uchSign: 10, uchDegree: 28, neechSign: 4 }, // Capricorn / Cancer
  Me: { uchSign: 6, uchDegree: 15, neechSign: 12 }, // Virgo / Pisces
  Ju: { uchSign: 4, uchDegree: 5, neechSign: 10 }, // Cancer / Capricorn
  Ve: { uchSign: 12, uchDegree: 27, neechSign: 6 }, // Pisces / Virgo
  Sa: { uchSign: 7, uchDegree: 20, neechSign: 1 }, // Libra / Aries
  Ra: { uchSign: 2, uchDegree: null, neechSign: 8 }, // Taurus / Scorpio
  Ke: { uchSign: 8, uchDegree: null, neechSign: 2 }, // Scorpio / Taurus
  La: { uchSign: null, uchDegree: null, neechSign: null }, // Lagna has no exaltation/debilitation
};

// Combust degrees from Sun
const combustData = {
  Mo: 12,
  Ma: 17,
  Me: { normal: 14, retrograde: 12 },
  Ju: 11,
  Ve: { normal: 10, retrograde: 8 },
  Sa: 15,
};

function getUchNeech(graha, longitude) {
  const data = exaltationData[graha];
  if (!data) return null;

  const signNumber = Math.floor(longitude / 30) + 1;

  if (signNumber === data.uchSign) return "Uch"; // Exalted
  if (signNumber === data.neechSign) return "Neech"; // Debilitated
  return null;
}

function isAsth(graha, grahaLongitude, sunLongitude, isRetrograde = false) {
  const combustLimit = combustData[graha];
  if (!combustLimit) return false;

  const limit =
    typeof combustLimit === "object"
      ? isRetrograde
        ? combustLimit.retrograde
        : combustLimit.normal
      : combustLimit;

  let diff = Math.abs(grahaLongitude - sunLongitude);
  if (diff > 180) diff = 360 - diff;

  return diff <= limit;
}

function getHouseOfPlanet(planetRashi, d1Chart) {
  // d1Chart = { "1": "Ar", "2": "Ta", ... }
  // Find house number where rashi matches planet's rashi
  for (const house in d1Chart) {
    if (d1Chart[house] === planetRashi) {
      return parseInt(house);
    }
  }
  return null;
}
function getPlanetStatus(birthChart, d1Chart) {
  const sunLongitude = birthChart.meta.Su.longitude;
  const planets = ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke", "La"];
  const result = {};

  planets.forEach((graha) => {
    const planet = birthChart.meta[graha];
    if (!planet) return;

    const signNumber = Math.floor(planet.longitude / 30) + 1;
    const degreeInSign = planet.longitude % 30;

    result[graha] = {
      rashi: getRashiByShort(planet.rashi),
      house: getHouseOfPlanet(planet.rashi, d1Chart),
      longitude: planet.longitude,
      degreeInSign: decimalToDMS(degreeInSign).formatted,
      nakshatra: planet.nakshatra,
      retrograde: planet.isRetrograde,
      exalted: getUchNeech(graha, planet.longitude) === "Uch",
      debilitated: getUchNeech(graha, planet.longitude) === "Neech",
      combust:
        graha !== "Su"
          ? isAsth(graha, planet.longitude, sunLongitude, planet.isRetrograde)
          : false, // Combust
    };
  });

  return result;
}

module.exports = { getRashi, longitudeToDegree, decimalToDMS, getPlanetStatus, grahas, rashi, getRashiByShort };
