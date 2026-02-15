import { c as create_ssr_component, e as escape } from "../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let tasks = [];
  tasks.filter((t) => t.status === "pending");
  tasks.filter((t) => t.status === "in_progress");
  tasks.filter((t) => t.status === "completed");
  return `${$$result.head += `<!-- HEAD_svelte-mpr8tt_START -->${$$result.title = `<title>Tasks - Oscar AI</title>`, ""}<!-- HEAD_svelte-mpr8tt_END -->`, ""} <div class="max-w-6xl mx-auto p-6"><div class="mb-8"><div class="flex items-center justify-between"><div data-svelte-h="svelte-ux0kao"><h1 class="text-2xl font-bold text-gray-900 mb-2">Tasks</h1> <p class="text-gray-600">Manage your tree survey tasks and to-dos</p></div> <button class="btn btn-primary">${escape("+ Add Task")}</button></div></div> ${``} ${`<p class="text-gray-500" data-svelte-h="svelte-1hnm5fw">Loading tasks...</p>`}</div>`;
});
export {
  Page as default
};
