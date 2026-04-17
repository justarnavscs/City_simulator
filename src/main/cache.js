import fs from "node:fs/promises";
import path from "node:path";

function toKey(input) {
  return Buffer.from(JSON.stringify(input)).toString("base64url");
}

export class FileCache {
  constructor(basePath) {
    this.cacheDir = path.join(basePath, "cache");
  }

  async get(input, ttlMinutes) {
    const key = toKey(input);
    const filePath = path.join(this.cacheDir, `${key}.json`);

    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      const ageMs = Date.now() - data.timestamp;
      if (ageMs > ttlMinutes * 60 * 1000) {
        return null;
      }
      return data.value;
    } catch {
      return null;
    }
  }

  async set(input, value) {
    const key = toKey(input);
    const filePath = path.join(this.cacheDir, `${key}.json`);
    await fs.mkdir(this.cacheDir, { recursive: true });
    await fs.writeFile(
      filePath,
      JSON.stringify({ timestamp: Date.now(), value }, null, 2),
      "utf-8"
    );
  }
}
