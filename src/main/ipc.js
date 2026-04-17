import { ipcMain } from "electron";
import { analyzeCity } from "../core/analyzeCity.js";

export function registerIpcHandlers({ settingsStore, cache }) {
  ipcMain.handle("settings:get", async () => settingsStore.load());

  ipcMain.handle("settings:save", async (_event, partialSettings) => {
    return settingsStore.save(partialSettings);
  });

  ipcMain.handle("analysis:run", async (_event, cityInput) => {
    const settings = await settingsStore.load();
    const key = {
      cityInput,
      mode: settings.aiMode,
      model: settings.model
    };

    const cached = await cache.get(key, Number(settings.cacheTtlMinutes || 30));
    if (cached) {
      return { ...cached, cache: "hit" };
    }

    const report = await analyzeCity({ cityInput, settings });
    await cache.set(key, report);
    return { ...report, cache: "miss" };
  });
}
