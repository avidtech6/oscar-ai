// Cockpit layout configuration
import { writable } from 'svelte/store';

export const cockpitLayout = writable<Record<string, any>>({
  columns: {
    main: 8,
    sidebar: 4,
    controlPanel: 4
  },
  showMetrics: true,
  showGraph: true,
  showConsole: true,
  showSettings: true,
  showNotifications: true,
  showTimeline: true
});

// Layout functions
export function updateCockpitLayout(layout: Partial<Record<string, any>>) {
  cockpitLayout.update(current => ({ ...current, ...layout }));
}

export function toggleCockpitPanel(panel: string) {
  cockpitLayout.update(current => ({
    ...current,
    [panel]: !current[panel]
  }));
}