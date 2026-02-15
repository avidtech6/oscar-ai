import { c as create_ssr_component, a as subscribe } from "../../../chunks/ssr.js";
import { p as page } from "../../../chunks/stores.js";
import "../../../chunks/index2.js";
import { g as groqApiKey } from "../../../chunks/settings.js";
import "marked";
import "dompurify";
import "mermaid";
/* empty css                                                             */
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  groqApiKey.subscribe((value) => {
  });
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-kzn4ky_START -->${$$result.title = `<title>Blog Writer - Oscar AI</title>`, ""}<!-- HEAD_svelte-kzn4ky_END -->`, ""} <div class="max-w-6xl mx-auto"><div class="mb-8" data-svelte-h="svelte-a0vly2"><h1 class="text-2xl font-bold text-gray-900 mb-2">Blog Writer</h1> <p class="text-gray-600">Generate engaging blog posts from your tree survey data.</p></div> ${``} ${``} ${`<div class="text-center py-12" data-svelte-h="svelte-1xrscwp"><p class="text-gray-500">Loading...</p></div>`}</div>`;
});
export {
  Page as default
};
