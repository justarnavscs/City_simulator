export function runLocalAnalysis({ analysisInput }) {
  const { city, risk, greenSpace, farming, irrigation } = analysisInput;
  const sortedRisks = Object.entries(risk)
    .filter(([k]) => k !== "overall")
    .sort((a, b) => b[1] - a[1]);

  const topRisk = sortedRisks[0]?.[0] ?? "unknown";

  return {
    summary: `${city.name} requires priority attention for ${topRisk} risk. The plan should combine climate adaptation, land-use optimization, and efficient irrigation investments.`,
    topActions: [
      `Increase green cover from ${greenSpace.currentPercent}% to ${greenSpace.targetPercent}% in heat-prone wards.`,
      `Implement flood-resilient drainage retrofits where flood risk score is ${risk.flood}.`,
      `Scale farming in zones with suitability score ${farming.score} using climate-resilient crop mixes.`,
      `Adopt ${irrigation.strategy} irrigation strategy with deficit tracking (${irrigation.deficitMm} mm).`,
      "Track interventions quarterly using risk and resilience KPI dashboards."
    ],
    warnings: [
      "Local AI fallback is heuristic and should be reviewed by domain experts.",
      "Use calibrated local hazard maps for policy-level decisions."
    ],
    confidenceNotes: [
      "Confidence is moderate where web data freshness is low.",
      "Confidence improves after integrating high-resolution municipal datasets."
    ]
  };
}
