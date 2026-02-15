import { c as create_ssr_component, b as add_attribute, e as escape } from "../../../chunks/ssr.js";
import "../../../chunks/client.js";
import "../../../chunks/pocketbase.js";
import "../../../chunks/index2.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let email = "";
  let password = "";
  return `${$$result.head += `<!-- HEAD_svelte-zgpeyc_START -->${$$result.title = `<title>Login - Oscar AI</title>`, ""}<!-- HEAD_svelte-zgpeyc_END -->`, ""} <div class="min-h-screen bg-gradient-to-br from-forest-800 via-forest-700 to-oak-600 flex items-center justify-center p-4"><div class="max-w-md w-full"> <div class="text-center text-white mb-8" data-svelte-h="svelte-15cb7y2"><div class="text-6xl mb-4">🌳</div> <h1 class="text-3xl font-bold">Oscar AI</h1> <p class="text-forest-200">Arboricultural Notebook + Assistant</p></div>  <div class="bg-white rounded-xl p-6 shadow-xl"><h2 class="text-xl font-bold text-gray-900 mb-6" data-svelte-h="svelte-j2npbf">Sign In</h2> ${``} <form class="space-y-4"><div><label for="email" class="block text-sm font-medium text-gray-700 mb-1" data-svelte-h="svelte-iilyph">Email</label> <input id="email" type="email" placeholder="you@example.com" class="input w-full" required${add_attribute("value", email, 0)}></div> <div><label for="password" class="block text-sm font-medium text-gray-700 mb-1" data-svelte-h="svelte-b550d9">Password</label> <input id="password" type="password" placeholder="••••••••" class="input w-full" required${add_attribute("value", password, 0)}></div> <button type="submit" ${""} class="btn btn-primary w-full">${escape("Sign In")}</button></form> <div class="mt-6 text-center" data-svelte-h="svelte-47glci"><p class="text-sm text-gray-600">Don&#39;t have an account?
					<a href="/signup" class="text-forest-600 hover:underline font-medium">Sign up</a></p></div> <div class="mt-4 text-center" data-svelte-h="svelte-8380x4"><p class="text-xs text-gray-500">Or continue with
					<a href="/dashboard" class="text-forest-600 hover:underline">local storage</a></p></div></div></div></div>`;
});
export {
  Page as default
};
