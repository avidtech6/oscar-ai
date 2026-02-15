export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg","manifest.json","templates/bs5837_template.md"]),
	mimeTypes: {".svg":"image/svg+xml",".json":"application/json",".md":"text/markdown"},
	_: {
		client: {"start":"_app/immutable/entry/start.HcgxVK83.js","app":"_app/immutable/entry/app.DHZu6C6s.js","imports":["_app/immutable/entry/start.HcgxVK83.js","_app/immutable/chunks/entry.CrUfosu1.js","_app/immutable/chunks/scheduler.DKaqMhG1.js","_app/immutable/chunks/index.CvdjGRI4.js","_app/immutable/entry/app.DHZu6C6s.js","_app/immutable/chunks/preload-helper.BQ24v_F8.js","_app/immutable/chunks/scheduler.DKaqMhG1.js","_app/immutable/chunks/index.DlqHU1Qv.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export const prerendered = new Set([]);

export const base_path = "";
