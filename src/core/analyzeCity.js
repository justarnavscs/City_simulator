import { getWebContext } from "./dataSources/webDataService.js";
import { computeDisasterRisk, projectRiskImprovement } from "./simulation/disasterRisk.js";
import { getGreenSpacePlan, getFarmingSuitability, getIrrigationPlan } from "./simulation/landPlanning.js";
import { generateAiBrief } from "./ai/aiOrchestrator.js";

function prioritizeActions({ risk, greenSpace, farming, irrigation }) {
  const candidates = [
    {
      title: "Flood resilience retrofits",
      score: risk.flood,
      confidence: 0.74,
      rationale: "High precipitation and low-elevation pressure increase urban flood risk."
    },
    {
      title: "Urban heat mitigation via green corridors",
      score: risk.heatwave + greenSpace.gapPercent,
      confidence: 0.79,
      rationale: "Green-space gap and heatwave intensity indicate urgent cooling demand."
    },
    {
      title: "Targeted climate-smart farming zones",
      score: farming.score,
      confidence: 0.68,
      rationale: "Soil, rainfall, and temperature conditions support selective expansion."
    },
    {
      title: "Irrigation modernization",
      score: 100 - irrigation.deficitMm + (irrigation.efficiencyPriority === "high" ? 15 : 5),
      confidence: 0.72,
      rationale: "Water stress and rainfall deficit require efficient irrigation strategy."
    }
  ];

  return candidates
    .sort((a, b) => b.score - a.score)
    .map((action, index) => ({
      priority: index + 1,
      ...action,
      score: Math.round(action.score)
    }));
}

export async function analyzeCity({ cityInput, settings }) {
  const webContext = await getWebContext(cityInput);
  const risk = computeDisasterRisk({ city: cityInput, webContext });
  const greenSpace = getGreenSpacePlan({ city: cityInput, risk });
  const farming = getFarmingSuitability({ city: cityInput, webContext });
  const irrigation = getIrrigationPlan({ city: cityInput, webContext, farming });

  const interventions = [...greenSpace.recommendations, ...irrigation.recommendations];
  const riskProjection = projectRiskImprovement(risk, interventions);

  const analysisInput = {
    city: {
      name: cityInput.cityName,
      latitude: cityInput.latitude,
      longitude: cityInput.longitude
    },
    risk,
    greenSpace,
    farming,
    irrigation,
    sources: webContext.sources
  };

  const aiBrief = await generateAiBrief({ settings, analysisInput });
  const prioritizedActions = prioritizeActions({ risk, greenSpace, farming, irrigation });

  return {
    city: cityInput.cityName,
    generatedAt: new Date().toISOString(),
    mode: aiBrief.provider,
    risk,
    riskProjection,
    greenSpace,
    farming,
    irrigation,
    prioritizedActions,
    aiBrief: aiBrief.result,
    traceability: {
      webSources: webContext.sources,
      fallbackReason: aiBrief.fallbackReason || null
    },
    confidence: {
      overall: Number((prioritizedActions.reduce((acc, a) => acc + a.confidence, 0) / prioritizedActions.length).toFixed(2)),
      notes: aiBrief.result.confidenceNotes || []
    }
  };
}
