---

# **MODULE 18 — IDENTITY & USER PROFILE (FULLY REWRITTEN)**

## **18.1 Purpose**

Identity & User Profile is the system’s **authentication, personalisation, and security layer**, responsible for:

- sign‑in
- persistent sessions
- PIN unlock
- biometrics
- user profile
- preferences
- AI behaviour
- connected accounts
- organisation/team
- billing
- vault access

Every module reads from this identity substrate.

---

## **18.2 Sign‑In Model**

A hybrid model combining simplicity, security, and persistence.

### **Magic Link (first login on a device)**

- user enters email
- receives one‑time link
- clicking signs them in
- no passwords
- no OAuth
- no Google

### **Persistent Session**

Supabase issues:

- long‑lived refresh token
- short‑lived access token

Stored locally for instant load.

### **PIN Unlock (single PIN, stored once)**

One PIN, one hash, two roles:

- stored in Supabase (canonical)
- cached locally (fast unlock)

Used to unlock the cockpit without re‑authenticating.

### **Biometric Unlock**

If supported:

- FaceID
- TouchID
- Windows Hello

PIN is fallback.

---

## **18.3 What is stored locally**

- session token
- PIN hash (cached copy)
- biometric flag
- profile
- preferences
- AI settings
- local search index
- local workspace

This ensures instant load and offline access.

---

## **18.4 Profile Panels**

- Personal Info
- Preferences
- AI Preferences
- Connected Accounts
- Security
- Organisation / Team
- Billing
- Storage
- Integrations

Each panel is a card with identity + metadata.

---

## **18.5 Personal Info**

- name
- profile photo
- email
- timezone
- locale
- signature

Used across all modules.

---

## **18.6 Preferences**

Controls UI behaviour:

- theme
- density
- language
- date/time format
- editor defaults
- gallery defaults
- notification preferences
- ?‑marker visibility

---

## **18.7 AI Preferences**

Controls Oscar’s behaviour:

- tone
- verbosity
- context depth
- auto‑suggestions
- inline help behaviour

Oscar adapts globally.

---

## **18.8 Connected Accounts**

Includes:

- email providers
- social platforms
- CMS
- analytics
- CRM
- cloud storage

Each row shows provider, status, and a ?‑marker.

---

## **18.9 Security**

Includes:

- set/change/remove PIN
- enable biometrics
- active sessions
- device management
- vault access
- recovery email

PIN is always:

- hashed
- stored in Supabase
- cached locally
- never duplicated
- never stored in plain text

---

## **18.10 Organisation / Team**

Supports:

- team members
- roles
- permissions
- groups
- shared items
- audit logs

Used by Projects, Files, Connect, Activity.

---

## **18.11 Billing**

- plan
- usage
- invoices
- payment methods
- add‑ons

---

## **18.12 Storage**

- total usage
- per‑domain usage
- vault usage
- large files
- duplicates
- archive mode

---

## **18.13 Integrations Panel**

Global view of all provider connections:

- email
- social
- CMS
- analytics
- CRM
- webhooks
- API keys

---

## **18.14 ?‑Markers**

Every panel supports ?‑markers:

- next to fields
- next to settings
- next to permissions
- next to billing items
- next to integration rows

Opens Help Peek with context‑aware guidance.

---

## **18.15 Settings Peek (Profile Settings)**

Includes:

- appearance
- AI preferences
- notifications
- security
- connected accounts
- integrations
- billing
- organisation

---

## **18.16 Inbox Peek + Share‑to‑Oscar**

If a connected account requires setup:

- Inbox Peek filters emails
- “Share to Oscar” extracts keys, tokens, DNS records
- Settings auto‑fill

---

## **18.17 AI Context Model**

Oscar always knows:

- which profile panel is open
- which setting is active
- which integration is being configured
- whether PIN/biometrics are enabled
- which Peek is open

Oscar can:

- explain settings
- propose defaults
- detect misconfigurations
- validate integrations
- summarise profile
- guide security setup