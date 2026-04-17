import test from "node:test";
import assert from "node:assert/strict";
import { getGreenSpacePlan, getFarmingSuitability, getIrrigationPlan } from "../src/core/simulation/landPlanning.js";

test("green-space plan captures target and gap", () => {
  const plan = getGreenSpacePlan({
    city: { currentGreenCoverPercent: 10 },
    risk: { heatwave: 80, flood: 50 }
  });

  assert.ok(plan.targetPercent > plan.currentPercent);
  assert.ok(plan.gapPercent >= 0);
});

test("farming suitability returns normalized score", () => {
  const farming = getFarmingSuitability({
    city: { soilQualityIndex: 60 },
    webContext: {
      weather: { weeklyRainMm: 30, currentTempC: 25 },
      elevation: { meters: 290 }
    }
  });

  assert.ok(farming.score >= 0 && farming.score <= 100);
});

test("irrigation plan reacts to rainfall deficit and water stress", () => {
  const irrigation = getIrrigationPlan({
    city: { waterStressIndex: 80 },
    webContext: { weather: { weeklyRainMm: 10 } },
    farming: { suitability: "medium" }
  });

  assert.equal(irrigation.strategy, "micro-drip-first");
  assert.equal(irrigation.efficiencyPriority, "high");
});
