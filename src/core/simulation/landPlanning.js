function level(value) {
  if (value >= 75) return "high";
  if (value >= 45) return "medium";
  return "low";
}

export function getGreenSpacePlan({ city, risk }) {
  const requiredPercent = Math.min(40, 18 + risk.heatwave * 0.12 + risk.flood * 0.08);
  const currentPercent = Number(city.currentGreenCoverPercent || 10);
  const gap = Math.max(0, requiredPercent - currentPercent);

  return {
    currentPercent,
    targetPercent: Number(requiredPercent.toFixed(1)),
    gapPercent: Number(gap.toFixed(1)),
    priority: level(gap * 2),
    recommendations: [
      "Create cooling corridors with native tree belts around dense residential zones.",
      "Convert flood-prone hardscape parcels into retention parks.",
      "Use rooftop and vertical greening for high-density districts."
    ]
  };
}

export function getFarmingSuitability({ city, webContext }) {
  const rain = webContext.weather.weeklyRainMm;
  const temp = webContext.weather.currentTempC;
  const elevation = webContext.elevation.meters;
  const soil = Number(city.soilQualityIndex || 55);

  let score = soil * 0.5;
  score += Math.max(0, 100 - Math.abs(temp - 24) * 4) * 0.2;
  score += Math.min(100, rain * 2) * 0.2;
  score += Math.max(0, 100 - Math.abs(elevation - 300) * 0.08) * 0.1;

  const rounded = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: rounded,
    suitability: level(rounded),
    recommendations: [
      "Prioritize peri-urban parcels with lower heat island intensity.",
      "Use mixed-crop belts and protected nursery zones near water access.",
      "Reserve high-drainage land for rain-sensitive crops and orchards."
    ]
  };
}

export function getIrrigationPlan({ city, webContext, farming }) {
  const weeklyRain = webContext.weather.weeklyRainMm;
  const waterStress = Number(city.waterStressIndex || 50);
  const deficit = Math.max(0, 45 - weeklyRain);

  const strategy = waterStress > 65 || deficit > 20
    ? "micro-drip-first"
    : "hybrid-drip-sprinkler";

  return {
    strategy,
    deficitMm: Number(deficit.toFixed(1)),
    efficiencyPriority: waterStress > 65 ? "high" : "medium",
    recommendations: [
      "Deploy soil-moisture sensors and automate drip intervals by crop stage.",
      "Use treated greywater and rainwater harvesting for non-potable irrigation loops.",
      `Focus irrigation investment in ${farming.suitability}-suitability zones first for best return.`
    ]
  };
}
