---

# **MODULE 14 — NOTIFICATIONS & ACTIVITY (CONDENSED VERSION)**

## **14.1 Purpose**

Notifications & Activity is the system’s **awareness layer**, giving the user a unified, intelligent feed of:

- mentions
- comments
- approvals
- assignments
- status changes
- automation events
- campaign events
- timeline changes
- file updates
- document edits
- integration alerts
- errors + warnings

It ensures the user always knows what matters without noise or overload.

---

## **14.2 Layout**

**Desktop:** Sidebar → Header → Activity Feed → Right Panel

**Mobile:** Header → Feed → Bottom bar → Sheets for detail views

Feed items behave like mini‑cards.

Selecting one opens the related item in the right panel.

---

## **14.3 Activity Item Types**

- Mention
- Comment
- Reply
- Task assignment
- Status change
- Due date change
- Milestone reached
- Campaign step completed
- Email sent / failed
- Social post published / failed
- Automation triggered / errored
- File added / updated
- Document edited
- Integration connected / failed
- System alerts

Each item inherits identity + metadata from its source.

---

## **14.4 Feed Views**

- **All activity**
- **Mentions**
- **Assigned to me**
- **Projects**
- **Connect**
- **Timeline**
- **Files**
- **Workspace**
- **Automations**
- **Errors / warnings**

Filters appear in the left rail.

---

## **14.5 Card Identity**

Activity items use the unified identity system:

- photostrip
- fit modes
- rounded‑top mask
- show/hide on front/back
- card‑front templates

---

## **14.6 Metadata**

Each activity item shows:

- actor
- action
- timestamp
- linked item
- preview snippet
- status (success, warning, error)

Metadata is collapsible.

---

## **14.7 Actions**

- open item
- reply
- resolve
- mark as read
- pin
- mute
- summarise
- extract tasks
- link to project
- delete

---

## **14.8 Preview/Editor (for expanded items)**

When an activity item is expanded:

- shows full detail
- supports inline replies
- supports linked items
- supports inline media

Modes: collapsed, normal, full‑page, full‑screen.

---

## **14.9 Interactive Media**

Supports:

- Peek
- Gallery context
- Select for gallery
- Add to photostrip
- Replace card image
- Fit modes
- View on map

---

## **14.10 Activity‑Specific Behaviours**

- **Threading:** related events collapse into a thread
- **Smart grouping:** similar events grouped (e.g., “5 tasks updated”)
- **Priority surfacing:** important items bubble up
- **Error highlighting:** integration failures appear at top
- **Cross‑domain linking:** selecting an item highlights it across domains
- **Quiet hours:** optional suppression window

---

## **14.11 ?‑Markers in Activity Items**

Every expanded activity item supports **? markers**:

- next to the action description
- next to metadata fields
- next to integration errors
- next to automation logs

Clicking ? opens a **Help Peek** with:

- context‑aware questions
- short explanation
- link to documentation/templates

Oscar receives exact event context.

---

## **14.12 Settings Peek (Notifications Settings)**

Settings Peek includes:

- notification types (toggle on/off)
- quiet hours
- priority rules
- grouping rules
- email/push preferences
- integration alerts
- automation error alerts
- digest frequency

Each setting row includes:

- label
- input
- **? icon**
- status

---

## **14.13 Inbox Peek + Share‑to‑Oscar**

If an activity item relates to an integration error:

Oscar can ask:

> “Do you have a setup/welcome email for this provider?”
> 

Inbox Peek opens with filtered emails.

Each email has **Share to Oscar**.

Sharing fills settings automatically and resolves the alert.

---

## **14.14 AI Context Model**

Oscar always knows:

- which activity item
- which domain it came from
- which metadata changed
- which error or warning is active
- which Peek (Settings, Help, Inbox)

Oscar can:

- explain the event
- propose fixes
- resolve errors
- summarise activity
- detect patterns
- suggest next actions
- generate tasks
- link items

---