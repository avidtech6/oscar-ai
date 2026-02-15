import { c as create_ssr_component, b as add_attribute, f as createEventDispatcher, o as onDestroy, e as escape, d as each, v as validate_component } from "../../../chunks/ssr.js";
import { g as groqApiKey } from "../../../chunks/settings.js";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "mermaid";
/* empty css                                                             */
import "../../../chunks/client.js";
import "../../../chunks/index2.js";
const css = {
  code: ".markdown-content.svelte-a1o7qw{line-height:1.6}.markdown-content.svelte-a1o7qw h1{font-size:1.75rem;font-weight:700;margin-top:1rem;margin-bottom:0.5rem;color:#1f2937}.markdown-content.svelte-a1o7qw h2{font-size:1.5rem;font-weight:600;margin-top:1rem;margin-bottom:0.5rem;color:#374151}.markdown-content.svelte-a1o7qw h3{font-size:1.25rem;font-weight:600;margin-top:0.75rem;margin-bottom:0.5rem;color:#4b5563}.markdown-content.svelte-a1o7qw h4,.markdown-content.svelte-a1o7qw h5,.markdown-content.svelte-a1o7qw h6{font-size:1rem;font-weight:600;margin-top:0.5rem;margin-bottom:0.5rem;color:#6b7280}.markdown-content.svelte-a1o7qw p{margin-bottom:0.75rem}.markdown-content.svelte-a1o7qw ul,.markdown-content.svelte-a1o7qw ol{margin-left:1.5rem;margin-bottom:0.75rem}.markdown-content.svelte-a1o7qw li{margin-bottom:0.25rem}.markdown-content.svelte-a1o7qw blockquote{border-left:4px solid #2f5233;padding-left:1rem;margin:1rem 0;color:#6b7280;font-style:italic;background:#f9fafb;padding:0.75rem;border-radius:0 0.5rem 0.5rem 0}.markdown-content.svelte-a1o7qw code{background:#f3f4f6;padding:0.125rem 0.375rem;border-radius:0.25rem;font-family:'Monaco', 'Menlo', monospace;font-size:0.875rem}.markdown-content.svelte-a1o7qw pre{background:#1f2937;color:#f9fafb;padding:1rem;border-radius:0.5rem;overflow-x:auto;margin:1rem 0}.markdown-content.svelte-a1o7qw pre code{background:transparent;padding:0;color:inherit}.markdown-content.svelte-a1o7qw table{width:100%;border-collapse:collapse;margin:1rem 0}.markdown-content.svelte-a1o7qw th,.markdown-content.svelte-a1o7qw td{border:1px solid #e5e7eb;padding:0.5rem;text-align:left}.markdown-content.svelte-a1o7qw th{background:#f9fafb;font-weight:600}.markdown-content.svelte-a1o7qw tr:nth-child(even){background:#f9fafb}.markdown-content.svelte-a1o7qw a{color:#2f5233;text-decoration:underline}.markdown-content.svelte-a1o7qw a:hover{color:#234026}.markdown-content.svelte-a1o7qw img{max-width:100%;height:auto;border-radius:0.5rem;margin:1rem 0}.markdown-content.svelte-a1o7qw .mermaid{background:white;padding:1rem;border-radius:0.5rem;margin:1rem 0;text-align:center}.markdown-content.svelte-a1o7qw .mermaid-rendered{background:transparent;padding:0}.markdown-content.svelte-a1o7qw hr{border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0}.markdown-content.svelte-a1o7qw strong{font-weight:600;color:#1f2937}.markdown-content.svelte-a1o7qw em{font-style:italic}",
  map: '{"version":3,"file":"MarkdownRenderer.svelte","sources":["MarkdownRenderer.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { onMount, afterUpdate } from \\"svelte\\";\\nimport { marked } from \\"marked\\";\\nimport DOMPurify from \\"dompurify\\";\\nimport mermaid from \\"mermaid\\";\\nexport let content = \\"\\";\\nlet container;\\nlet renderedHtml = \\"\\";\\nonMount(() => {\\n  mermaid.initialize({\\n    startOnLoad: false,\\n    theme: \\"default\\",\\n    securityLevel: \\"strict\\",\\n    fontFamily: \\"sans-serif\\"\\n  });\\n});\\nasync function renderContent() {\\n  if (!content) {\\n    renderedHtml = \\"\\";\\n    return;\\n  }\\n  const rawHtml = await marked.parse(content);\\n  renderedHtml = DOMPurify.sanitize(rawHtml, {\\n    ADD_TAGS: [\\"iframe\\"],\\n    ADD_ATTR: [\\"target\\", \\"rel\\"]\\n  });\\n  await new Promise((resolve) => setTimeout(resolve, 100));\\n  renderMermaidDiagrams();\\n}\\nasync function renderMermaidDiagrams() {\\n  if (!container)\\n    return;\\n  const mermaidBlocks = container.querySelectorAll(\\".mermaid\\");\\n  for (let i = 0; i < mermaidBlocks.length; i++) {\\n    const block = mermaidBlocks[i];\\n    const code = block.getAttribute(\\"data-code\\") || block.textContent || \\"\\";\\n    if (code.trim()) {\\n      try {\\n        const id = `mermaid-${Date.now()}-${i}`;\\n        const { svg } = await mermaid.render(id, code);\\n        block.innerHTML = svg;\\n        block.classList.add(\\"mermaid-rendered\\");\\n      } catch (error) {\\n        console.error(\\"Mermaid render error:\\", error);\\n        block.innerHTML = `<pre class=\\"text-red-500 text-sm\\">${code}</pre>`;\\n      }\\n    }\\n  }\\n}\\n$:\\n  if (content !== void 0) {\\n    renderContent();\\n  }\\nafterUpdate(() => {\\n  renderMermaidDiagrams();\\n});\\n<\/script>\\n\\n<div class=\\"markdown-content\\" bind:this={container}>\\n\\t{@html renderedHtml}\\n</div>\\n\\n<style>\\n\\t.markdown-content {\\n\\t\\tline-height: 1.6;\\n\\t}\\n\\t\\n\\t.markdown-content :global(h1) {\\n\\t\\tfont-size: 1.75rem;\\n\\t\\tfont-weight: 700;\\n\\t\\tmargin-top: 1rem;\\n\\t\\tmargin-bottom: 0.5rem;\\n\\t\\tcolor: #1f2937;\\n\\t}\\n\\t\\n\\t.markdown-content :global(h2) {\\n\\t\\tfont-size: 1.5rem;\\n\\t\\tfont-weight: 600;\\n\\t\\tmargin-top: 1rem;\\n\\t\\tmargin-bottom: 0.5rem;\\n\\t\\tcolor: #374151;\\n\\t}\\n\\t\\n\\t.markdown-content :global(h3) {\\n\\t\\tfont-size: 1.25rem;\\n\\t\\tfont-weight: 600;\\n\\t\\tmargin-top: 0.75rem;\\n\\t\\tmargin-bottom: 0.5rem;\\n\\t\\tcolor: #4b5563;\\n\\t}\\n\\t\\n\\t.markdown-content :global(h4),\\n\\t.markdown-content :global(h5),\\n\\t.markdown-content :global(h6) {\\n\\t\\tfont-size: 1rem;\\n\\t\\tfont-weight: 600;\\n\\t\\tmargin-top: 0.5rem;\\n\\t\\tmargin-bottom: 0.5rem;\\n\\t\\tcolor: #6b7280;\\n\\t}\\n\\t\\n\\t.markdown-content :global(p) {\\n\\t\\tmargin-bottom: 0.75rem;\\n\\t}\\n\\t\\n\\t.markdown-content :global(ul),\\n\\t.markdown-content :global(ol) {\\n\\t\\tmargin-left: 1.5rem;\\n\\t\\tmargin-bottom: 0.75rem;\\n\\t}\\n\\t\\n\\t.markdown-content :global(li) {\\n\\t\\tmargin-bottom: 0.25rem;\\n\\t}\\n\\t\\n\\t.markdown-content :global(blockquote) {\\n\\t\\tborder-left: 4px solid #2f5233;\\n\\t\\tpadding-left: 1rem;\\n\\t\\tmargin: 1rem 0;\\n\\t\\tcolor: #6b7280;\\n\\t\\tfont-style: italic;\\n\\t\\tbackground: #f9fafb;\\n\\t\\tpadding: 0.75rem;\\n\\t\\tborder-radius: 0 0.5rem 0.5rem 0;\\n\\t}\\n\\t\\n\\t.markdown-content :global(code) {\\n\\t\\tbackground: #f3f4f6;\\n\\t\\tpadding: 0.125rem 0.375rem;\\n\\t\\tborder-radius: 0.25rem;\\n\\t\\tfont-family: \'Monaco\', \'Menlo\', monospace;\\n\\t\\tfont-size: 0.875rem;\\n\\t}\\n\\t\\n\\t.markdown-content :global(pre) {\\n\\t\\tbackground: #1f2937;\\n\\t\\tcolor: #f9fafb;\\n\\t\\tpadding: 1rem;\\n\\t\\tborder-radius: 0.5rem;\\n\\t\\toverflow-x: auto;\\n\\t\\tmargin: 1rem 0;\\n\\t}\\n\\t\\n\\t.markdown-content :global(pre code) {\\n\\t\\tbackground: transparent;\\n\\t\\tpadding: 0;\\n\\t\\tcolor: inherit;\\n\\t}\\n\\t\\n\\t.markdown-content :global(table) {\\n\\t\\twidth: 100%;\\n\\t\\tborder-collapse: collapse;\\n\\t\\tmargin: 1rem 0;\\n\\t}\\n\\t\\n\\t.markdown-content :global(th),\\n\\t.markdown-content :global(td) {\\n\\t\\tborder: 1px solid #e5e7eb;\\n\\t\\tpadding: 0.5rem;\\n\\t\\ttext-align: left;\\n\\t}\\n\\t\\n\\t.markdown-content :global(th) {\\n\\t\\tbackground: #f9fafb;\\n\\t\\tfont-weight: 600;\\n\\t}\\n\\t\\n\\t.markdown-content :global(tr:nth-child(even)) {\\n\\t\\tbackground: #f9fafb;\\n\\t}\\n\\t\\n\\t.markdown-content :global(a) {\\n\\t\\tcolor: #2f5233;\\n\\t\\ttext-decoration: underline;\\n\\t}\\n\\t\\n\\t.markdown-content :global(a:hover) {\\n\\t\\tcolor: #234026;\\n\\t}\\n\\t\\n\\t.markdown-content :global(img) {\\n\\t\\tmax-width: 100%;\\n\\t\\theight: auto;\\n\\t\\tborder-radius: 0.5rem;\\n\\t\\tmargin: 1rem 0;\\n\\t}\\n\\t\\n\\t.markdown-content :global(.mermaid) {\\n\\t\\tbackground: white;\\n\\t\\tpadding: 1rem;\\n\\t\\tborder-radius: 0.5rem;\\n\\t\\tmargin: 1rem 0;\\n\\t\\ttext-align: center;\\n\\t}\\n\\t\\n\\t.markdown-content :global(.mermaid-rendered) {\\n\\t\\tbackground: transparent;\\n\\t\\tpadding: 0;\\n\\t}\\n\\t\\n\\t.markdown-content :global(hr) {\\n\\t\\tborder: none;\\n\\t\\tborder-top: 1px solid #e5e7eb;\\n\\t\\tmargin: 1.5rem 0;\\n\\t}\\n\\t\\n\\t.markdown-content :global(strong) {\\n\\t\\tfont-weight: 600;\\n\\t\\tcolor: #1f2937;\\n\\t}\\n\\t\\n\\t.markdown-content :global(em) {\\n\\t\\tfont-style: italic;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"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"}'
};
const MarkdownRenderer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { content = "" } = $$props;
  let container;
  let renderedHtml = "";
  async function renderContent() {
    if (!content) {
      renderedHtml = "";
      return;
    }
    const rawHtml = await marked.parse(content);
    renderedHtml = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["target", "rel"]
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    renderMermaidDiagrams();
  }
  async function renderMermaidDiagrams() {
    return;
  }
  if ($$props.content === void 0 && $$bindings.content && content !== void 0)
    $$bindings.content(content);
  $$result.css.add(css);
  {
    if (content !== void 0) {
      renderContent();
    }
  }
  return `<div class="markdown-content svelte-a1o7qw"${add_attribute("this", container, 0)}><!-- HTML_TAG_START -->${renderedHtml}<!-- HTML_TAG_END --> </div>`;
});
const MicButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognitionAPI;
  onDestroy(() => {
  });
  return `<button type="button" ${!isSpeechSupported ? "disabled" : ""} class="${"p-2 rounded-lg transition-colors flex-shrink-0 " + escape(
    "text-gray-500 hover:text-green-700 hover:bg-gray-100",
    true
  )}"${add_attribute(
    "title",
    isSpeechSupported ? "Voice input" : "Voice input not supported",
    0
  )}>${`${`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>`}`}</button> ${``} ${``}`;
});
function getTypeIcon(type) {
  switch (type) {
    case "task":
      return "📋";
    case "tasks":
      return "📋";
    case "note":
      return "📝";
    case "notes":
      return "📝";
    case "project":
      return "📁";
    case "projects":
      return "📁";
    case "tree":
      return "🌳";
    case "trees":
      return "🌳";
    case "report":
      return "📄";
    case "reports":
      return "📄";
    case "blog":
      return "📰";
    case "blogs":
      return "📰";
    case "diagram":
      return "📊";
    case "diagrams":
      return "📊";
    default:
      return "📋";
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  groqApiKey.subscribe((value) => {
  });
  let messages = [];
  let inputMessage = "";
  const faqs = [
    {
      question: "Root Protection Area calculation",
      answer: "Single-stem: RPA radius = DBH (mm) × 12. Multi-stemmed: stem diameter at 1.5m × 6."
    },
    {
      question: "BS5837 tree categories",
      answer: "A: High quality (conservation, appearance, riparian). B: Moderate quality. C: Low quality (10+ years life). U: Unsuitable for retention."
    },
    {
      question: "Tree Constraints Plan",
      answer: "Shows all trees, canopy spreads, RPAs, and constraints. Based on topographical survey, drawn to scale."
    },
    {
      question: "Preliminary Arboricultural Assessment",
      answer: "Desk-based study identifying trees, preliminary categories, and potential development constraints. First step before full BS5837 survey."
    }
  ];
  return `${$$result.head += `<!-- HEAD_svelte-1kk1g6u_START -->${$$result.title = `<title>Oscar AI Assistant</title>`, ""}<!-- HEAD_svelte-1kk1g6u_END -->`, ""} <div class="max-w-4xl mx-auto h-full flex flex-col"> <div class="bg-white border-b border-gray-200 px-6 py-4"><div class="flex items-center justify-between"><div data-svelte-h="svelte-1g7ujao"><h1 class="text-xl font-bold text-gray-900">Oscar AI</h1> <p class="text-sm text-gray-600">Tree Consultant Assistant</p></div> <div class="flex gap-2"><button class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5" title="Refresh chat" data-svelte-h="svelte-dmb555"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
					Refresh</button> <button class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5" title="Save transcript and refresh" data-svelte-h="svelte-1n27d1j"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
					Save &amp; Refresh</button></div></div> ${``}</div> ${` <div class="flex-1 overflow-y-auto p-6 space-y-4">${`${messages.length === 0 ? `<div class="bg-gray-50 rounded-lg p-6 mb-4"><h2 class="text-sm font-semibold text-gray-700 mb-4" data-svelte-h="svelte-qnfqrr">Quick Reference</h2> <div class="grid gap-2">${each(faqs, (faq) => {
    return `<button class="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors"><span class="text-gray-800 font-medium text-sm">${escape(faq.question)}</span> </button>`;
  })}</div></div>` : ``}`} ${each(messages, (message) => {
    return `<div class="${"flex " + escape(
      message.role === "user" ? "justify-end" : "justify-start",
      true
    )}"><div class="${"max-w-3xl " + escape(
      message.role === "user" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-900",
      true
    ) + " rounded-lg p-4"}"><div class="flex items-start gap-3"><span class="text-xl">${escape(message.role === "user" ? "👤" : "🌳")}</span> <div class="flex-1 min-w-0">${message.role === "oscar" ? `${validate_component(MarkdownRenderer, "MarkdownRenderer").$$render($$result, { content: message.content }, {}, {})}` : `<p class="whitespace-pre-wrap">${escape(message.content)}</p>`}  ${message.actionResult?.success && message.actionResult.intentType !== "query" ? `<div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"><p class="text-green-800 font-medium text-sm">✓ ${escape(message.actionResult.message)}</p> ${message.actionUrl ? `<button class="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm" data-svelte-h="svelte-7nr1jt"><span>Open</span> <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg> </button>` : ``} </div>` : ``}  ${message.actionResult && !message.actionResult.success ? `<div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p class="text-red-800 text-sm">✗ ${escape(message.actionResult.message)}</p> </div>` : ``}  ${message.objects && message.objects.length > 0 ? `<div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"><p class="text-blue-800 font-medium mb-2 text-sm">${escape(getTypeIcon(message.actionResult?.data?.objectType))} ${escape(message.actionResult?.message)}</p> <div class="space-y-2 max-h-60 overflow-y-auto">${each(message.objects, (obj) => {
      return `<button class="w-full text-left p-2 bg-white rounded border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-colors"><p class="font-medium text-gray-900 text-sm">${escape(obj.title || obj.name || "Untitled")}</p> ${obj.content || obj.description ? `<p class="text-xs text-gray-500 truncate">${escape(obj.content?.substring(0, 80) || obj.description?.substring(0, 80) || "")} </p>` : ``} ${obj.status ? `<span class="${"text-xs px-2 py-0.5 rounded-full " + escape(
        obj.status === "done" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800",
        true
      )}">${escape(obj.status)} </span>` : ``} </button>`;
    })}</div> </div>` : ``}  ${message.actionResult?.intentType === "query" && message.actionResult.success && (!message.objects || message.objects.length === 0) ? `<div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg" data-svelte-h="svelte-11g9gl6"><p class="text-gray-600 text-sm">No items found.</p> </div>` : ``} <p class="${"text-xs " + escape(
      message.role === "user" ? "text-green-200" : "text-gray-400",
      true
    ) + " mt-2"}">${escape(new Date(message.timestamp).toLocaleTimeString())} </p></div> </div></div> </div>`;
  })} ${``}</div>  <div class="bg-white border-t border-gray-200 p-4">${``} <div class="flex gap-2"><textarea placeholder="Ask to create tasks, notes, or ask questions..." rows="2" class="input flex-1 resize-none" ${""}>${escape("")}</textarea> ${validate_component(MicButton, "MicButton").$$render($$result, {}, {}, {})} <button ${!inputMessage.trim() ? "disabled" : ""} class="btn btn-primary px-6">${escape("Send")}</button></div> <p class="text-xs text-gray-500 mt-2" data-svelte-h="svelte-1hhojsz">Try: &quot;remember to check the oak tree&quot;, &quot;show me my tasks&quot;, &quot;make a note about the site visit&quot;</p></div>`}</div>`;
});
export {
  Page as default
};
