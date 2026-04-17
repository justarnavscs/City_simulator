import test from "node:test";
import assert from "node:assert/strict";
import { computeDisasterRisk, projectRiskImprovement } from "../src/core/simulation/disasterRisk.js";

test("computeDisasterRisk returns bounded scores", () => {
  const risk = computeDisasterRisk({
    city: { populationDensityPerKm2: 14000, seismicZoneFactor: 3 },
    webContext: {
      weather: {
        currentTempC: 34,
        weeklyRainMm: 60,
        currentWindKph: 24,
        currentHumidity: 40
      },
      elevation: { meters: 180 }
    }
  });

  for (const value of Object.values(risk)) {
    assert.ok(value >= 0 && value <= 100);
  }
});

test("projectRiskImprovement reduces non-overall risk values", () => {
  const before = {
    flood: 80,
    heatwave: 70,
    wildfire: 65,
    earthquake: 40,
    overall: 64
  };

  const projection = projectRiskImprovement(before, ["a", "b", "c"]);

  assert.ok(projection.after.flood < before.flood);
  assert.ok(projection.after.heatwave < before.heatwave);
  assert.equal(projection.after.overall, before.overall);
});
