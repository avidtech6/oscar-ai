---

# **MODULE 13 — INTEGRATIONS & HELP SYSTEM (CONDENSED VERSION)**

## **13.1 Purpose**

Integrations & Help System provides the **intelligent configuration layer** for:

- Provider connections (email, social, CMS, analytics, CRM)
- System‑level settings
- Contextual help for any field or document section
- Automatic setup via email ingestion
- AI‑aware guidance and autofill

It ensures users never face a confusing settings page or documentation hunt.

---

## **13.2 Integration Surfaces**

Integrations appear in three places:

- **Settings Peek** — configuration for providers + system settings
- **Help Peek** — contextual help for any field or document block
- **Inbox Peek** — filtered emails for auto‑setup (“Share to Oscar”)

All three are Peeks that slide over the right panel.

---

## **13.3 Settings Peek**

Settings Peek is the **primary integration cockpit**.

### Appears in:

- Connect (email, social, blog, SEO, automations)
- Timeline (automation triggers, campaign schedules)
- Projects (campaign/automation‑linked items)
- System settings

### Supports:

- Gmail / Google Workspace
- Brevo / Sendinblue
- SMTP
- DKIM / SPF
- Tracking pixels
- Unsubscribe defaults
- Meta / Instagram
- LinkedIn
- X
- TikTok
- YouTube
- WordPress / Ghost / Webflow
- CRM + API keys
- Webhooks

### Each setting row includes:

- Label
- Input
- **? icon**
- Connection status

---

## **13.4 Help Peek**

Help Peek opens when the user taps a **? icon** next to:

- any setting
- any document section/block
- any dashboard metric
- any timeline item
- any campaign/email/social/blog field

### Help Peek contains:

- **Context‑aware questions** (tappable)
- Short explanation of the field/section
- Link to documentation/templates
- Oscar’s responses inline

Oscar receives exact context: field, block, panel, or setting.

---

## **13.5 ?‑Markers in Documents & Editors**

Every editable block can show a **? icon** on hover/focus:

- headings
- paragraphs
- lists
- tables
- galleries
- code blocks
- embedded media

Clicking opens Help Peek with relevant questions and guidance.

---

## **13.6 Inbox Peek + Share‑to‑Oscar**

When configuring providers, Oscar can ask:

> “Do you have a setup/welcome email for this provider?”
> 

If yes:

- **Inbox Peek** opens
- Emails are pre‑filtered by subject/sender/content
- Each email shows **Share to Oscar**
- Opening an email shows Email View Mode
- Sharing fills settings automatically
- User returns to Settings Peek

Oscar extracts:

- API keys
- SMTP credentials
- verification codes
- DNS instructions
- webhook URLs
- tracking IDs
- account IDs

---

## **13.7 AI‑Aware Setup Guidance**

Oscar can:

- explain what each provider does
- guide sign‑up
- explain required permissions
- walk through domain verification
- generate DNS records
- validate API keys
- test SMTP
- test webhooks
- suggest defaults
- detect misconfigurations

Oscar becomes the **integration assistant**, not just a chatbot.

---

## **13.8 Security Model**

- Sensitive values stored only in secure vault
- Oscar can fill but not freely display secrets
- User must confirm before saving
- Oscar can test connections and report success/failure

---

## **13.9 Device Behaviour**

**Desktop:** Peeks slide over right panel

**Mobile:** Peeks become full‑height sheets with back navigation

---

## **13.10 AI Context Model**

Oscar always knows:

- Domain (Files, Workspace, Map, Connect, Projects, Timeline, Dashboard)
- Item (card)
- Module (editor, metadata, settings)
- Active Peek (Settings, Help, Inbox)
- Exact field or block

This enables precise, contextual assistance everywhere.

---