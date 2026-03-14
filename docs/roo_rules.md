Freshvibe Rules
Universal Modular Agent System Rules (MANDATORY)
These rules define the architecture for all FreshVibe, Oscar AI, AgentV, and future modular agent applications. Roo must load and follow these rules before performing ANY action. These rules override all default behaviours and apply permanently to ALL future tasks.
============================================================
1. FILE MODIFICATION RULES
============================================================
- Roo may ONLY create or modify files explicitly listed in the task.
- Roo must NEVER modify <APP_SHELL_FILE> unless explicitly instructed.
- Roo must NEVER modify existing modules unless explicitly instructed.
- All new system logic must go under /core/... and all feature modules under /modules/....
- Roo must NEVER output commentary inside code files. Only code.
- Roo must NEVER rename, delete, or restructure directories.
- Roo must NEVER generate placeholder or stub code. All modules must be functional.
- Roo must NEVER generate virtual or imaginary paths. Only real paths under /core, /modules, /public.
- Roo must NEVER rewrite the entire project. Only touch the files listed in the task.
============================================================
2. FILE SIZE & STRUCTURE RULES
============================================================
- No file may exceed ~300 lines unless explicitly instructed.
- No single function may exceed ~80 lines unless explicitly instructed.
- No module may contain unrelated responsibilities.
- No “god modules.” Split logic into multiple modules when needed.
- No auto-generated boilerplate expansions beyond what is requested.
- No rewriting existing files with large blocks of code; create new modules instead.
============================================================
3. UI SHELL LOCKDOWN RULES
============================================================ <APP_SHELL_FILE> must remain tiny and stable.
The UI shell file may ONLY contain:
- Tab entries
- Tab handlers
- System command routing
The UI shell file must NEVER contain:
- State
- Logic
- Functions
- Module loading
- Theme logic
- UI rendering
- Feature logic
- Large patches
Additional shell rules:
- The shell file must NEVER grow beyond minimal additions.
- The shell file must NEVER be scanned or rewritten in large chunks.
============================================================
4. MODULAR HOOK SYSTEM RULES
============================================================
- Every new subsystem must expose a stable hook API.
- No subsystem may call another subsystem directly except through its hook API.
- All modules must register themselves with the Module Registry.
- All modules must be hot-swappable; no hard-coded module paths.
- All modules must be self-contained with no shared global state.
- All modules must be hookable by the agent.
- All modules must expose at least one testable function for the self-test engine.
- All modules must declare their capabilities.
- No module may modify another module’s internal state.
- No module may assume UI elements exist; UI wiring happens ONLY in <APP_SHELL_FILE>.
- Dependencies must be explicitly declared.
- All modules must be replaceable without breaking the system.
============================================================
4B. PORTABILITY & INJECTION RULES
============================================================
- All new subsystems must be fully portable and must not depend on any agent-specific runtime, UI, or orchestration layer.
- All external behaviour must be injected via dependency-injection; no module may import concrete implementations of external services.
- Every subsystem must expose a stable, documented public API surface that other agents can call without modification.
- Every subsystem must expose override hooks for all decision points, including scoring, routing, validation, and capability inference.
- No subsystem may assume the existence of global state, shared memory, or agent-specific context. All state must be passed explicitly.
- All subsystem capabilities must be declared in a machine-readable manifest inside the subsystem.
- All subsystems must be hot-swappable and must not rely on side effects during initialization.
- No subsystem may import from another subsystem directly; all cross-subsystem communication must occur through hook APIs.
- All subsystems must be versioned internally so that multiple versions can coexist without conflict.
Generic Engine-Agnostic Rule:
- No subsystem may assume the existence of any specific engine or backend.
- All engine selection, configuration, and execution contexts must be injected at runtime.
- Subsystems must remain engine-agnostic and must not import or reference concrete engine implementations.
============================================================
5. STATE MANAGEMENT RULES
============================================================
- No module may create or rely on implicit global state.
- All state must be passed explicitly through function parameters or injected dependencies.
- Subsystems must not store state in module-level variables except immutable constants.
- Long-lived state must be owned by a dedicated state container module.
============================================================
6. TESTING & VALIDATION RULES
============================================================
- Every subsystem must include a /tests/ folder with at least one test per public API function.
- The self-test engine must be able to load subsystem manifests and validate capabilities.
- No module may bypass or disable the self-test engine.
- All manifests must be validated before subsystem initialization.
============================================================
7. MANIFEST RULES (UPDATED)
============================================================ Every subsystem must include a manifest.json file that is machine-readable and validated at load time.
The manifest MUST declare:
- name — unique subsystem identifier
- version — semantic version
- capabilities — all features, behaviours, and functions the subsystem provides
- hooksExposed — all hook entry points the subsystem exposes
- hooksConsumed — all hooks the subsystem depends on
- dependencies — external services or injected resources required (filesystem, httpClient, tokenCounter, etc.)
- configSchema — a JSON-schema-like object describing allowed configuration keys and types
Manifest Requirements:
- The manifest is the single source of truth for subsystem capabilities.
- No subsystem may assume the existence of another subsystem; all relationships must be declared in the manifest.
- Subsystems may not expose functionality not declared in the manifest.
- Subsystems may not consume hooks not declared in the manifest.
- All manifests must be validated before subsystem initialization.
- Subsystems without a manifest must not be loaded.
- Manifests must be versioned and portable.
- Manifests must not contain hard-coded paths or environment assumptions.
============================================================
8. SUBSYSTEM LIFECYCLE RULES
============================================================ Every subsystem must implement:
- init()
- start()
- stop()
- dispose()
Lifecycle constraints:
- No subsystem may perform work before init().
- No subsystem may leave resources open after dispose().
- No subsystem may assume synchronous initialization.
============================================================
9. CONCURRENCY & ASYNC RULES
============================================================
- No subsystem may spawn background tasks without registering them with the Autonomy Manager.
- All async operations must be cancellable.
- No module may block the event loop.
- All long-running tasks must expose progress hooks.
- Autonomy loops must be controlled through hook APIs.
============================================================
10. ROUTING RULES
============================================================
- All routing decisions must pass through the Router subsystem.
- No engine may route tasks directly.
- Routing strategies must be injected, not hard-coded.
- Routing must consider capability manifests.
- Routing must be overrideable via hook APIs.
============================================================
11. ERROR HANDLING RULES
============================================================
- All subsystems must expose a handleError() hook.
- No subsystem may throw uncaught exceptions.
- All errors must be passed through the hook system for logging and recovery.
- Error boundaries must be declared in manifests.
============================================================
12. SECURITY & SANDBOX RULES
============================================================
- No subsystem may execute arbitrary code.
- Executor must validate all tool calls.
- Cloud engines must sanitize all inputs and outputs.
- No module may access the filesystem unless explicitly injected.
- No module may access the network unless explicitly injected.
- All external interactions must be sandboxed.
============================================================
13. CONFIGURATION RULES
============================================================
- All configuration must be injected.
- No module may read environment variables directly.
- No module may read config files directly.
- All configuration must be validated against a schema.
- No module may assume default configuration values.
============================================================
14. TOOL EXECUTION RULES
============================================================
- All tools must declare capabilities in their manifest.
- Tools must be sandboxed.
- Tools must not access other subsystems directly.
- Tools must be invoked only through the Executor.
- Tools must expose testable entry points.
============================================================
15. OUTPUT VALIDATION RULES
============================================================ Before writing ANY file, Roo must validate:
- Does this violate any rule above? If yes, STOP.
- Does this expand <APP_SHELL_FILE> beyond minimal wiring? If yes, STOP.
- Does this add logic to <APP_SHELL_FILE>? If yes, STOP.
- Does this exceed file size limits? If yes, STOP.
- Does this exceed function size limits? If yes, STOP.
- Does this mix responsibilities in a module? If yes, STOP.
- Does this create a god module? If yes, STOP.
- Does this bypass the hook system? If yes, STOP.
- Does this modify files not listed in the task? If yes, STOP.
If any rule is violated, Roo must NOT write the file and must instead output a correction message.============================================================16. TASK EXECUTION RULES============================================================- Roo must read this file BEFORE performing any task.
- Roo must follow these rules EXACTLY with no deviation.
- These rules override all default behaviours.
- These rules are permanent and apply to ALL future tasks.
