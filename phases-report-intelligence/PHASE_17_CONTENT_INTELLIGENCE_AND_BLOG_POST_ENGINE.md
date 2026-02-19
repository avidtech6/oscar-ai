Phase 17 — Content Intelligence & Blog Post Engine
Status
🔵 Not Started
(Phase definition approved; awaiting kickoff)

Phase Summary
Phase 17 introduces a complete Content Intelligence System for Oscar AI, enabling the creation, editing, optimisation, scheduling, and publishing of:

Blog posts

Social media posts

SEO‑optimised content

Brand‑specific content for Cedarwood Tree Consultants

Brand‑specific content for Oscar’s Tree Academy

This subsystem mirrors the power of the Report Intelligence System, but is tailored for content creation, SEO, publishing, and distribution.

It includes:

A structured rich‑text editor (Word‑style)

AI Copilot for conversational editing

SEO engine

WordPress publishing (two sites)

Social media publishing

Unified media gallery integration

Scheduling & content calendar

Brand‑aware templates

PDF/Word export for blog posts

This phase lays the foundation for future integration with the Academy platform.

Objectives
1. Structured Rich‑Text Editor
A mobile‑first, desktop‑powerful editor supporting:

Bold, italic, underline

Headings

Lists

Quotes

Links

Inline images

Drag‑and‑drop (tablet/desktop)

Undo/redo

Clean WordPress‑compatible HTML output

Built on a structured block model (TipTap/ProseMirror style).

2. AI Copilot for Content Creation
Conversational editing layer enabling:

“Write a blog post about…”

“Rewrite this paragraph…”

“Add the photo of…”

“Improve SEO…”

“Schedule this for Monday…”

“Publish to Cedarwood WordPress…”

“Switch to Tree Academy tone…”

The AI must be able to read and update any field in the content model.

3. SEO Engine
Automatic generation of:

SEO title

SEO description

Keywords

Slug suggestions

OpenGraph metadata

Twitter card metadata

Image alt text

Image captions

Readability analysis

Keyword density

Internal/external link suggestions

SEO must adapt to the selected brand.

4. WordPress Publishing
Support for two separate WordPress sites:

Cedarwood Tree Consultants

Oscar’s Tree Academy

Features:

OAuth login

Draft publishing

Scheduled publishing

Featured image upload

Category selection

Tag selection

Custom fields

SEO field mapping (Yoast/RankMath)

5. Social Media Publishing
Generate and publish content to:

LinkedIn

Facebook

Twitter/X

Instagram (caption only)

TikTok (description only)

Features:

Brand‑aware tone

Hashtag generation

Image selection

Scheduling

Cross‑posting

6. Unified Media Gallery Integration
The blog system must use the same gallery as the report system.

Features:

Tagging

Brand tagging

Project tagging

Blog tagging

EXIF extraction

AI alt‑text generation

AI caption generation

Camera integration

Reuse across posts and reports

7. Content Templates
Templates for:

Case studies

Tree of the Week

Educational posts

Tree Academy lessons

Seasonal posts

Event announcements

Community updates

Tree safety advice

Templates include:

Structure

Tone

SEO pattern

Image placement

Call‑to‑action

8. Scheduling & Content Calendar
Features:

Schedule blog posts

Schedule social posts

Cross‑posting

Drag‑and‑drop rescheduling

Calendar view

AI suggestions for optimal posting times

9. PDF & Word Export
Blog posts must support:

Export to PDF

Export to Word (.docx)

Export to HTML

Export to Markdown

Using the Phase 15 rendering engine.

10. Brand Profiles
Each brand has:

Cedarwood Tree Consultants
Professional tone

Technical arboricultural language

SEO for tree services

LinkedIn‑focused

Oscar’s Tree Academy
Friendly, educational tone

Community‑focused

SEO for non‑profit

Facebook‑focused

The AI must switch tone, templates, and SEO strategy based on brand selection.

Required Files & Structure
Code
content-intelligence/
  editor/
    StructuredEditor.ts
    FormattingToolbar.ts
    BlockModel.ts
    HTMLSanitiser.ts

  ai/
    ContentCopilot.ts
    SEOAssistant.ts
    BrandToneModel.ts
    TemplateEngine.ts

  publishing/
    WordPressPublisher.ts
    SocialPublisher.ts
    SchedulingEngine.ts
    ContentCalendar.ts

  gallery/
    GalleryIntegration.ts
    ImageMetadataEngine.ts

  templates/
    blog-templates.ts
    social-templates.ts
    seo-templates.ts

  types/
    BlogPost.ts
    SocialPost.ts
    SEOData.ts
    BrandProfile.ts

  integration/
    Phase15Integration.ts
    Phase18Integration.ts
    Phase19Preparation.ts

  tests/
    editor-tests.ts
    seo-tests.ts
    wordpress-tests.ts
    social-tests.ts
    scheduling-tests.ts
Architecture Overview
Code
Content Intelligence System
├── Structured Editor
│   ├── Block model
│   ├── Formatting
│   └── Clean HTML output
├── AI Copilot
│   ├── Content generation
│   ├── SEO optimisation
│   ├── Brand tone switching
│   └── Template application
├── Publishing Engine
│   ├── WordPress integration
│   ├── Social media integration
│   └── Scheduling
├── Unified Gallery Integration
│   ├── Image selection
│   ├── Metadata extraction
│   └── AI alt‑text
└── Content Calendar
    ├── Scheduling
    ├── Cross‑posting
    └── AI timing suggestions
Completion Criteria
Phase 17 is complete when:

✔ Structured editor implemented

✔ AI Copilot integrated

✔ SEO engine functional

✔ WordPress publishing functional

✔ Social publishing functional

✔ Unified gallery integrated

✔ Templates implemented

✔ Scheduling engine implemented

✔ Content calendar functional

✔ PDF/Word export functional

✔ Brand profiles implemented

✔ Documentation updated

✔ CHANGELOG updated

✔ Phase 17 completion report generated

Notes
Phase 17 prepares the system for Phase 19, where Oscar AI will integrate with the future Academy platform as a publishing target.