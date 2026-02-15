import { c as create_ssr_component } from "../../chunks/ssr.js";
import "../../chunks/client.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-16s1h9b_START -->${$$result.title = `<title>Oscar AI - Loading...</title>`, ""}<!-- HEAD_svelte-16s1h9b_END -->`, ""} <div class="min-h-screen bg-gradient-to-br from-forest-800 via-forest-700 to-oak-600 flex items-center justify-center p-4" data-svelte-h="svelte-ojx8q8"><div class="text-center text-white"><div class="text-6xl mb-6">🌳</div> <h1 class="text-4xl font-bold mb-4">Oscar AI</h1> <p class="text-forest-200 text-lg">Loading...</p></div></div>`;
});
export {
  Page as default
};
