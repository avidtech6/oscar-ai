import { c as create_ssr_component, a as subscribe } from "../../../chunks/ssr.js";
import { p as page } from "../../../chunks/stores.js";
import "../../../chunks/index2.js";
import { g as groqApiKey } from "../../../chunks/settings.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  groqApiKey.subscribe((value) => {
  });
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-n16fy2_START -->${$$result.title = `<title>Reports - Oscar AI</title>`, ""}<!-- HEAD_svelte-n16fy2_END -->`, ""} <div class="max-w-4xl mx-auto"><h1 class="text-2xl font-bold text-gray-900 mb-6" data-svelte-h="svelte-p7pi6b">Generate Reports</h1> ${``} ${`<div class="text-center py-12" data-svelte-h="svelte-1xrscwp"><p class="text-gray-500">Loading...</p></div>`}</div>`;
});
export {
  Page as default
};
