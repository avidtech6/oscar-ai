import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Cvo9g8xk.js","_app/immutable/chunks/scheduler.DKaqMhG1.js","_app/immutable/chunks/index.DlqHU1Qv.js","_app/immutable/chunks/each.C2d3_RSt.js","_app/immutable/chunks/stores.BFoXjtDT.js","_app/immutable/chunks/entry.Be3j---l.js","_app/immutable/chunks/index.CvdjGRI4.js","_app/immutable/chunks/index.CV4gNeWM.js","_app/immutable/chunks/index.BvaDNSI_.js","_app/immutable/chunks/_commonjsHelpers.Cpj98o6Y.js","_app/immutable/chunks/settings.a3gRd5qY.js"];
export const stylesheets = ["_app/immutable/assets/0.rj3iQiYW.css"];
export const fonts = [];
