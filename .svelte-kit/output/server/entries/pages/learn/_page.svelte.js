import { c as create_ssr_component, b as add_attribute, e as escape } from "../../../chunks/ssr.js";
import "../../../chunks/settings.js";
import * as pdfjsLib from "pdfjs-dist";
import "jszip";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let newProfile = {
    name: "",
    samples: ""
  };
  return `${$$result.head += `<!-- HEAD_svelte-vz3i4w_START -->${$$result.title = `<title>Learn My Style - Oscar AI</title>`, ""}<!-- HEAD_svelte-vz3i4w_END -->`, ""} <div class="max-w-6xl mx-auto p-6"><div class="mb-8" data-svelte-h="svelte-1lgfz2z"><h1 class="text-2xl font-bold text-gray-900 mb-2">Learn My Style</h1> <p class="text-gray-600">Train Oscar AI to write in your unique style based on your previous reports and documents.</p></div> ${``} ${``} <div class="grid grid-cols-1 lg:grid-cols-2 gap-6"> <div class="card p-6"><h2 class="text-lg font-semibold mb-4" data-svelte-h="svelte-firrqb">Create New Style Profile</h2> <div class="space-y-4"><div><label for="profileName" class="block text-sm font-medium text-gray-700 mb-1" data-svelte-h="svelte-1uw91pj">Profile Name</label> <input id="profileName" type="text" placeholder="e.g., My BS5837 Reports" class="input w-full"${add_attribute("value", newProfile.name, 0)}></div> <div><label for="samples" class="block text-sm font-medium text-gray-700 mb-1" data-svelte-h="svelte-1a28a4d">Writing Samples</label> <textarea id="samples" placeholder="Paste examples of your previous reports..." rows="8" class="input w-full">${escape("")}</textarea></div> <div class="border-2 border-dashed border-gray-300 rounded-lg p-4"><label for="fileUpload" class="block text-sm font-medium text-gray-700 mb-2" data-svelte-h="svelte-16fg1fc">Or Import from Document</label> <input id="fileUpload" type="file" accept=".pdf,.docx" ${""} class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-forest-50 file:text-forest-700 hover:file:bg-forest-100 disabled:opacity-50"> <p class="text-xs text-gray-500 mt-1" data-svelte-h="svelte-6tc3j3">Upload PDF or Word (.docx) documents</p> ${``} ${``}</div> ${``} <button ${!newProfile.name.trim() || !newProfile.samples.trim() ? "disabled" : ""} class="btn btn-primary w-full">${escape("Analyze Style with AI")}</button></div> ${``}</div>  <div class="card p-6"><h2 class="text-lg font-semibold mb-4" data-svelte-h="svelte-nspjq9">Saved Style Profiles</h2> ${`<p class="text-gray-500" data-svelte-h="svelte-nmylls">Loading profiles...</p>`}</div></div> ${``}</div>`;
});
export {
  Page as default
};
