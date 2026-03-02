# PHASE 26 — UX CONSISTENCY RULES

## Overview
This document specifies rules and checks to ensure consistent user experience across the Oscar AI Copilot OS. It covers assistant behaviour, context chips, smart hints, micro‑cues, modal assistant scoping, one‑bubble confirmation, and chat history filtering.

## 1. ASSISTANT BEHAVIOUR CONSISTENCY

### Rule 1.1: Consistent Response Patterns
**All assistants must follow these response patterns:**

1. **Greeting Pattern**
   - First interaction: "Hello! I'm your Oscar AI assistant. How can I help you today?"
   - Subsequent interactions: Context‑aware greeting based on previous conversation

2. **Acknowledgement Pattern**
   - After user input: Brief acknowledgement before processing
   - Examples: "Got it.", "I'll help with that.", "Let me look into that."

3. **Clarification Pattern**
   - When uncertain: Ask for clarification with specific options
   - Format: "Just to clarify, are you asking about [Option A] or [Option B]?"

4. **Completion Pattern**
   - After task completion: Clear completion message
   - Format: "Done! I've [action taken]. [Next step suggestion if applicable]."

5. **Error Pattern**
   - On error: Clear error message with recovery suggestion
   - Format: "I couldn't [action] because [reason]. [Recovery suggestion]."

### Rule 1.2: Tone Consistency
**All assistants must maintain consistent tone:**

1. **Professional but Friendly**
   - Use "you" and "I" (not "the user" or "the system")
   - Avoid overly casual language ("hey", "yo")
   - Avoid overly formal language ("the user may wish to consider")

2. **Confident but Humble**
   - Express confidence in abilities: "I can help with that."
   - Acknowledge limitations: "I'm still learning about that."
   - Never claim omniscience

3. **Helpful but Concise**
   - Provide complete answers but avoid unnecessary detail
   - Use bullet points for lists of 3+ items
   - Keep paragraphs to 3‑4 sentences maximum

### Rule 1.3: Personality Consistency
**All assistants share these personality traits:**

1. **Proactive but Respectful**
   - Offer suggestions but don't insist
   - Example: "Would you like me to [suggestion]?" not "You should [suggestion]"

2. **Patient**
   - Never express frustration
   - Handle repetitive questions gracefully
   - Example: "Let me explain that again in a different way."

3. **Curious**
   - Ask clarifying questions when helpful
   - Example: "What specifically would you like to know about [topic]?"

## 2. CONTEXT CHIPS RULES

### Rule 2.1: Context Chip Display
**Context chips must always be correct and relevant:**

1. **Display Conditions**
   - Show when: Context is available and relevant to current task
   - Hide when: Context is stale (>5 minutes old) or irrelevant
   - Update: Real‑time as context changes

2. **Content Rules**
   - Maximum 3 chips visible at once
   - Each chip: Icon + 1‑3 word label
   - Hover: Show full context description
   - Click: Activate/expand context

3. **Priority Order**
   1. Current document/project
   2. Recent actions
   3. User preferences
   4. System state

### Rule 2.2: Context Chip Accuracy
**Chips must accurately represent context:**

1. **Document Context Chip**
   - Shows: Document name + type icon
   - Updates: When document changes or is edited
   - Removes: When document is closed

2. **Project Context Chip**
   - Shows: Project name + project icon
   - Updates: When project changes
   - Removes: When no project active

3. **Task Context Chip**
   - Shows: Task name + priority indicator
   - Updates: When task status changes
   - Removes: When task completed or abandoned

4. **Assistant Mode Chip**
   - Shows: Current assistant mode (chat/context/workflow)
   - Updates: When mode changes
   - Click: Switch modes

## 3. SMART HINTS RULES

### Rule 3.1: Hint Relevance
**Smart hints must always be relevant:**

1. **Timing Rules**
   - Show: After 3 seconds of inactivity or when pattern detected
   - Hide: When user starts interacting
   - Frequency: Maximum 1 hint per minute

2. **Content Rules**
   - Based on: Current context + user behaviour patterns
   - Format: Brief suggestion (max 10 words)
   - Action: Click to execute or learn more

3. **Relevance Scoring**
   - Score hints 1‑10 based on:
     - Context relevance (0‑4)
     - User history (0‑3)
     - Time since last similar hint (0‑3)
   - Only show hints with score ≥7

### Rule 3.2: Hint Categories
**Organize hints by category:**

1. **Discovery Hints**
   - Purpose: Help users discover features
   - Example: "Did you know you can [feature] by [action]?"
   - Show: To new users or after feature updates

2. **Efficiency Hints**
   - Purpose: Suggest faster ways to accomplish tasks
   - Example: "You can [task] faster by using [shortcut/feature]."
   - Show: When pattern of inefficiency detected

3. **Completion Hints**
   - Purpose: Help complete current task
   - Example: "To finish [task], you need to [next step]."
   - Show: When task appears stuck

4. **Learning Hints**
   - Purpose: Teach advanced features
   - Example: "Want to learn more about [advanced feature]?"
   - Show: To experienced users

## 4. MICRO‑CUES RULES

### Rule 4.1: Micro‑Cue Accuracy
**Micro‑cues must always be accurate:**

1. **Definition**
   - Micro‑cues: Small, non‑intrusive indicators of system state
   - Examples: Saving indicator, sync status, connection status

2. **Visual Rules**
   - Position: Consistent location (usually top‑right)
   - Size: Small but readable
   - Color: Semantic (green=good, yellow=warning, red=error)
   - Animation: Subtle, not distracting

3. **Timing Rules**
   - Show: Immediately when state changes
   - Persist: For appropriate duration (2‑5 seconds)
   - Hide: When state returns to normal or user dismisses

### Rule 4.2: Micro‑Cue Categories
**Standardize micro‑cues:**

1. **Save Status**
   - Saving... (animated)
   - Saved (checkmark, fades after 2 seconds)
   - Save failed (error icon, persists until clicked)

2. **Sync Status**
   - Syncing... (animated)
   - Synced (checkmark, fades after 2 seconds)
   - Sync conflict (warning icon, persists)
   - Offline (disconnected icon, persists)

3. **Connection Status**
   - Connecting... (animated)
   - Connected (subtle indicator)
   - Connection lost (warning, persists)

4. **Processing Status**
   - Processing... (animated)
   - Complete (checkmark, fades)
   - Error (error icon, persists)

## 5. MODAL ASSISTANT SCOPING RULES

### Rule 5.1: Scope Definition
**Modal assistant must always be properly scoped:**

1. **Scope Boundaries**
   - Limited to: Current document/task/project
   - Cannot: Access unrelated documents or system‑wide settings
   - Can: Reference related context within scope

2. **Scope Indication**
   - Title: "[Scope] Assistant"
   - Example: "Document Assistant", "Task Assistant", "Project Assistant"
   - Visual: Scope‑specific color/theming

3. **Scope Transitions**
   - When scope changes: Assistant updates immediately
   - If scope becomes invalid: Close assistant with explanation
   - Example: "This assistant is for [old scope]. Opening new assistant for [new scope]."

### Rule 5.2: Scope‑Appropriate Behaviour
**Behaviour must match scope:**

1. **Document Scope**
   - Focus: Content, formatting, analysis
   - Cannot: Create new projects or system tasks
   - Can: Suggest document‑related tasks

2. **Task Scope**
   - Focus: Task completion, dependencies, scheduling
   - Cannot: Edit document content directly
   - Can: Reference related documents

3. **Project Scope**
   - Focus: Project planning, resource allocation, timeline
   - Cannot: Edit individual task details
   - Can: Create project‑level tasks and documents

## 6. ONE‑BUBBLE CONFIRMATION RULES

### Rule 6.1: One‑Bubble Principle
**All confirmations use single bubble pattern:**

1. **Pattern Definition**
   - Single bubble containing: Action + confirmation + undo option
   - Position: Near action point
   - Duration: 5 seconds or until dismissed

2. **Content Rules**
   - Action: "[Action] completed"
   - Details: Brief description if needed
   - Undo: "Undo" link/button
   - Example: "Document saved. Undo"

3. **Visual Rules**
   - Background: Subtle color (light blue/green)
   - Text: Clear, readable
   - Undo: Prominent but not overwhelming

### Rule 6.2: Confirmation Types
**Standardize confirmation types:**

1. **Save Confirmations**
   - Pattern: "[Item] saved. Undo"
   - Example: "Document saved. Undo"

2. **Delete Confirmations**
   - Pattern: "[Item] deleted. Undo"
   - Example: "Task deleted. Undo"

3. **Update Confirmations**
   - Pattern: "[Item] updated. Undo"
   - Example: "Project timeline updated. Undo"

4. **Create Confirmations**
   - Pattern: "[Item] created. Undo"
   - Example: "New task created. Undo"

### Rule 6.3: Undo Behaviour
**Undo must work consistently:**

1. **Undo Scope**
   - Reverts: Single most recent action
   - Cannot: Undo multiple actions from one bubble
   - Time limit: 30 seconds from action

2. **Undo Feedback**
   - On click: Immediate visual feedback
   - After undo: "Undone" confirmation bubble
   - Example: "Document restore complete."

3. **Redo Option**
   - After undo: Offer redo if applicable
   - Pattern: "Undone. Redo?"
   - Time limit: 30 seconds from undo

## 7. CHAT HISTORY FILTERING RULES

### Rule 7.1: History Organization
**Chat history must be correctly filtered and organized:**

1. **Filtering Criteria**
   - By assistant: Modal vs Global vs Workflow
   - By context: Document, Task, Project, General
   - By time: Today, Yesterday, This Week, Older
   - By type: Questions, Actions, Suggestions, Errors

2. **Display Rules**
   - Default view: Chronological, unfiltered
   - Filter controls: Always visible but unobtrusive
   - Search: Full‑text across all history

3. **Privacy Rules**
   - Never show: Other users' conversations
   - Anonymize: User data in shared histories
   - Clear option: "Clear all history" always available

### Rule 7.2: History Persistence
**History must persist correctly:**

1. **Storage Rules**
   - Local storage: All conversations
   - Cloud sync: Optional (user setting)
   - Encryption: All stored conversations

2. **Retention Rules**
   - Default: Keep 90 days
   - User configurable: 30, 90, 180, 365 days, forever
   - Auto‑cleanup: Old conversations removed per policy

3. **Export Rules**
   - Format: JSON, PDF, Markdown
   - Content: Full conversation with metadata
   - Privacy: User‑controlled export

## 8. CONSISTENCY CHECKS

### Rule 8.1: Automated Consistency Checks
**Implement automated checks for UX consistency:**

1. **Visual Consistency Check**
   - Verify: All components use same design system
   - Check: Colors, spacing, typography, icons
   - Frequency: On every build

2. **Behaviour Consistency Check**
   - Verify: All assistants follow response patterns
   - Check: Tone, patterns, error handling
   - Frequency: Weekly automated testing

3. **Performance Consistency Check**
   - Verify: Consistent performance across components
   - Check: Load times, response times, animation smoothness
   - Frequency: Daily monitoring

### Rule 8.2: Manual Consistency Reviews
**Regular manual reviews:**

1. **Weekly UX Review**
   - Review: Random sample of user sessions
   - Check: Consistency issues
   - Action: Create tickets for inconsistencies

2. **Monthly Design Review**
   - Review: All UI components
   - Check: Adherence to design system
   - Action: Update components as needed

3. **Quarterly User Testing**
   - Test: Consistency with real users
   - Gather: Feedback on consistency
   - Action: Prioritize consistency improvements

## 9. IMPLEMENTATION GUIDELINES

### Rule 9.1: Development Guidelines
**Developers must follow these guidelines:**

1. **Component Library**
   - Use: Shared component library for all UI
   - Never: Create custom UI without design review
   - Always: Use design system tokens

2. **Assistant Framework**
   - Use: Shared assistant framework
   - Never: Implement custom assistant logic
   - Always: Use response pattern library

3. **Testing Requirements**
   - Test: All UX rules in component tests
   - Verify: Consistency across browsers/devices
   - Document: Any deviations from rules

### Rule 9.2: Quality Assurance
**QA must verify consistency:**

1. **Checklist Testing**
   - Use: UX consistency checklist
   - Verify: All rules for each feature
   - Document: Any inconsistencies found

2. **Cross‑Browser Testing**
   - Test: All major browsers
   - Verify: Consistent behaviour
   - Document: Browser‑specific issues

3. **Accessibility Testing**
   - Test: WCAG 2.1 AA compliance
   - Verify: Consistent accessibility
   - Document: Accessibility issues

## 10. MONITORING AND ENFORCEMENT

### Rule 10.1: Monitoring
**Monitor UX consistency in production:**

1. **Metrics Collection**
   - Collect: User interaction patterns
   - Analyze: Consistency deviations
   - Alert: On significant inconsistencies

2. **User Feedback**
   - Collect: Consistency feedback
   - Analyze: Common pain points
   - Prioritize: Based on impact

3. **A/B Testing**
   - Test: Consistency improvements
   - Measure: Impact on user satisfaction
   - Implement: Successful improvements

### Rule 10.2: Enforcement
**Enforce UX consistency:**

1. **Code Reviews**
   - Require: UX consistency review
   - Block: Inconsistent implementations
   - Educate: On consistency rules

2. **Build Checks**
   - Implement: Automated consistency checks
   - Fail: Builds with consistency violations
   - Report: Detailed violation reports

3. **Training**
   - Provide: Regular UX consistency training
   - Update: As rules evolve
   - Certify: Developers on consistency rules