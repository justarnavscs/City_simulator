function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function computeDisasterRisk({ city, webContext }) {
  const temp = webContext.weather.currentTempC;
  const rain = webContext.weather.weeklyRainMm;
  const wind = webContext.weather.currentWindKph;
  const humidity = webContext.weather.currentHumidity;
  const elevation = webContext.elevation.meters;
  const populationDensity = Number(city.populationDensityPerKm2 || 3000);

  const floodRisk = clamp((rain * 0.8) + Math.max(0, 250 - elevation) * 0.15 + populationDensity * 0.003);
  const heatRisk = clamp((temp - 20) * 4 + Math.max(0, populationDensity - 3000) * 0.004 + Math.max(0, 45 - humidity) * 0.8);
  const fireRisk = clamp((temp - 18) * 2.8 + wind * 1.4 + Math.max(0, 50 - humidity) * 1.5 - rain * 0.25);
  const earthquakeRisk = clamp(20 + (city.seismicZoneFactor || 1) * 18);

  return {
    flood: floodRisk,
    heatwave: heatRisk,
    wildfire: fireRisk,
    earthquake: earthquakeRisk,
    overall: clamp((floodRisk + heatRisk + fireRisk + earthquakeRisk) / 4)
  };
}

export function projectRiskImprovement(risk, interventions) {
  const reductionFactor = Math.min(0.6, interventions.length * 0.08);
  return {
    before: risk,
    after: Object.fromEntries(
      Object.entries(risk).map(([k, v]) => [k, k === "overall" ? v : clamp(v * (1 - reductionFactor))])
    )
  };
}
