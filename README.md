# City Simulator

City Simulator is a desktop application that analyzes a city for:
- Disaster risks (flood, heatwave, wildfire, earthquake)
- Green-space expansion strategy
- Urban/peri-urban farming suitability
- Irrigation planning

It supports:
- Google Maps or Mappls map loading for city center selection
- Gemini API analysis with local AI fallback
- Web data ingestion (Open-Meteo weather + elevation)
- Traceable, confidence-scored resilience reports
- Local caching for faster repeat analysis

## MVP Scope

Implemented MVP includes:
- Electron desktop app with settings and simulation UI
- Map loading and draggable city center marker
- Analysis pipeline for risk + planning recommendations
- Prioritized action list with confidence
- AI-generated action brief (Gemini or local fallback)
- JSON report with traceability and before/after risk projection

## Architecture

- `src/main` - Electron main process, secure IPC, settings, caching
- `src/preload` - safe renderer API bridge
- `src/renderer` - desktop UI (city input, map, report)
- `src/core` - simulation and AI orchestration modules
  - `dataSources` - web environmental data adapters
  - `simulation` - disaster and land-use logic
  - `ai` - Gemini client + local fallback client

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Run app

```bash
npm start
```

### 3) Configure keys in app settings

- **Map Provider**:
  - Select `Google Maps` or `Mappls` in app settings
- **Google Maps API Key** (optional, when provider is Google Maps):
  - Maps JavaScript API enabled
- **Mappls API Key** (optional, when provider is Mappls):
  - Advanced Maps JavaScript access enabled
- **Gemini API Key** (optional if AI mode is local):
  - Google Generative Language API access

## Build and Test

```bash
npm run lint
npm test
npm run build
```

`npm run build` creates unpacked desktop output through Electron Builder.
Use `npm run dist` for installable artifacts.

## Calibration Workflow (New Regions)

1. Validate input city center and district context.
2. Adjust city indices (soil, water stress, seismic factor) from local data.
3. Compare simulation outputs against known historical events.
4. Tune weighting coefficients in simulation modules.
5. Re-run scenarios and document accepted thresholds.

## Data, Assumptions, and Limitations

- Web weather/elevation data is fetched from Open-Meteo and is near-real-time but generalized.
- Risk models are heuristic and should be calibrated for policy use.
- Local AI mode provides deterministic guidance and is not a substitute for expert review.
- Gemini output depends on prompt quality and key access.
- For production planning, integrate high-resolution municipal GIS and hydrology datasets.

## Security Notes

- API keys are stored in user-local settings (not committed to repo).
- Renderer has context isolation with preload-only API exposure.
- Node integration is disabled in renderer for safer desktop execution.
