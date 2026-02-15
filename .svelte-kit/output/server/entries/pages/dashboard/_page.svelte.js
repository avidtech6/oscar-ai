import { c as create_ssr_component, b as add_attribute, e as escape } from "../../../chunks/ssr.js";
import "../../../chunks/client.js";
import "../../../chunks/index2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let newProjectName = "";
  return `${$$result.head += `<!-- HEAD_svelte-1ousrmf_START -->${$$result.title = `<title>Dashboard - Oscar AI</title>`, ""}<!-- HEAD_svelte-1ousrmf_END -->`, ""} <div class="max-w-6xl mx-auto"> <div class="mb-8" data-svelte-h="svelte-1r2475j"><h1 class="text-2xl font-bold text-gray-900 mb-2">Your Projects</h1> <p class="text-gray-600">Manage your arboricultural surveys and reports</p></div>  <div class="card p-6 mb-8"><h2 class="text-lg font-semibold mb-4" data-svelte-h="svelte-vhkw6k">Create New Project</h2> <form class="flex gap-3"><input type="text" placeholder="Project name (e.g., Oakwood Development)" class="input flex-1"${add_attribute("value", newProjectName, 0)}> <button type="submit" ${!newProjectName.trim() ? "disabled" : ""} class="btn btn-primary">${escape("Create Project")}</button></form> ${``}</div>  <div class="card"><div class="p-4 border-b border-gray-200" data-svelte-h="svelte-1uay8iw"><h2 class="text-lg font-semibold">Existing Projects</h2></div> ${`<div class="p-8 text-center text-gray-500" data-svelte-h="svelte-nt24bw"><p>Loading projects...</p></div>`}</div></div>`;
});
export {
  Page as default
};
