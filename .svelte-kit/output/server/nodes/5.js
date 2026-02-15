

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/help/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.op0-0Jw4.js","_app/immutable/chunks/scheduler.DKaqMhG1.js","_app/immutable/chunks/each.C2d3_RSt.js","_app/immutable/chunks/index.DlqHU1Qv.js"];
export const stylesheets = [];
export const fonts = [];
