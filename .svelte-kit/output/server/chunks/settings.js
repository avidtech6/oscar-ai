import { d as derived, w as writable } from "./index.js";
const groqApiKey = writable("");
const theme = writable("dark");
const sidebarCollapsed = writable(false);
const dummyDataEnabled = writable(false);
derived(
  [groqApiKey, theme, sidebarCollapsed, dummyDataEnabled],
  ([$groqApiKey, $theme, $sidebarCollapsed, $dummyDataEnabled]) => ({
    groqApiKey: $groqApiKey,
    theme: $theme,
    sidebarCollapsed: $sidebarCollapsed,
    dummyDataEnabled: $dummyDataEnabled
  })
);
export {
  groqApiKey as g
};
