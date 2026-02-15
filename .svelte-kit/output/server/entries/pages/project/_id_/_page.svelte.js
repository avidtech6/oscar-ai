import { c as create_ssr_component, a as subscribe, e as escape } from "../../../../chunks/ssr.js";
import "../../../../chunks/client.js";
import { p as page } from "../../../../chunks/stores.js";
import "../../../../chunks/index2.js";
import "../../../../chunks/settings.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-1gbzigf_START -->${$$result.title = `<title>${escape("Project")} - Oscar AI</title>`, ""}<!-- HEAD_svelte-1gbzigf_END -->`, ""} <div class="max-w-6xl mx-auto"> <div class="mb-6 flex items-center justify-between"><div><a href="/workspace" class="text-sm text-forest-600 hover:underline mb-1 inline-block" data-svelte-h="svelte-s78gz6">← Back to Workspace</a> <h1 class="text-2xl font-bold text-gray-900">${escape("Loading...")}</h1> ${``}</div> <button ${""} class="btn btn-primary">${escape("Save")}</button></div> ${``} ${`<div class="text-center py-12" data-svelte-h="svelte-18pbsxe"><p class="text-gray-500">Loading project...</p></div>`}</div>`;
});
export {
  Page as default
};
