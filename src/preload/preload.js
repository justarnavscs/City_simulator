import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("citySimulator", {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
  runAnalysis: (input) => ipcRenderer.invoke("analysis:run", input)
});
