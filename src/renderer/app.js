const el = (id) => document.getElementById(id);

let map;
let marker;

function setStatus(message) {
  el("status").textContent = message;
}

function readCityInput() {
  return {
    cityName: el("cityName").value.trim(),
    latitude: Number(el("latitude").value),
    longitude: Number(el("longitude").value),
    populationDensityPerKm2: Number(el("populationDensityPerKm2").value),
    currentGreenCoverPercent: Number(el("currentGreenCoverPercent").value),
    soilQualityIndex: Number(el("soilQualityIndex").value),
    waterStressIndex: Number(el("waterStressIndex").value),
    seismicZoneFactor: Number(el("seismicZoneFactor").value)
  };
}

function readSettingsInput() {
  return {
    mapProvider: el("mapProvider").value,
    googleMapsApiKey: el("googleMapsApiKey").value.trim(),
    mapplsApiKey: el("mapplsApiKey").value.trim(),
    geminiApiKey: el("geminiApiKey").value.trim(),
    aiMode: el("aiMode").value,
    model: el("model").value.trim(),
    cacheTtlMinutes: Number(el("cacheTtlMinutes").value)
  };
}

function applySettings(settings) {
  el("mapProvider").value = settings.mapProvider || "google";
  el("googleMapsApiKey").value = settings.googleMapsApiKey || "";
  el("mapplsApiKey").value = settings.mapplsApiKey || "";
  el("geminiApiKey").value = settings.geminiApiKey || "";
  el("aiMode").value = settings.aiMode || "gemini";
  el("model").value = settings.model || "gemini-1.5-flash";
  el("cacheTtlMinutes").value = String(settings.cacheTtlMinutes || 30);
}

async function loadScriptOnce({ id, src, errorMessage }) {
  if (document.getElementById(id)) {
    return;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(errorMessage));
    document.head.appendChild(script);
  });
}

function updateCoordinatesFromEvent(event) {
  const lat =
    event?.latLng?.lat?.() ??
    event?.latLng?.lat ??
    event?.lngLat?.lat ??
    event?.lat ??
    event?.position?.lat;
  const lng =
    event?.latLng?.lng?.() ??
    event?.latLng?.lng ??
    event?.lngLat?.lng ??
    event?.lng ??
    event?.position?.lng;

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    el("latitude").value = Number(lat).toFixed(4);
    el("longitude").value = Number(lng).toFixed(4);
  }
}

function renderReport(report) {
  const output = {
    city: report.city,
    generatedAt: report.generatedAt,
    aiMode: report.mode,
    cache: report.cache,
    risk: report.risk,
    riskProjection: report.riskProjection,
    greenSpace: report.greenSpace,
    farming: report.farming,
    irrigation: report.irrigation,
    prioritizedActions: report.prioritizedActions,
    aiBrief: report.aiBrief,
    confidence: report.confidence,
    traceability: report.traceability
  };
  el("reportOutput").textContent = JSON.stringify(output, null, 2);
}

async function loadGoogleMap() {
  const apiKey = el("googleMapsApiKey").value.trim();
  if (!apiKey) {
    setStatus("Google Maps key missing. Map loader skipped.");
    return;
  }

  if (!window.google?.maps) {
    await loadScriptOnce({
      id: "google-maps-sdk",
      src: `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`,
      errorMessage: "Unable to load Google Maps script."
    });
  }

  const cityInput = readCityInput();
  const center = { lat: cityInput.latitude, lng: cityInput.longitude };
  el("map").innerHTML = "";

  map = new window.google.maps.Map(el("map"), {
    center,
    zoom: 11,
    mapTypeControl: true,
    streetViewControl: false
  });

  marker = new window.google.maps.Marker({
    position: center,
    map,
    draggable: true,
    title: "Selected city center"
  });

  marker.addListener("dragend", (event) => {
    updateCoordinatesFromEvent(event);
  });

  setStatus("Google map loaded. Drag marker to refine city center.");
}

async function loadMapplsMap() {
  const apiKey = el("mapplsApiKey").value.trim();
  if (!apiKey) {
    setStatus("Mappls key missing. Map loader skipped.");
    return;
  }

  if (!window.mappls?.Map) {
    await loadScriptOnce({
      id: "mappls-sdk",
      src: `https://apis.mappls.com/advancedmaps/v1/${encodeURIComponent(apiKey)}/map_load?v=1.5`,
      errorMessage: "Unable to load Mappls script."
    });
  }

  const cityInput = readCityInput();
  el("map").innerHTML = "";

  map = new window.mappls.Map("map", {
    center: [cityInput.latitude, cityInput.longitude],
    zoom: 11
  });

  marker = new window.mappls.Marker({
    map,
    position: { lat: cityInput.latitude, lng: cityInput.longitude },
    draggable: true
  });

  if (typeof marker.on === "function") {
    marker.on("dragend", (event) => {
      updateCoordinatesFromEvent(event);
      const markerPosition = marker?.getPosition?.();
      if (Number.isFinite(markerPosition?.lat) && Number.isFinite(markerPosition?.lng)) {
        el("latitude").value = Number(markerPosition.lat).toFixed(4);
        el("longitude").value = Number(markerPosition.lng).toFixed(4);
      }
    });
  }

  setStatus("Mappls map loaded. Drag marker to refine city center.");
}

async function loadMap() {
  if (el("mapProvider").value === "mappls") {
    await loadMapplsMap();
    return;
  }

  await loadGoogleMap();
}

async function runAnalysis() {
  const cityInput = readCityInput();

  if (!cityInput.cityName || Number.isNaN(cityInput.latitude) || Number.isNaN(cityInput.longitude)) {
    setStatus("Please provide valid city input values.");
    return;
  }

  try {
    setStatus("Running city analysis...");
    const report = await window.citySimulator.runAnalysis(cityInput);
    renderReport(report);
    setStatus(`Analysis complete (${report.cache === "hit" ? "cache hit" : "fresh"}).`);
  } catch (error) {
    setStatus(`Analysis failed: ${error.message}`);
  }
}

async function saveSettings() {
  try {
    const settings = readSettingsInput();
    await window.citySimulator.saveSettings(settings);
    setStatus("Settings saved.");
  } catch (error) {
    setStatus(`Could not save settings: ${error.message}`);
  }
}

async function init() {
  const settings = await window.citySimulator.getSettings();
  applySettings(settings);

  el("saveSettings").addEventListener("click", saveSettings);
  el("loadMap").addEventListener("click", loadMap);
  el("runAnalysis").addEventListener("click", runAnalysis);
}

init().catch((error) => {
  setStatus(`Initialization failed: ${error.message}`);
});
