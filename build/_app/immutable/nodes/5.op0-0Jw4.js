import{s as pe,n as se,d as _,q as re,i as V,b as c,u as he,l as v,m as _e,g as P,c as k,e as C,o as q,j as A,h as I,a as O,f as S,t as T,v as fe,y as le}from"../chunks/scheduler.DKaqMhG1.js";import{e as M,u as me,d as ge}from"../chunks/each.C2d3_RSt.js";import{S as ve,i as ye}from"../chunks/index.DlqHU1Qv.js";function ae(u,e,t){const r=u.slice();return r[12]=e[t],r}function oe(u,e,t){const r=u.slice();return r[9]=e[t],r}function ne(u,e,t){const r=u.slice();return r[15]=e[t],r}function ie(u){let e,t,r=u[3].length+"",n,l;return{c(){e=I("p"),t=T("Found "),n=T(r),l=T(" results"),this.h()},l(o){e=k(o,"P",{class:!0});var s=C(e);t=S(s,"Found "),n=S(s,r),l=S(s," results"),s.forEach(_),this.h()},h(){v(e,"class","text-sm text-gray-500 mb-4")},m(o,s){V(o,e,s),c(e,t),c(e,n),c(e,l)},p(o,s){s&8&&r!==(r=o[3].length+"")&&O(n,r)},d(o){o&&_(e)}}}function ce(u,e){let t,r,n=e[15].title+"",l,o,s,h=e[15].category+"",y,p,d,i,a;function m(){return e[7](e[15])}return{key:u,first:null,c(){t=I("button"),r=I("div"),l=T(n),o=A(),s=I("div"),y=T(h),p=A(),this.h()},l(g){t=k(g,"BUTTON",{class:!0});var f=C(t);r=k(f,"DIV",{class:!0});var w=C(r);l=S(w,n),w.forEach(_),o=P(f),s=k(f,"DIV",{class:!0});var N=C(s);y=S(N,h),N.forEach(_),p=P(f),f.forEach(_),this.h()},h(){var g;v(r,"class","font-medium"),v(s,"class","text-xs text-gray-500"),v(t,"class",d="w-full text-left px-4 py-3 rounded-lg transition-colors "+(((g=e[1])==null?void 0:g.id)===e[15].id?"bg-forest-100 text-forest-800":"hover:bg-gray-100")),this.first=t},m(g,f){V(g,t,f),c(t,r),c(r,l),c(t,o),c(t,s),c(s,y),c(t,p),i||(a=he(t,"click",m),i=!0)},p(g,f){var w;e=g,f&8&&n!==(n=e[15].title+"")&&O(l,n),f&8&&h!==(h=e[15].category+"")&&O(y,h),f&10&&d!==(d="w-full text-left px-4 py-3 rounded-lg transition-colors "+(((w=e[1])==null?void 0:w.id)===e[15].id?"bg-forest-100 text-forest-800":"hover:bg-gray-100"))&&v(t,"class",d)},d(g){g&&_(t),i=!1,a()}}}function be(u){let e,t,r="Welcome to Help Center",n,l,o="Select a topic from the list to get started",s,h,y=M(u[2].slice(0,4)),p=[];for(let d=0;d<y.length;d+=1)p[d]=de(ae(u,y,d));return{c(){e=I("div"),t=I("h2"),t.textContent=r,n=A(),l=I("p"),l.textContent=o,s=A(),h=I("div");for(let d=0;d<p.length;d+=1)p[d].c();this.h()},l(d){e=k(d,"DIV",{class:!0});var i=C(e);t=k(i,"H2",{class:!0,"data-svelte-h":!0}),q(t)!=="svelte-1puc1gq"&&(t.textContent=r),n=P(i),l=k(i,"P",{class:!0,"data-svelte-h":!0}),q(l)!=="svelte-1xq6v1k"&&(l.textContent=o),s=P(i),h=k(i,"DIV",{class:!0});var a=C(h);for(let m=0;m<p.length;m+=1)p[m].l(a);a.forEach(_),i.forEach(_),this.h()},h(){v(t,"class","text-xl font-semibold text-gray-900 mb-2"),v(l,"class","text-gray-600 mb-4"),v(h,"class","grid grid-cols-2 gap-4 text-left"),v(e,"class","card p-8 text-center")},m(d,i){V(d,e,i),c(e,t),c(e,n),c(e,l),c(e,s),c(e,h);for(let a=0;a<p.length;a+=1)p[a]&&p[a].m(h,null)},p(d,i){if(i&20){y=M(d[2].slice(0,4));let a;for(a=0;a<y.length;a+=1){const m=ae(d,y,a);p[a]?p[a].p(m,i):(p[a]=de(m),p[a].c(),p[a].m(h,null))}for(;a<p.length;a+=1)p[a].d(1);p.length=y.length}},d(d){d&&_(e),fe(p,d)}}}function ke(u){let e,t,r,n=u[1].category+"",l,o,s,h=u[1].title+"",y,p,d,i=M(u[1].content.split(`

`)),a=[];for(let m=0;m<i.length;m+=1)a[m]=ue(oe(u,i,m));return{c(){e=I("div"),t=I("div"),r=I("span"),l=T(n),o=A(),s=I("h2"),y=T(h),p=A(),d=I("div");for(let m=0;m<a.length;m+=1)a[m].c();this.h()},l(m){e=k(m,"DIV",{class:!0});var g=C(e);t=k(g,"DIV",{class:!0});var f=C(t);r=k(f,"SPAN",{class:!0});var w=C(r);l=S(w,n),w.forEach(_),f.forEach(_),o=P(g),s=k(g,"H2",{class:!0});var N=C(s);y=S(N,h),N.forEach(_),p=P(g),d=k(g,"DIV",{class:!0});var G=C(d);for(let j=0;j<a.length;j+=1)a[j].l(G);G.forEach(_),g.forEach(_),this.h()},h(){v(r,"class","text-sm px-3 py-1 bg-forest-100 text-forest-800 rounded-full"),v(t,"class","flex items-center justify-between mb-4"),v(s,"class","text-xl font-bold text-gray-900 mb-4"),v(d,"class","prose prose-sm max-w-none"),v(e,"class","card p-6")},m(m,g){V(m,e,g),c(e,t),c(t,r),c(r,l),c(e,o),c(e,s),c(s,y),c(e,p),c(e,d);for(let f=0;f<a.length;f+=1)a[f]&&a[f].m(d,null)},p(m,g){if(g&2&&n!==(n=m[1].category+"")&&O(l,n),g&2&&h!==(h=m[1].title+"")&&O(y,h),g&2){i=M(m[1].content.split(`

`));let f;for(f=0;f<i.length;f+=1){const w=oe(m,i,f);a[f]?a[f].p(w,g):(a[f]=ue(w),a[f].c(),a[f].m(d,null))}for(;f<a.length;f+=1)a[f].d(1);a.length=i.length}},d(m){m&&_(e),fe(a,m)}}}function de(u){let e,t,r=u[12]+"",n,l,o,s=u[4].filter(d).length+"",h,y,p;function d(...i){return u[8](u[12],...i)}return{c(){e=I("div"),t=I("h3"),n=T(r),l=A(),o=I("p"),h=T(s),y=T(" topics"),p=A(),this.h()},l(i){e=k(i,"DIV",{class:!0});var a=C(e);t=k(a,"H3",{class:!0});var m=C(t);n=S(m,r),m.forEach(_),l=P(a),o=k(a,"P",{class:!0});var g=C(o);h=S(g,s),y=S(g," topics"),g.forEach(_),p=P(a),a.forEach(_),this.h()},h(){v(t,"class","font-medium text-gray-900 mb-1"),v(o,"class","text-xs text-gray-500"),v(e,"class","p-4 bg-gray-50 rounded-lg")},m(i,a){V(i,e,a),c(e,t),c(t,n),c(e,l),c(e,o),c(o,h),c(o,y),c(e,p)},p(i,a){u=i,a&4&&r!==(r=u[12]+"")&&O(n,r),a&4&&s!==(s=u[4].filter(d).length+"")&&O(h,s)},d(i){i&&_(e)}}}function Ie(u){let e,t=u[9]+"",r;return{c(){e=I("p"),r=T(t),this.h()},l(n){e=k(n,"P",{class:!0});var l=C(e);r=S(l,t),l.forEach(_),this.h()},h(){v(e,"class","mb-4 text-gray-700")},m(n,l){V(n,e,l),c(e,r)},p(n,l){l&2&&t!==(t=n[9]+"")&&O(r,t)},d(n){n&&_(e)}}}function Ce(u){let e,t,r=u[9].substring(2)+"",n,l;return{c(){e=I("ul"),t=I("li"),n=T(r),l=A(),this.h()},l(o){e=k(o,"UL",{class:!0});var s=C(e);t=k(s,"LI",{});var h=C(t);n=S(h,r),h.forEach(_),l=P(s),s.forEach(_),this.h()},h(){v(e,"class","list-disc pl-4 mb-2")},m(o,s){V(o,e,s),c(e,t),c(t,n),c(e,l)},p(o,s){s&2&&r!==(r=o[9].substring(2)+"")&&O(n,r)},d(o){o&&_(e)}}}function we(u){let e,t=u[9]+"",r;return{c(){e=I("p"),r=T(t),this.h()},l(n){e=k(n,"P",{class:!0});var l=C(e);r=S(l,t),l.forEach(_),this.h()},h(){v(e,"class","mb-2")},m(n,l){V(n,e,l),c(e,r)},p(n,l){l&2&&t!==(t=n[9]+"")&&O(r,t)},d(n){n&&_(e)}}}function ue(u){let e,t,r;function n(s,h){return h&2&&(e=null),h&2&&(t=null),e==null&&(e=!!(s[9].startsWith("- **")||s[9].startsWith("1. **")||s[9].startsWith("To "))),e?we:(t==null&&(t=!!(s[9].startsWith("- ")||s[9].startsWith("1. "))),t?Ce:Ie)}let l=n(u,-1),o=l(u);return{c(){o.c(),r=le()},l(s){o.l(s),r=le()},m(s,h){o.m(s,h),V(s,r,h)},p(s,h){l===(l=n(s,h))&&o?o.p(s,h):(o.d(1),o=l(s),o&&(o.c(),o.m(r.parentNode,r)))},d(s){s&&_(r),o.d(s)}}}function Ee(u){let e,t,r,n='<h1 class="text-2xl font-bold text-gray-900 mb-2">Help Center</h1> <p class="text-gray-600">Find answers and learn how to use Oscar AI</p>',l,o,s,h,y,p,d,i,a="Topics",m,g,f,w=[],N=new Map,G,j,B,F,K='<h2 class="text-lg font-semibold text-gray-900 mb-2">Need More Help?</h2> <p class="text-gray-600 mb-4">Can&#39;t find what you&#39;re looking for? Contact us for support.</p> <div class="flex gap-4"><a href="mailto:support@oscar-ai.app" class="btn btn-primary">Contact Support</a> <a href="/settings" class="btn btn-secondary">Go to Settings</a></div>',R,Q,D=u[0]&&ie(u),U=M(u[3]);const X=b=>b[15].id;for(let b=0;b<U.length;b+=1){let E=ne(u,U,b),x=X(E);N.set(x,w[b]=ce(x,E))}function J(b,E){return b[1]?ke:be}let W=J(u),H=W(u);return{c(){e=A(),t=I("div"),r=I("div"),r.innerHTML=n,l=A(),o=I("div"),s=I("input"),h=A(),y=I("div"),p=I("div"),d=I("div"),i=I("h2"),i.textContent=a,m=A(),D&&D.c(),g=A(),f=I("div");for(let b=0;b<w.length;b+=1)w[b].c();G=A(),j=I("div"),H.c(),B=A(),F=I("div"),F.innerHTML=K,this.h()},l(b){_e("svelte-1whv9na",document.head).forEach(_),e=P(b),t=k(b,"DIV",{class:!0});var x=C(t);r=k(x,"DIV",{class:!0,"data-svelte-h":!0}),q(r)!=="svelte-ux4ssj"&&(r.innerHTML=n),l=P(x),o=k(x,"DIV",{class:!0});var Z=C(o);s=k(Z,"INPUT",{type:!0,placeholder:!0,class:!0}),Z.forEach(_),h=P(x),y=k(x,"DIV",{class:!0});var z=C(y);p=k(z,"DIV",{class:!0});var $=C(p);d=k($,"DIV",{class:!0});var L=C(d);i=k(L,"H2",{class:!0,"data-svelte-h":!0}),q(i)!=="svelte-17k5z8h"&&(i.textContent=a),m=P(L),D&&D.l(L),g=P(L),f=k(L,"DIV",{class:!0});var ee=C(f);for(let Y=0;Y<w.length;Y+=1)w[Y].l(ee);ee.forEach(_),L.forEach(_),$.forEach(_),G=P(z),j=k(z,"DIV",{class:!0});var te=C(j);H.l(te),te.forEach(_),z.forEach(_),B=P(x),F=k(x,"DIV",{class:!0,"data-svelte-h":!0}),q(F)!=="svelte-1j18n6t"&&(F.innerHTML=K),x.forEach(_),this.h()},h(){document.title="Help - Oscar AI",v(r,"class","mb-8"),v(s,"type","text"),v(s,"placeholder","Search help topics..."),v(s,"class","input w-full"),v(o,"class","mb-6"),v(i,"class","font-semibold text-gray-900 mb-4"),v(f,"class","space-y-2"),v(d,"class","card p-4"),v(p,"class","lg:col-span-1"),v(j,"class","lg:col-span-2"),v(y,"class","grid grid-cols-1 lg:grid-cols-3 gap-6"),v(F,"class","mt-8 card p-6"),v(t,"class","max-w-6xl mx-auto p-6")},m(b,E){V(b,e,E),V(b,t,E),c(t,r),c(t,l),c(t,o),c(o,s),re(s,u[0]),c(t,h),c(t,y),c(y,p),c(p,d),c(d,i),c(d,m),D&&D.m(d,null),c(d,g),c(d,f);for(let x=0;x<w.length;x+=1)w[x]&&w[x].m(f,null);c(y,G),c(y,j),H.m(j,null),c(t,B),c(t,F),R||(Q=he(s,"input",u[6]),R=!0)},p(b,[E]){E&1&&s.value!==b[0]&&re(s,b[0]),b[0]?D?D.p(b,E):(D=ie(b),D.c(),D.m(d,g)):D&&(D.d(1),D=null),E&42&&(U=M(b[3]),w=me(w,E,X,1,b,U,N,f,ge,ce,null,ne)),W===(W=J(b))&&H?H.p(b,E):(H.d(1),H=W(b),H&&(H.c(),H.m(j,null)))},i:se,o:se,d(b){b&&(_(e),_(t)),D&&D.d();for(let E=0;E<w.length;E+=1)w[E].d();H.d(),R=!1,Q()}}}function De(u,e,t){let r,n;const l=[{id:"getting-started",title:"Getting Started",category:"Basics",content:`Welcome to Oscar AI! Here's how to get started:

1. **Configure API Key**: Go to Settings and enter your Groq API key to enable AI features.
2. **Create a Project**: Click on "Projects" in the sidebar to create your first tree survey project.
3. **Add Trees**: Navigate to your project and start adding trees with their details.
4. **Use Oscar AI**: Chat with Oscar AI to get help with tree assessments, recommendations, and more.`},{id:"projects",title:"Managing Projects",category:"Projects",content:`Projects help you organize your tree surveys by location or client.

Features:
- Create multiple projects for different sites
- Add trees to each project
- Track project status and notes
- Export project data as PDF reports

To create a new project:
1. Click "Projects" in the sidebar
2. Click "+ New Project"
3. Enter project name and location
4. Start adding trees`},{id:"trees",title:"Tree Data Entry",category:"Trees",content:`When adding trees to a project, you'll need to enter:

- **Tree Number**: Unique identifier for each tree
- **Species**: Common and scientific name
- **DBH**: Diameter at Breast Height (in mm)
- **Height**: Estimated tree height (in meters)
- **Age Class**: Young, Semi-mature, Mature, Over-mature
- **Condition**: Good, Fair, Poor, Dead
- **Photos**: Upload photos of the tree

You can also add notes and recommendations for each tree.`},{id:"oscar-ai",title:"Using Oscar AI",category:"AI Features",content:`Oscar AI is your AI assistant for tree surveys. It can help with:

- **Tree Assessments**: Get expert analysis of tree conditions
- **Recommendations**: Receive management recommendations based on BS5837
- **Report Writing**: Generate professional report sections
- **Species Information**: Learn about tree species characteristics
- **Defect Analysis**: Identify potential hazards and defects

Simply type your question or request in the chat, and Oscar will respond with relevant information.`},{id:"reports",title:"Generating Reports",category:"Reports",content:`Create professional tree survey reports with our built-in report generator.

Features:
- Automatic tree data compilation
- BS5837 compliant format
- Customizable templates
- PDF export with photos
- Include recommendations and constraints

To generate a report:
1. Go to your project
2. Click "Generate Report"
3. Select report options
4. Preview and download PDF`},{id:"learn-style",title:"Learning Your Style",category:"AI Features",content:`Teach Oscar AI your writing style for more personalized outputs.

How it works:
1. Go to "Learn My Style" in the sidebar
2. Create a new style profile
3. Paste examples of your previous reports
4. Or upload PDF/DOCX documents
5. Oscar AI analyzes your style
6. Save the profile for future use

Oscar will then use your style when generating recommendations and reports.`},{id:"notes",title:"Using Notes",category:"Basics",content:`Keep track of important information with Notes.

Features:
- Create and organize notes by category
- Search through all notes
- Edit and delete notes
- Notes sync across devices

Categories include:
- Site Notes
- Client Information
- Meeting Notes
- General Notes`},{id:"settings",title:"Settings & Configuration",category:"Basics",content:`Customize Oscar AI in Settings:

- **API Key**: Enter your Groq API key (required for AI features)
- **Theme**: Switch between light and dark mode
- **Data Management**: Export or import your data
- **Clear Data**: Reset all local data

Your data is stored locally in your browser. Use the export feature to backup important information.`}];let o=null,s="";function h(i){t(1,o=i)}function y(){s=this.value,t(0,s)}const p=i=>h(i),d=(i,a)=>a.category===i;return u.$$.update=()=>{u.$$.dirty&1&&t(3,r=s?l.filter(i=>i.title.toLowerCase().includes(s.toLowerCase())||i.content.toLowerCase().includes(s.toLowerCase())):l)},t(2,n=[...new Set(l.map(i=>i.category))]),[s,o,n,r,l,h,y,p,d]}class Se extends ve{constructor(e){super(),ye(this,e,De,Ee,pe,{})}}export{Se as component};
