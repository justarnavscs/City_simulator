import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_SETTINGS = {
  googleMapsApiKey: "",
  geminiApiKey: "",
  aiMode: "gemini",
  model: "gemini-1.5-flash",
  cacheTtlMinutes: 30
};

export class SettingsStore {
  constructor(basePath) {
    this.filePath = path.join(basePath, "settings.json");
  }

  async load() {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  async save(partialSettings) {
    const current = await this.load();
    const next = { ...current, ...partialSettings };
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(next, null, 2), "utf-8");
    return next;
  }
}
