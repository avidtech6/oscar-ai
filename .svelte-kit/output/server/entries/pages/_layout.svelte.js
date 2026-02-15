import { c as create_ssr_component, a as subscribe, e as escape, b as add_attribute, d as each } from "../../chunks/ssr.js";
import { p as page } from "../../chunks/stores.js";
import { d as derived, w as writable } from "../../chunks/index.js";
import "../../chunks/index2.js";
import "../../chunks/settings.js";
const user = writable(null);
const notebookEntries = writable([]);
const sidebarOpen = writable(true);
derived(user, ($user) => $user !== null);
derived(
  notebookEntries,
  ($entries) => [...$entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
);
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $sidebarOpen, $$unsubscribe_sidebarOpen;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_sidebarOpen = subscribe(sidebarOpen, (value) => $sidebarOpen = value);
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "home",
      href: "/dashboard"
    },
    {
      id: "workspace",
      label: "Projects",
      icon: "folder",
      href: "/workspace"
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: "tasks",
      href: "/tasks"
    },
    {
      id: "notes",
      label: "Notes",
      icon: "notes",
      href: "/notes"
    },
    {
      id: "oscar",
      label: "Oscar AI",
      icon: "chat",
      href: "/oscar"
    },
    {
      id: "reports",
      label: "Reports",
      icon: "document",
      href: "/reports"
    },
    {
      id: "learn",
      label: "Learn My Style",
      icon: "learn",
      href: "/learn"
    },
    {
      id: "blog",
      label: "Blog Writer",
      icon: "blog",
      href: "/blog"
    },
    {
      id: "help",
      label: "Help",
      icon: "help",
      href: "/help"
    },
    {
      id: "settings",
      label: "Settings",
      icon: "cog",
      href: "/settings"
    }
  ];
  function isActive(href) {
    return $page.url.pathname.startsWith(href);
  }
  const icons = {
    home: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`,
    cog: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`,
    folder: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>`,
    tasks: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`,
    notes: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
    chat: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>`,
    document: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
    blog: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`,
    learn: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`,
    help: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    plus: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>`,
    menu: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`,
    close: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
    chevron: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>`
  };
  $$unsubscribe_page();
  $$unsubscribe_sidebarOpen();
  return ` ${$sidebarOpen ? `<div class="fixed inset-0 bg-black/50 z-40 lg:hidden" role="button" tabindex="0" aria-label="Close menu"></div>` : ``} <div class="h-screen flex bg-gray-50 overflow-hidden"> <aside class="${"fixed lg:relative z-50 lg:z-auto w-64 h-full bg-forest-800 text-white flex flex-col transform transition-transform duration-300 ease-in-out " + escape(
    $sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20",
    true
  )}"> <div class="p-4 border-b border-forest-700 flex items-center justify-between flex-shrink-0">${$sidebarOpen ? `<div class="flex items-center gap-2"><span class="text-2xl" data-svelte-h="svelte-1cwd2ei">🌳</span> ${$sidebarOpen ? `<div class="transition-opacity duration-200" data-svelte-h="svelte-y7vzf3"><h1 class="text-lg font-bold">Oscar AI</h1> <p class="text-xs text-forest-200">Arboricultural</p></div>` : ``}</div>` : `<span class="text-2xl mx-auto" data-svelte-h="svelte-pt5uaz">🌳</span>`}  <button class="hidden lg:flex p-1 text-forest-200 hover:text-white transition-colors"${add_attribute("aria-label", $sidebarOpen ? "Collapse sidebar" : "Expand sidebar", 0)}><!-- HTML_TAG_START -->${icons.chevron}<!-- HTML_TAG_END --></button></div>  <nav class="flex-1 p-2 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">${each(navItems, (item) => {
    return `<a${add_attribute("href", item.href, 0)} class="${"flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-colors " + escape(
      isActive(item.href) ? "bg-forest-700 text-white" : "text-forest-100 hover:bg-forest-700/50",
      true
    ) + " " + escape($sidebarOpen ? "lg:justify-start" : "lg:justify-center", true)}"${add_attribute("title", $sidebarOpen ? "" : item.label, 0)}><span class="flex-shrink-0 w-5 h-5"><!-- HTML_TAG_START -->${icons[item.icon]}<!-- HTML_TAG_END --></span> ${$sidebarOpen ? `<span class="transition-opacity duration-200">${escape(item.label)}</span>` : ``} </a>`;
  })}  ${$sidebarOpen ? `<div class="pt-4 mt-4 border-t border-forest-700"><div class="flex items-center justify-between px-3 mb-2"><span class="text-xs font-semibold text-forest-300 uppercase tracking-wider" data-svelte-h="svelte-1g08clj">Projects</span> <a href="/workspace/new" class="p-1 text-forest-200 hover:text-white hover:bg-forest-700 rounded transition-colors" title="New Project"><!-- HTML_TAG_START -->${icons.plus}<!-- HTML_TAG_END --></a></div> ${`<div class="px-3 py-2 text-sm text-forest-200" data-svelte-h="svelte-1xtz8wd">Loading...</div>`}</div>` : ` <a href="/workspace" class="${"flex items-center justify-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-colors " + escape(
    isActive("/workspace") ? "bg-forest-700 text-white" : "text-forest-100 hover:bg-forest-700/50",
    true
  )}" title="Projects"><span class="flex-shrink-0 w-5 h-5"><!-- HTML_TAG_START -->${icons.folder}<!-- HTML_TAG_END --></span></a>`}</nav></aside>  <main class="flex-1 flex flex-col overflow-hidden min-w-0"> <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 lg:hidden"> <button class="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Toggle menu">${$sidebarOpen ? `<!-- HTML_TAG_START -->${icons.close}<!-- HTML_TAG_END -->` : `<!-- HTML_TAG_START -->${icons.menu}<!-- HTML_TAG_END -->`}</button> <h1 class="text-lg font-semibold text-forest-800" data-svelte-h="svelte-dla8h5">Oscar AI</h1>  <div class="w-10"></div></header>  ${!$sidebarOpen ? `<header class="hidden lg:flex bg-white border-b border-gray-200 px-4 py-3 items-center justify-between flex-shrink-0"><button class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Expand sidebar"><!-- HTML_TAG_START -->${icons.menu}<!-- HTML_TAG_END --></button> <span class="text-sm text-gray-500" data-svelte-h="svelte-1d2abyq">Oscar AI</span> <div class="w-10"></div></header>` : ``}  <div class="flex-1 overflow-auto">${slots.default ? slots.default({}) : ``}</div></main></div>`;
});
export {
  Layout as default
};
