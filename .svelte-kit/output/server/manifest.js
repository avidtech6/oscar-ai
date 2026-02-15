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
		client: {"start":"_app/immutable/entry/start.UCKuBsUK.js","app":"_app/immutable/entry/app.Dtfkenxt.js","imports":["_app/immutable/entry/start.UCKuBsUK.js","_app/immutable/chunks/entry.Be3j---l.js","_app/immutable/chunks/scheduler.DKaqMhG1.js","_app/immutable/chunks/index.CvdjGRI4.js","_app/immutable/entry/app.Dtfkenxt.js","_app/immutable/chunks/preload-helper.BQ24v_F8.js","_app/immutable/chunks/scheduler.DKaqMhG1.js","_app/immutable/chunks/index.DlqHU1Qv.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
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
