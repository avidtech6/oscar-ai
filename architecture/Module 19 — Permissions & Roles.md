---

# **MODULE 19 — PERMISSIONS & ROLES (FULLY REWRITTEN)**

## **19.1 Purpose**

Permissions & Roles is the system’s **access control layer**, defining:

- who can access which domains
- who can view/edit/delete items
- who can manage integrations
- who can manage billing
- who can manage team members
- who can publish content
- who can access vault secrets
- who can manage automations

It ensures every module respects the user’s role and organisational structure.

---

## **19.2 Architecture**

Permissions use a **hybrid model**:

### **Local Layer (Primary for UI)**

- cached permissions
- cached team membership
- cached access rules
- cached org metadata

This allows the UI to behave correctly **offline**.

### **Cloud Layer (Supabase)**

- canonical permissions
- row‑level security (RLS)
- team membership
- shared items
- audit logs

Supabase enforces security at the database level.

---

## **19.3 Role Types**

The system supports **four universal roles**, plus **custom roles**.

### **1. Owner**

- full access to everything
- can manage billing
- can manage vault
- can manage integrations
- can manage team
- can delete workspace

### **2. Admin**

- full access to all content
- can manage team (except owner)
- can manage integrations
- can manage automations
- cannot delete workspace
- cannot change billing owner

### **3. Editor**

- can create/edit/delete content
- can manage projects
- can manage campaigns
- can upload files
- can use integrations
- cannot manage team
- cannot manage billing
- cannot access vault secrets

### **4. Viewer**

- read‑only access
- can comment
- can view dashboards
- can view files
- cannot edit anything

### **5. Custom Roles**

Admins can create custom roles with:

- domain‑level permissions
- item‑level permissions
- integration‑level permissions
- automation‑level permissions

Custom roles are stored in Supabase and cached locally.

---

## **19.4 Permission Scopes**

Permissions apply at multiple levels:

### **Workspace‑level**

- access to entire workspace
- access to domains (Files, Projects, Connect, etc.)
- access to integrations
- access to billing
- access to vault

### **Project‑level**

- view
- edit
- comment
- manage
- archive

### **Item‑level**

- view
- edit
- delete
- share
- link/unlink

### **Integration‑level**

- connect
- disconnect
- manage keys
- manage settings

### **Automation‑level**

- create
- edit
- run
- delete

### **Vault‑level**

- read secrets
- write secrets
- delete secrets

---

## **19.5 Sharing Model**

Items can be shared with:

- individuals
- teams
- roles
- public (if enabled)

Sharing updates:

- local cache
- Supabase RLS policies
- search index
- activity feed

---

## **19.6 Offline Behaviour**

Permissions are cached locally so the UI behaves correctly offline.

### **Allowed offline**

- viewing cached items
- editing items you have access to
- creating new items
- linking items
- commenting
- uploading files (queued)

### **Not allowed offline**

- changing roles
- changing team membership
- changing integration settings
- accessing vault secrets

These require server validation.

---

## **19.7 Smart Eviction**

Permissions cache is small and rarely evicted, but:

- old team metadata
- old shared‑item lists
- old audit logs

…can be removed when stale and rehydrated later.

---

## **19.8 Audit Logs**

Supabase stores:

- who did what
- when
- which item
- which domain
- which integration

Local cache stores recent logs for offline viewing.

---

## **19.9 UI Integration**

Permissions appear in:

### **Share Dialog**

- invite users
- assign roles
- set item‑level permissions
- view access list

### **Team Panel**

- manage members
- assign roles
- remove members
- view pending invites

### **Integrations Panel**

- restrict who can manage providers
- restrict who can view API keys

### **Vault**

- restrict who can access secrets

### **Projects**

- project‑level access
- task‑level access

### **Files**

- file‑level access
- folder‑level access

---

## **19.10 ?‑Markers**

Permissions UI includes ?‑markers next to:

- roles
- access levels
- integration permissions
- vault access
- automation permissions

Help Peek explains:

- what each permission means
- recommended defaults
- security implications

Oscar receives full context.

---

## **19.11 Settings Peek (Permissions Settings)**

Includes:

- workspace roles
- custom roles
- domain access
- integration access
- automation access
- vault access
- audit logs
- team management

Each row includes label, input, ?‑marker, status.

---

## **19.12 Inbox Peek + Share‑to‑Oscar**

If a permission issue relates to an integration:

- Inbox Peek filters provider emails
- “Share to Oscar” extracts keys, tokens, DNS records
- Settings auto‑fill
- Permissions update accordingly

---

## **19.13 AI Context Model**

Oscar always knows:

- which item is being shared
- which role is being assigned
- which domain is affected
- which integration is involved
- which permission is being changed
- which Peek is open

Oscar can:

- explain roles
- propose access levels
- detect misconfigurations
- warn about security risks
- summarise team structure
- suggest custom roles

---

## **19.14 Security Guarantees**

- Supabase RLS enforces all permissions
- local cache never overrides server rules
- vault secrets are encrypted
- PIN unlock protects local data
- biometrics protect local unlock
- offline edits sync only if permissions allow

---

## **19.15 Cross‑Module Integration**

Permissions affect:

- Files (view/edit/delete)
- Workspace (page access)
- Projects (task access)
- Connect (campaign access)
- Timeline (event access)
- Dashboard (panel visibility)
- Map (pin visibility)
- Activity (event visibility)
- Search (result visibility)
- Integrations (provider access)
- Vault (secret access)

Every module respects the identity substrate.

---