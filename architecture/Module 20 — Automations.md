---

# **MODULE 20 — AUTOMATIONS**

## **20.1 Purpose**

Automations allow the cockpit to observe, react, and act across all domains without manual intervention. They connect triggers, conditions, actions, integrations, AI logic, and permissions into a single system that can run locally or in the cloud. Automations make the cockpit proactive rather than reactive.

---

## **20.2 Architecture**

Automations operate across three coordinated layers:

### **Local Automation Layer**

- Runs automations that only touch local data.
- Works offline.
- Uses the local event bus.
- Stores recent logs locally.
- Executes lightweight AI actions.

### **Cloud Automation Layer (Supabase Functions / Edge)**

- Executes automations requiring integrations, email sending, campaign actions, or heavy processing.
- Handles scheduled automations.
- Stores canonical automation definitions.
- Stores full logs and audit trails.

### **AI Automation Layer (Oscar)**

- Generates automations from natural language.
- Explains rules.
- Detects conflicts and loops.
- Suggests optimisations.
- Summarises logs.
- Helps debug failures.

---

## **20.3 Automation Types**

Automations fall into four categories:

### **Event‑based**

Triggered by something happening:

- file uploaded
- page updated
- task created
- email received
- campaign launched
- map pin added
- integration webhook fired

### **Schedule‑based**

Runs on a timer:

- daily
- weekly
- monthly
- custom cron
- “every X minutes”

### **Condition‑based**

Runs when a condition becomes true:

- task overdue
- file older than X
- campaign CTR < threshold
- page updated by someone else
- vault secret expiring

### **Manual**

Triggered by the user:

- “Run now”
- “Apply to selected items”

---

## **20.4 Triggers**

Triggers define when an automation starts. Examples:

### **Workspace**

- page created
- page updated
- block added
- block deleted

### **Files**

- file uploaded
- file tagged
- file moved
- version created

### **Projects**

- task created
- task completed
- task overdue
- status changed

### **Connect**

- email received
- email sent
- campaign launched
- campaign finished

### **Map**

- pin added
- pin updated

### **Identity**

- new team member
- role changed
- integration connected

### **Integrations**

- webhook received
- API event fired

Triggers are cached locally for offline evaluation.

---

## **20.5 Conditions**

Conditions refine triggers and determine whether the automation should run.

Examples:

- file size > X
- file type = image
- task priority = high
- task due in < 3 days
- page contains keyword
- email from domain
- campaign CTR < X%
- map pin within radius
- user role = admin

Conditions support AND/OR logic.

---

## **20.6 Actions**

Actions define what the automation does.

### **Workspace**

- create page
- update page
- append block
- summarise content
- extract tasks

### **Files**

- move file
- tag file
- rename file
- generate preview
- extract text

### **Projects**

- create task
- update task
- change status
- assign user
- add comment

### **Connect**

- send email
- draft email
- schedule campaign
- tag contact

### **Map**

- create pin
- update pin

### **Identity**

- notify user
- update preferences

### **Integrations**

- call webhook
- send API request
- refresh token

### **AI Actions**

- summarise
- rewrite
- classify
- extract entities
- generate insights

Actions run locally when possible and in the cloud when required.

---

## **20.7 Automation Builder**

A visual builder with:

- trigger selector
- condition builder
- action selector
- preview panel
- Oscar panel (AI assistance)
- test mode
- logs

Supports natural‑language creation:

> “When a file is uploaded with ‘invoice’ in the name, extract the amount and create a task.”
> 

Oscar converts this into a structured automation.

---

## **20.8 Automation Cards**

Each automation is represented as a card containing:

- name
- trigger
- conditions
- actions
- status
- last run
- next run
- logs
- ?‑marker

Cards can be enabled, disabled, duplicated, exported, or versioned.

---

## **20.9 Execution Model**

### **Local Execution**

Runs when:

- automation affects only local data
- user is offline
- action is safe
- no integration is required

Examples:

- tagging files
- creating tasks
- updating pages
- local notifications

### **Cloud Execution**

Runs when:

- integration is required
- email must be sent
- campaign must be launched
- webhook must be called
- scheduled automation triggers
- heavy processing is needed

Supabase Functions handle cloud execution.

---

## **20.10 Logs**

Each automation has:

- run history
- success/failure
- input/output
- AI logs
- integration logs
- Supabase logs

Local logs store recent runs; cloud stores full history.

---

## **20.11 Permissions**

Permissions from Module 19 apply:

- only admins/owners can create workspace‑level automations
- editors can create personal automations
- viewers cannot create automations
- vault access required for secret‑based actions
- integration permissions required for provider actions

Automations always respect RLS.

---

## **20.12 Offline Behaviour**

### **Allowed offline**

- local triggers
- local conditions
- local actions
- local logs
- local notifications
- local AI actions

### **Not allowed offline**

- sending email
- calling webhooks
- launching campaigns
- updating integrations
- vault access

These queue until online.

---

## **20.13 Smart Eviction**

Automation cache evicts:

- old logs
- old drafts
- old test runs
- old AI summaries

Never evicted:

- active automations
- automation definitions
- permissions
- triggers

---

## **20.14 ?‑Markers**

Every automation element has a ?‑marker:

- triggers
- conditions
- actions
- logs
- schedules
- permissions

Help Peek explains:

- what it does
- how it works
- best practices
- security implications

Oscar receives full context.

---

## **20.15 Settings Peek (Automation Settings)**

Includes:

- default permissions
- schedule limits
- integration limits
- AI usage limits
- log retention
- error notifications
- automation templates

---

## **20.16 Inbox Peek + Share‑to‑Oscar**

If an automation relates to an integration:

- Inbox Peek filters provider emails
- “Share to Oscar” extracts keys, tokens, DNS records
- Settings auto‑fill
- Automation updates accordingly

---

## **20.17 AI Context Model**

Oscar always knows:

- which automation is open
- which trigger is selected
- which conditions are active
- which actions are chosen
- which logs are visible
- which integrations are connected
- which permissions apply

Oscar can:

- generate automations
- optimise automations
- detect loops
- detect conflicts
- propose improvements
- summarise logs
- explain failures

---

## **20.18 Cross‑Module Integration**

Automations connect all domains:

- Files → Projects
- Workspace → Connect
- Connect → Projects
- Map → Files
- Timeline → Projects
- Dashboard → Automations
- Identity → Integrations
- Permissions → Automations

Automations are the system’s “glue.”

---

## **20.19 Security Guarantees**

- Supabase RLS enforces all access
- vault secrets encrypted
- PIN unlock protects local automations
- biometrics protect unlock
- offline actions sandboxed
- cloud actions validated

---I don't know I have no idea. Sweetie I have no from Patty 