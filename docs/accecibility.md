Here’s a **tailored accessibility audit checklist + report template** for your Next.js + Tailwind CSS + Radix UI + shadcn/ui web-app. Everything listed is free to use. Because you wanted blunt feedback: it’s fairly comprehensive; expect a non-trivial amount of work.

---

## 📋 Free Reference Checklists

* The WebAIM WCAG 2 checklist — free PDF. ([webaim.org][1])
* The The A11Y Project Checklist — free, covers WCAG A & AA. ([a11yproject.com][2])
* The Deque Systems Web Accessibility Checklist — free web version. ([dequeuniversity.com][3])
* Tool list (free evaluation tools) by W3C. ([W3C][4])

Use these as your baseline references.

---

## ✅ Audit Template & Checklist for Your Stack

Below is the audit template structured into sections. For each item you’ll record: **Page/Component**, **Issue**, **Severity**, **Recommendation**, **Status**.
You can copy into a spreadsheet or document. Then I follow with a “Detailed Report of what to implement”.

### Section A – Global & Site-wide

| #   | Checkpoint                                                                                              | Why it matters                                          |
| --- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| A1  | HTML `lang` attribute is set on `<html>` (e.g., `lang="he"` for Hebrew)                                 | Screen-readers need language tag to pronounce correctly |
| A2  | When content switches language (e.g., English quote inside Hebrew page) use `lang="en"` on that element | Helps multi-lingual users & screen-readers              |
| A3  | Skip-to-content link exists (first interactive focusable item)                                          | Allows keyboard users to bypass repetitive nav          |
| A4  | Keyboard focus is visible (custom styles don’t hide outline)                                            | Essential for operability                               |
| A5  | Site is zoomable/resizable (up to at least 200% text size) without layout breaking                      | Complies with WCAG text-resize requirements             |
| A6  | Colour is not the sole means of conveying information                                                   | Ensures users with colour-blindness still get meaning   |
| A7  | Contrast ratios: normal text ≥ 4.5:1; large text ≥ 3:1                                                  | Usability for low-vision users                          |
| A8  | No content that flashes more than 3 times per second (or large area)                                    | Prevents seizure risk                                   |
| A9  | Responsive design: works at mobile widths, orientation changes, high-zoom modes                         | Many users use mobile or magnified view                 |
| A10 | Accessibility statement & contact info page present                                                     | Required by many regulations (including Israel’s)       |

### Section B – Navigation & Layout

| #  | Checkpoint                                                                                               |
| -- | -------------------------------------------------------------------------------------------------------- |
| B1 | Navigation is consistent across pages (same structure, ordering)                                         |
| B2 | All interactive elements (links/buttons/menus) reachable via Tab/Shift+Tab                               |
| B3 | Navigation landmarks (`<nav>`, `<main>`, `<footer>`, `role="banner"`, etc) present                       |
| B4 | For modal/dialogs: when opened, focus moves into dialog; background is inert; when closed, focus returns |
| B5 | Breadcrumbs or clear path for user orientation (especially on deep dashboards)                           |
| B6 | In multi-admin tenancy UI: “which tenant am I in?” is clearly indicated; switching contexts accessible   |

### Section C – Content & Components

| #   | Checkpoint                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------- |
| C1  | Headings use proper hierarchy (`<h1>`, `<h2>`, …). No skipping levels                                                       |
| C2  | Images: meaningful images have `alt` text; decorative images have `alt=""` or via CSS background                            |
| C3  | Videos: captions/subtitles; if audio content only, transcript or text alternative                                           |
| C4  | Form controls: every input has a `<label>` or `aria-label`; error messages identified to screen‐reader (`aria-describedby`) |
| C5  | Buttons: descriptive text (not only icon unless there’s `aria-label`)                                                       |
| C6  | Tabs, accordions, dropdowns built with accessible patterns (roles, keyboard support, focus management)                      |
| C7  | Dynamic content (e.g., updates in dashboard) uses `aria-live` or equivalent to notify assistive tech                        |
| C8  | Tables for data: proper markup (`<th>`, `scope`, `headers`) and understandable layout for screen‐reader                     |
| C9  | Links: meaningful text (“View message statistics” not “Click here”)                                                         |
| C10 | Right-to-Left (RTL) support for Hebrew: ensure directional attributes and mirroring correct                                 |

### Section D – Forms & Interactive Workflows

| #  | Checkpoint                                                                                                                     |
| -- | ------------------------------------------------------------------------------------------------------------------------------ |
| D1 | All form fields have focus order logical and visible focus styles                                                              |
| D2 | Validation errors clearly identified and described; user agents announce them                                                  |
| D3 | Time limits (if any) provide warning and option to extend/cancel                                                               |
| D4 | Autocomplete, input modes used when appropriate (`autocomplete="email"`, `inputmode`, etc)                                     |
| D5 | All keyboard shortcuts can be disabled or remapped; no custom single-key shortcuts without opt-out                             |
| D6 | Multi-step workflows (e.g., SaaS signup, payment) accessible: clear expectation of where user is, next/previous, skip optional |
| D7 | Captchas (if used): provide accessible alternative (audio/text)                                                                |

### Section E – Media & Downloadables

| #  | Checkpoint                                                                                                                 |
| -- | -------------------------------------------------------------------------------------------------------------------------- |
| E1 | Audio/Video: captions, transcripts, audio descriptions (if needed)                                                         |
| E2 | Auto-play media: provides pause/stop/volume control                                                                        |
| E3 | Downloadable docs (PDFs, Word) are accessible: tagged, structured, correctly labelled                                      |
| E4 | Embedded third-party content (e.g., widget, chat plugin): must be keyboard operable and accessible or alternative provided |

### Section F – Technology & Code Specific to Next.js / Tailwind / Radix / shadcn

| #   | Checkpoint                                                                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | On route change (`router.push` or `Link`), focus moves to main content area (e.g., `<main>` or first heading). Helps keyboard/reader users know new page loaded.                                                              |
| F2  | Use semantic HTML rather than purely div/span. For example: `<button>` not a `<div role="button">` unless absolutely needed. Radix UI helps but verify.                                                                       |
| F3  | Radix/shadcn/ui components: verify they expose ARIA roles/states correctly; if customizing, don’t break accessibility features.                                                                                               |
| F4  | Ensure hydration of SSR/CSR does not remove accessibility attributes or change DOM in a way that breaks focus order.                                                                                                          |
| F5  | Tailwind custom styling: don’t remove default focus outlines without providing substitute visual indicator.                                                                                                                   |
| F6  | Ensure dynamic imports or lazy loaded components still maintain accessibility (e.g., proper aria-label when content appears).                                                                                                 |
| F7  | Skip animations or provide motion-reduced alternative: Tailwind + CSS should respect `prefers-reduced-motion`.                                                                                                                |
| F8  | Dark mode / high-contrast mode: ensure theme switch retains contrast and navigation usability.                                                                                                                                |
| F9  | Use continuous integration (you mentioned Cypress) to include accessibility checks: e.g., integrate `axe-core` or equivalent into your test suite.                                                                            |
| F10 | Multi-tenant UI: if multiple tenant dashboards are rendered conditionally, ensure that each tenant’s content is properly labelled/announced to screen-readers (“Tenant X Dashboard”) so user knows which context they are in. |

---

## 📄 Detailed Report: What to Implement

For each of the above sections, here’s a recommended implementation plan for your app, in order of priority **with blunt call-outs**.

### Priority 1 (High risk & impact)

1. **Keyboard Navigation & Focus Management**

   * Ensure all interactive UI (dashboard nav, bots list, modals) works without mouse.
   * On each route change, programmatically set focus to the page heading (use Next.js `useEffect` + `router.events`).
   * For modals/popups (your QR scan modal, admin switch modal): trap focus inside modal, set `aria-modal="true"`, background inert.

2. **Semantic HTML & Labels**

   * Audit your custom components: ensure each `<button>`, `<a>` uses the correct tag, not mis-used `<div>`.
   * Add `alt` text to all meaningful images (icons used only decorative should use `alt=""`).
   * Ensure all form inputs have labels or `aria-labelledby` / `aria-label`.

3. **Contrast & Resizing**

   * Check your Tailwind colour palette: make sure text against backgrounds meet contrast thresholds (≥ 4.5:1 for normal text).
   * Verify that when the user zooms browser to 200% or increases font size in OS, layout doesn’t break (especially your SaaS dashboards).

4. **Accessibility Statement & Contact Info**

   * Create a dedicated page, e.g., `/accessibility`. In Hebrew and English.
   * State: level of compliance (e.g., targeting IS 5568 / WCAG 2.1 AA), known exceptions, contact email/phone for accessibility issues.

### Priority 2 (Medium risk)

5. **Dynamic Content Announcements**

   * On dashboards where message counts, real-time stats change, use `aria-live="polite"` or `assertive` for important updates.
   * For tenancy switch, announce via screen-reader: e.g., when user switches tenants: “You are now viewing Tenant X”.

6. **Multi-language & RTL Support**

   * Since you support Hebrew/English/Russian: check `dir="rtl"` is applied where required; check layout mirror for RTL.
   * Use `lang="he"` for Hebrew pages and indicate language changes inside paragraphs.

7. **Document/Downloadable Content Accessibility**

   * If you provide PDFs (e.g., QA docs, CI/CD docs), ensure they’re tagged PDFs with correct heading structure and alt text for images.
   * Provide accessible HTML alternative if possible.

### Priority 3 (Lower risk but still required)

8. **Media & Motion**

   * If you have animations (modals slide in, dashboard stats animate), respect `prefers-reduced-motion` CSS setting.
   * If you have videos/audio anywhere: captions/transcripts.
   * Avoid auto-play content without an option to pause/stop.

9. **Third-party Widgets & Integrations**

   * Review any embedded chat plugin, analytics widget, or payment module: ensure keyboard operability or provide alternative.
   * If embedding external iFrame, ensure `title` attribute set and focus behaviour documented.

10. **CI/Testing Integration**

    * Integrate accessibility testing in your Cypress/Playwright pipeline: e.g., run `axe-core` on major flows (login, dashboard, settings).
    * Add code review checklist items for accessibility (semantics, focus, labels, contrast).
    * Document accessibility remediation tasks in backlog and assign owners.

### Ongoing Maintenance

* Make accessibility part of your new feature definition: when you add a new component (via shadcn/ui or custom), ensure accessibility attributes are part of the template.
* Schedule periodic audit (semi-annual) using both automated scans and manual keyboard/screen-reader check.
* Keep tracked issues in your backlog; label with severity (High = keyboard/operable issues, Medium = contrast/issues, Low = informative/alt-text).
* For your multi-tenancy SaaS model: each new tenant’s dashboard should be tested for accessibility during onboarding (so you don’t ship inaccessible views).
* Maintain a public accessibility statement with date of last review & version of compliance.

---

## 📌 Summary

* Use the free checklists referenced above to guide you (WebAIM, A11Y Project, Deque).
* Focus first on keyboard operability, semantic markup, contrast/resizing, and your accessibility statement.
* Then move to dynamic content, multilingual/RTL support, media, third-party widgets.
* Finally, integrate accessibility into your dev/test workflow to avoid regressions.
* **Risk** if you skip: since you are subject to Israeli rules (e.g., IS 5568), you expose your SaaS to legal/non-compliance risk (and bad user experience).

---

If you like, I can **generate a downloadable spreadsheet (Excel/Google Sheets) version** of this template with all the checkpoints and columns pre-filled, plus a Hebrew version of the checklist for your Israel-based team. Do you want that?

[1]: https://webaim.org/standards/wcag/checklist?utm_source=chatgpt.com "WebAIM's WCAG 2 Checklist"
[2]: https://www.a11yproject.com/checklist/?utm_source=chatgpt.com "Checklist - The A11Y Project"
[3]: https://dequeuniversity.com/checklists/web/?utm_source=chatgpt.com "Web Accessibility Checklist - Deque University"
[4]: https://www.w3.org/WAI/test-evaluate/tools/list/?utm_source=chatgpt.com "Web Accessibility Evaluation Tools List - W3C"
