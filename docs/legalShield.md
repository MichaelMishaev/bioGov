Perfect—here’s a **max-detail, AI-ready legal risk & mitigation pack** for your Israel-focused “bureaucracy helper” PWA. It’s structured so you can **drop text into the app**, **seed your DB**, and **train prompts**. I’ve included **authoritative 2024–2025 sources** and **copy-paste exec text** you can use today (free). Not legal advice.

---

# 1) High-risk areas (Israel) → no-cost mitigations → drop-in text

## A) Consumer protection (misleading content; unfair terms; jurisdiction)

* **Risk**: If you target Israelis, **Israeli law applies** even if your ToS says otherwise (Agoda ruling, 2024). “Advice only” doesn’t fully shield you if info is wrong/misleading. ([Pearl Cohen][1])
* **Law**: **Consumer Protection Law, 5741-1981**; **Standard Contracts Law, 1982** (unfair terms). ([WIPO][2])

**Free mitigations**

* Israel-specific ToS (do **not** rely on foreign law).
* Prominent “not government / info-only” notices everywhere you give guidance.
* “Last updated” stamp + **deep link to official page** on every checklist item.

**Drop-in ToS clause (jurisdiction)**

> **Governing Law & Venue.** These Terms are governed by the **laws of the State of Israel**, and the **competent courts in Israel** have exclusive jurisdiction. ([Pearl Cohen][1])

**Drop-in banner (top of guidance pages)**

> **Not an official government service.** Guidance only—**verify** with the official source below. **Last updated:** {{DD MMM YYYY}} • **Official source:** {{Authority}} → {{gov.il deep link}}. ([Government of Israel][3])

## B) Passing-off / state symbols (don’t look “official”)

* **Risk**: Confusing users you are “official” + **using flag/emblem** without permit. ([Adalah][4])

**Free mitigations**

* Avoid gov palettes/crests; footer badge stating non-affiliation.

**Drop-in footer badge**

> Independent service • **Not affiliated** with any ministry/authority • **No** state emblems used. ([Adalah][4])

## C) Privacy & data security (databases in Israel; cross-border)

* **Risk**: Privacy law + **Data Security Regulations (2017)**; PPA guidance on **transfers abroad**; Amendment trends in 2025. ([Government of Israel][5])

**Free mitigations**

* **Minimize** data (store business type + municipality + task status; avoid documents when possible).
* Role-based access, named admin accounts, 2FA; encrypt sensitive IDs; breach plan one-pager.
* If hosting outside IL: state transfer basis per **PPA guideline**. ([Government of Israel][5])

**Privacy notice (core lines)**

> We collect the **minimum** data needed (e.g., business type, city, filing status). We **do not** sell personal data. Data is stored in **{{Israel/specified}}**. If processed abroad, we apply measures consistent with Israel’s **Privacy Protection Law** and the **Data Security Regulations (2017)** and the PPA’s **cross-border guidance**. Contact: privacy@{{domain}}. ([WIPO][6])

## D) Accessibility (web/app)

* **Risk**: Public-facing services are expected to meet **IS 5568 / WCAG AA** practices; gov guidance published. ([Government of Israel][7])

**Free mitigations**

* Semantic HTML, keyboard nav, labels/alt; run **WAVE/AXE**; publish an **Accessibility Statement**.

**Drop-in Accessibility Statement (short)**

> We aim to meet **WCAG 2.0 AA / IS 5568**. If you face an issue, email **access@{{domain}}** and we’ll work to resolve promptly. ([Government of Israel][7])

## E) Anti-spam (marketing)

* **Risk**: **Amendment 40** to the Communications Law—opt-in needed; clear unsubscribe. ([Government of Israel][8])

**Free mitigations**

* Separate **marketing** checkbox (unchecked), consent log, one-click unsubscribe.

**Signup checkbox**

> ☑ I agree to receive **marketing updates** (email/SMS). I can unsubscribe at any time. ([Government of Israel][8])

## F) Drifting into regulated “professional advice”

* **Risk**: If you go beyond general guidance into tailored legal/tax advice, liability increases. Keep it **general**; push edge cases to pros + official links. ([Government of Israel][3])

**On “edge-case” routes**

> Your situation may require **personal professional advice**. Consider consulting a certified accountant/attorney. **Official instructions:** {{gov.il link}}. ([Government of Israel][9])

## G) E-signatures / acting on user’s behalf

* **Risk**: If you collect signatures or submit on users’ behalf, learn **Electronic Signature Law, 2001**; refer users to official **Certification Authorities**. ([portal.mycertiphi.com][10])

**Free mitigations**

* Prefer **client-side pre-fill** + download; if capturing signatures, clarify type (basic vs secure).
* Link users to **Registrar of Certification Authorities** info. ([Government of Israel][11])

**Inline note near any “Sign/Submit” action**

> E-signatures in Israel are governed by the **Electronic Signature Law (2001)**. For filings requiring a **secure** signature, use a certified provider. ([portal.mycertiphi.com][10])

---

# 2) AI-ready “official sources” map (deep links you can surface in UI)

| Journey                                       | Primary authority                  | Deep link                                                                    |
| --------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| **VAT (מע״מ) overview**                       | Israel Tax Authority               | VAT hub. ([Government of Israel][12])                                        |
| **Open a company (חברה בע״מ)**                | Corporations Authority (MoJ)       | Online registration service. ([Government of Israel][13])                    |
| **Companies/Partnerships information**        | Corporations Authority             | About + units (Companies/Partnerships/Pledges). ([Government of Israel][14]) |
| **Self-employed (עצמאי) – register / status** | National Insurance (Bituach Leumi) | Self-employed registration / status / benefits. ([www.btl.gov.il][15])       |
| **Business licensing (רישוי עסקים)**          | Interior/Local muni                | National law + local portals (e.g., Jerusalem). ([Government of Israel][16]) |
| **Consumer protection authority**             | CPFTA (Gov.il)                     | Landing page. ([Government of Israel][3])                                    |
| **Data security regs (English)**              | Gov.il (PPA)                       | Unofficial EN translation PDF. ([Government of Israel][17])                  |
| **Website accessibility guidance**            | Gov.il                             | Guidance page. ([Government of Israel][7])                                   |
| **Registrar of Certification Authorities**    | MoJ                                | CA registrar (for secure e-sigs). ([Government of Israel][11])               |

> Tip: expose these as **inline “Source” chips** alongside each step in your wizard.

---

# 3) Ready-to-paste legal pages (MVP)

## 3.1 `/legal/terms` (condensed)

* **Nature of Service**: general info; **not** legal/tax advice; verify officially. ([WIPO][2])
* **Non-Affiliation**: not a government service; no state emblems. ([Adalah][4])
* **Accuracy/Updates**: deep links + last-updated dates; user must verify. ([Government of Israel][3])
* **User Responsibility**: you are responsible for filings.
* **Limitation of Liability**: MVP cap (e.g., ₪100) and “as-is”.
* **Governing Law / Venue**: Israel + Israeli courts. ([Pearl Cohen][1])
* **IP / Passing-Off**: no government branding; no implied endorsement. ([afiklaw.com][18])
* **Marketing**: separate opt-in; easy unsubscribe. ([Government of Israel][8])

## 3.2 `/legal/privacy` (condensed)

* **What we collect**: minimal profile (business type, city), usage logs; documents only if user uploads.
* **Why**: show relevant checklists; send service notices.
* **Where stored**: Israel (or specify); transfers abroad per PPA guidance. ([Government of Israel][5])
* **Security**: practices aligned to **Data Security Regulations 2017**. ([Government of Israel][17])
* **Retention**: logs 90 days; uploads auto-delete after {{30/60}} days.
* **Your rights**: access/correct/delete under Israeli law. ([WIPO][6])

## 3.3 `/legal/accessibility`

* Commit to **IS 5568 / WCAG AA**; feedback channel. ([Government of Israel][7])

---

# 4) No-budget compliance operations (so you can *prove* diligence)

## Content freshness (Google Sheet)

Columns: **Page | Authority | Link | Last checked | Next check (≤90d) | Reviewer | Change note**.
Why: If a user complains “you were outdated,” you show a routine. (Consumer fairness expectations.) ([Government of Israel][3])

## Link checks (monthly)

Ping all **gov.il** links + 3rd-party laws (WIPO/Ministry PDFs). Log results.

## Admin security basics

Named accounts only; least privilege; 2FA; quarterly access review (log pass/fail). Aligns to **Data Security Regs**. ([Government of Israel][17])

## Consent log (anti-spam)

Store: user_id, channel, timestamp, method (“web-checkbox”). Required under **Amendment 40** expectations. ([Government of Israel][8])

## Accessibility smoke tests

Run WAVE/AXE monthly; log issues → tickets; reference **Gov.il accessibility** page. ([Government of Israel][7])

---

# 5) AI-ready data structures (seed these in your DB)

### 5.1 Legal banners (JSON)

```json
{
  "legal_banners": [
    {
      "key": "not_gov_info_only",
      "placement": "top_of_guidance",
      "text": "Not an official government service. Guidance only—verify with the official source below.",
      "i18n": {"he": "שירות עצמאי. אינו שירות ממשלתי רשמי. המידע כללי בלבד—בדקו בקישור הרשמי."},
      "sources": [
        {"label": "Consumer Protection Authority", "url": "https://www.gov.il/en/departments/consumer_protection_and_fair_trade_authority"}
      ],
      "updated_at": "2025-10-30"
    },
    {
      "key": "footer_non_affiliation",
      "placement": "footer",
      "text": "Independent service • Not affiliated with any ministry/authority • No state emblems used",
      "sources": [{"label": "Flag & Emblem Law", "url": "https://www.adalah.org/.../Flag-and-Emblem-Law-1949.pdf"}]
    }
  ]
}
```

### 5.2 Jurisdiction & consent (YAML)

```yaml
tos:
  governing_law: "State of Israel"
  venue: "Courts of Israel"
  liability_cap_nis: 100
privacy:
  storage_location: "IL"
  cross_border_transfers_policy_url: "https://www.gov.il/en/pages/data_security_regulation"
marketing:
  consent_required: true
  unsubscribe_required: true
  law_reference: "Communications Law - spam rules"
```

### 5.3 “Official source” chips (per checklist step)

```json
{
  "steps": [
    {
      "id": "vat_open_file",
      "title": "Open VAT file (עוסק)",
      "official_source": {"label": "Israel Tax Authority — VAT", "url": "https://www.gov.il/en/departments/topics/value_added_tax"},
      "last_checked": "2025-10-30"
    },
    {
      "id": "bituach_self_employed",
      "title": "Register as self-employed for NII",
      "official_source": {"label": "Bituach Leumi — Self-Employed", "url": "https://www.btl.gov.il/English%20Homepage/Insurance/National%20Insurance/Detailsoftypes/SelfEmployedPerson/Pages/HowtoRegister.aspx"},
      "last_checked": "2025-10-30"
    },
    {
      "id": "company_registration",
      "title": "Register a Company (חברה בע״מ)",
      "official_source": {"label": "Corporations Authority — Register a Company", "url": "https://www.gov.il/en/service/company_registration"},
      "last_checked": "2025-10-30"
    },
    {
      "id": "business_license",
      "title": "Check if your business needs a license",
      "official_source": {"label": "Business Licensing Law (1968) — Gov.il", "url": "https://www.gov.il/en/pages/business_licensing_law_1968"},
      "last_checked": "2025-10-30"
    }
  ]
}
```

---

# 6) “Executive text” (copy/paste)

## 6.1 Short ToS header

> We provide **general guidance** to help small businesses navigate public procedures. We are **not a government body** and **do not provide legal, tax, or accounting advice**. Requirements may change without notice; **always verify** with the competent authority or consult a professional. ([WIPO][2])

## 6.2 Privacy header

> We collect the **minimum** data needed to tailor checklists (e.g., business type, city). Data is stored in **{{Israel/specified}}** and, if processed abroad, is handled as required by Israel’s **Privacy Protection Law** and **Data Security Regulations (2017)**. You can access/correct/delete your data via **privacy@{{domain}}**. ([WIPO][6])

## 6.3 Accessibility header

> We strive to meet **WCAG 2.0 AA / IS 5568**. If you encounter an accessibility issue, contact **access@{{domain}}** and we will work to resolve it promptly. ([Government of Israel][7])

## 6.4 Email footer (marketing)

> You are receiving this because you **opted-in**. **Unsubscribe** | **Preferences**. ([Government of Israel][8])

## 6.5 E-signature notice (when relevant)

> E-signature use is governed by Israel’s **Electronic Signature Law (2001)**. For actions requiring a **secure** e-signature, use a certified provider. ([portal.mycertiphi.com][10])

---

# 7) What to **avoid** (cheap risk killers)

* Don’t use blue-white seals or the **state emblem/flag** in UI/marketing. ([Adalah][4])
* Don’t promise: “this form will be accepted” or “this is the only path”.
* Don’t blend marketing consent into ToS acceptance (keep **separate checkbox**). ([Government of Israel][8])
* Don’t store uploads if you can **pre-fill client-side** and let users download.
* Don’t hard-code foreign law or foreign courts in ToS (for Israeli users). ([Pearl Cohen][1])

---

# 8) Extra references (for your AI/prompts)

* **Consumer Protection Law (English)** — WIPO. ([WIPO][2])
* **Standard Contracts Law (English PDF)** — unfair terms. ([goslaw.co.il][19])
* **Agoda/Israeli Supreme Court** — Israeli law prevails for Israeli consumers. ([Pearl Cohen][1])
* **Data Security Regulations (2017) (EN)** — Gov.il translations. ([Government of Israel][17])
* **PPA — cross-border** (overview + updates). ([DataGuidance][20])
* **Website accessibility guidance** — Gov.il + examples referencing IS 5568 / WCAG. ([Government of Israel][7])
* **Anti-spam FAQ** — Ministry of Communications (Gov.il). ([Government of Israel][8])
* **Electronic Signatures** — Law & CA Registrar. ([portal.mycertiphi.com][10])
* **Business Licensing Law (EN)** + muni exemplars. ([Government of Israel][21])
* **Authority Hubs** — Tax Authority; Corporations Authority; Bituach Leumi. ([Government of Israel][12])

---



[1]: https://www.pearlcohen.com/israeli-supreme-court-says-consumer-facing-terms-are-subject-to-israeli-law/?utm_source=chatgpt.com "Israeli Supreme Court Says Consumer-Facing Terms Are ..."
[2]: https://www.wipo.int/wipolex/en/text/128083?utm_source=chatgpt.com "Consumer Protection Law, 5741-1981"
[3]: https://www.gov.il/en/departments/consumer_protection_and_fair_trade_authority/govil-landing-page?utm_source=chatgpt.com "Consumer Protection And Fair Trade Authority - Gov.il"
[4]: https://www.adalah.org/uploads/oldfiles/Public/files/Discriminatory-Laws-Database/English/43-Flag-and-Emblem-Law-1949.pdf?utm_source=chatgpt.com "Flag and Emblem Law, 5709-1949"
[5]: https://www.gov.il/en/pages/data_security_regulation?utm_source=chatgpt.com "Protection of privacy regulations (data security) 5777-2017"
[6]: https://www.wipo.int/wipolex/en/text/347462?utm_source=chatgpt.com "Protection of Privacy Law, 5741-1981"
[7]: https://www.gov.il/en/pages/website_accessibility?utm_source=chatgpt.com "Making the Web Accessible - Gov.il"
[8]: https://www.gov.il/en/pages/17052018_7?utm_source=chatgpt.com "FAQ About Spam Mail Ministry of Communications - Gov.il"
[9]: https://www.gov.il/en/departments/israel_tax_authority/govil-landing-page?utm_source=chatgpt.com "רשות המסים בישראל - Gov.il"
[10]: https://portal.mycertiphi.com/documents/ESIGN_Israel.pdf?utm_source=chatgpt.com "Electronic Signature Law, 5761 - 2001"
[11]: https://www.gov.il/en/departments/general/certification_authorities?utm_source=chatgpt.com "Registrar of Certification Authorities - Gov.il"
[12]: https://www.gov.il/en/departments/topics/value_added_tax/govil-landing-page?utm_source=chatgpt.com "Value added tax (VAT) - Gov.il"
[13]: https://www.gov.il/en/service/company_registration?utm_source=chatgpt.com "Register a company | Israeli Corporations Authority - Gov.il"
[14]: https://www.gov.il/en/pages/about_corporations_authority?utm_source=chatgpt.com "About Israeli Corporations Authority - Gov.il"
[15]: https://www.btl.gov.il/English%20Homepage/Insurance/National%20Insurance/Detailsoftypes/SelfEmployedPerson/Pages/HowtoRegister.aspx?utm_source=chatgpt.com "Opening a self-employed file at the NII"
[16]: https://www.gov.il/en/pages/business_licensing_law_1968?utm_source=chatgpt.com "Business Licensing Law, 1968 - Gov.il"
[17]: https://www.gov.il/BlobFolder/legalinfo/data_security_regulation/en/PROTECTION%20OF%20PRIVACY%20REGULATIONS.pdf?utm_source=chatgpt.com "PROTECTION OF PRIVACY REGULATIONS (DATA ... - Gov.il"
[18]: https://www.afiklaw.com/articles/a208?utm_source=chatgpt.com "The Passing Off Tort in Israel - Afik & Co. Attorneys & Notary"
[19]: https://goslaw.co.il/wp-content/uploads/2021/03/standard-contracts-law.pdf?utm_source=chatgpt.com "Standard Contracts Law, 1982"
[20]: https://www.dataguidance.com/jurisdictions/israel?utm_source=chatgpt.com "Israel | Jurisdictions"
[21]: https://www.gov.il/blobFolder/legalinfo/rules_and_regulations_contaminated_land/en/laws_and_regulations_licensing_of_businesses_law_1968_unofficial_translation.pdf?utm_source=chatgpt.com "Licensing of Businesses Law 5728-1968 - Gov.il"
