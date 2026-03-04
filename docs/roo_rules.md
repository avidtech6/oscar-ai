Oscar AI — Global Architecture & Behaviour Contract
(Mandatory for ALL tasks, phases, and operations)

1. File Size & Function Size Limits
These limits are absolute unless explicitly overridden.

No file may exceed 300 lines.

No function may exceed 80 lines.

If a file approaches 250 lines, Roo must STOP and request permission to split.

If a function approaches 70 lines, Roo must STOP and request permission to split.

No “god modules.”

No multi‑responsibility files.

No large rewrites of existing files.

New features must be implemented as new modules, not expansions of existing ones.

When refactoring, extract small modules rather than rewriting large ones.

2. Module Boundaries & Responsibilities
Every module must have one clear purpose.

A module must not contain unrelated logic.

A module must not contain UI + logic + data + orchestration mixed together.

A module must not contain more than one conceptual layer.

If a module begins to accumulate multiple responsibilities, Roo must split it.

All modules must be deterministic, minimal, and self‑contained.

3. Phase‑Order Rebuild Rules
These rules govern how Roo rebuilds Oscar AI.

Phases must be completed in order.

Roo may not skip phases.

Roo may not begin a new phase until the previous phase is marked complete.

Missing files must be created before corrupted files are repaired.

Corrupted files must be repaired minimally, not rewritten.

After each file creation or repair, Roo must:

re‑scan the filesystem

update the integrity map

STOP and wait for the next instruction

4. Missing File Rules
When creating missing files:

Keep them minimal and deterministic.

Follow the phase specification exactly.

Do not implement full logic unless the phase requires it.

Do not overwrite existing files.

Do not generate boilerplate beyond what is required.

Do not create additional files not listed in the phase.

5. Corrupted File Rules
When repairing corrupted files:

Modify only the minimal lines required.

Do not rewrite the entire file.

Do not restructure the file.

Do not expand the file.

Do not introduce new features.

If the file is extremely large, Roo must request human confirmation before attempting any patch.

If the file is manually corrected by the user, Roo must treat it as verified.

6. Integrity Map Rules
After any file operation:

Roo must re‑scan the filesystem.

Roo must update the integrity map.

Roo must stop and report status.

Roo must not proceed automatically to the next file.

Roo must not assume missing or corrupted files beyond what the integrity map reports.

7. Orchestration & Intelligence Layer Rules
For orchestration phases (e.g., Phase 19):

Create small, focused modules.

No orchestration file may exceed 300 lines.

No orchestration function may exceed 80 lines.

Orchestration must be split into:

kernel

router

lifecycle manager

context

error boundary

capability registry

runtime guards

Orchestration must not be monolithic.

Orchestration must not rewrite existing subsystems.

8. Refinement Phase Rules
During refinement phases:

Roo must identify oversized files.

Roo must propose safe module splits.

Roo must extract functions into smaller modules.

Roo must preserve public APIs.

Roo must not rewrite entire files.

Roo must not break existing imports.

Roo must not modify behaviour unless explicitly instructed.

9. Behavioural Rules
Roo must:

Act deterministically.

Avoid loops.

Avoid re‑attempting failed patches.

Avoid rewriting large files.

Avoid generating unnecessary code.

Avoid expanding modules beyond their purpose.

Ask for permission when approaching size limits.

Stop after each file operation.

Wait for explicit instructions before continuing.

10. Forbidden Behaviours
Roo must never:

Rewrite large files (>300 lines).

Expand existing modules with new responsibilities.

Generate monolithic orchestrators.

Create files not listed in the phase.

Modify verified files.

Attempt to fix a file repeatedly after failure.

Proceed to the next phase without explicit instruction.

Generate boilerplate beyond what is required.

Merge multiple responsibilities into one file.

Attempt to “optimise” or “improve” code outside the phase scope.

11. Mandatory Workflow
For every task:

Load and obey all rules in this file.

Apply the FreshVibe File Size Rules.

Apply the Phase‑Order Rebuild Rules.

Apply the Missing/Corrupted File Rules.

Perform the requested operation.

Re‑scan the filesystem.

Update the integrity map.

STOP and wait for the next instruction.

12. Human Overrides
If the user manually corrects a file:

Roo must treat the file as verified.

Roo must not attempt to modify it again.

Roo must update the integrity map accordingly.

13. Safety & Stability
Roo must prioritise:

stability

determinism

modularity

minimalism

correctness

safety

over:

cleverness

optimisation

refactoring

rewriting

consolidation

14. Global Rule