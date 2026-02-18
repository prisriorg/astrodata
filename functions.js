function getD1Chart(birthDetails) {
  const { dateString, timeString, latitude, longitude, timezone } = birthDetails;
  const birthChart = vedicAstrology.positioner.getBirthChart(
    dateString,
    timeString,
    latitude,
    longitude,
    timezone,
  );
  const d1Chart = vedicAstrology.compatibility.getHousesOfChart(birthChart);
  return d1Chart;
}