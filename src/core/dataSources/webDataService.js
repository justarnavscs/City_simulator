const DEFAULT_TIMEOUT_MS = 8_000;

async function fetchJson(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed request (${response.status}) for ${url}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchWeatherAndHydrology({ latitude, longitude }) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
  const data = await fetchJson(url);

  const precipitation = data.daily?.precipitation_sum ?? [];
  const totalWeeklyRain = precipitation.reduce((acc, val) => acc + Number(val || 0), 0);

  return {
    source: "Open-Meteo",
    currentTempC: Number(data.current?.temperature_2m ?? 30),
    currentHumidity: Number(data.current?.relative_humidity_2m ?? 50),
    currentWindKph: Number(data.current?.wind_speed_10m ?? 15),
    weeklyRainMm: totalWeeklyRain,
    dailyMaxTempC: data.daily?.temperature_2m_max ?? [],
    dailyMinTempC: data.daily?.temperature_2m_min ?? []
  };
}

export async function fetchElevation({ latitude, longitude }) {
  const url = `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`;
  const data = await fetchJson(url);
  const value = Array.isArray(data.elevation)
    ? Number(data.elevation[0] ?? 0)
    : Number(data.elevation ?? 0);

  return {
    source: "Open-Meteo Elevation",
    meters: value
  };
}

export async function getWebContext(cityInput) {
  const [weather, elevation] = await Promise.all([
    fetchWeatherAndHydrology(cityInput),
    fetchElevation(cityInput)
  ]);

  return {
    weather,
    elevation,
    sources: [
      {
        name: weather.source,
        url: "https://open-meteo.com/"
      },
      {
        name: elevation.source,
        url: "https://open-meteo.com/en/docs/elevation-api"
      }
    ]
  };
}
