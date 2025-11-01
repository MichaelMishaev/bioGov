Building a PWA for Israeli SMB Bureaucracy: Comprehensive Guide
1. Business Flows and Features
Overview: The PWA will guide users through the full lifecycle of a small business in Israel – from initial registration to ongoing compliance, renewals, and eventual closure. Flows differ for sole proprietors (עוסק פטור/מורשה), limited companies (חברה בע"מ), and businesses requiring special licenses. Below, we map out step-by-step user flows for each stage, highlighting key differences by business type.
New Business Registration Flows
Sole Proprietor (Freelancer – Osek Patur or Osek Murshah):
Tax Registration (VAT & Income Tax): Register as an osek at the Tax Authority. Before starting business activity, one must appear at the local VAT office or use the online system to open a VAT file
kolzchut.org.il
kolzchut.org.il
. This involves submitting Form 821 (VAT registration form) with personal ID and business details
kolzchut.org.il
. Osek Patur (VAT-exempt) and Osek Murshah (VAT-registered) use the same Form 821; eligibility for patur depends on annual revenue (up to ₪120,000 in 2024/25
greeninvoice.co.il
). Alongside VAT, open an income tax file (Tik Mas Hachnasah) by sending a filled “Opening File for Self-Employed” form to the regional tax office
kolzchut.org.il
. There is no need to visit in person – forms can be mailed or submitted online
kolzchut.org.il
. If registering as an Osek Patur via the Tax Authority’s website, the system can now handle both VAT and income tax in one digital process
kolzchut.org.il
.
National Insurance (Bituach Leumi): Register as self-employed with Bituach Leumi upon starting work
kolzchut.org.il
kolzchut.org.il
. This is done by filing a “Multi-year declaration” (Din V’Heshbon Rav Shnati) form, which can be submitted online
kolzchut.org.il
. A new integrated service launched by Tax Authority and Bituach Leumi allows opening the Bituach Leumi file in the same workflow as tax registration
kolzchut.org.il
kolzchut.org.il
, saving duplicate paperwork. This ensures the individual is classified correctly for social security and can receive benefits
kolzchut.org.il
kolzchut.org.il
.
Additional Requirements: Provide copies of ID, business address proof (lease or ownership contract), and bank account confirmation. For example, VAT registration requires ID, a canceled check or bank letter for the account, and possibly a lease/ownership contract for the business premises
kolzchut.org.il
kolzchut.org.il
. All documents must be submitted to the authorities within the required timeframe (VAT registration by the day business activities begin
kolzchut.org.il
).
Limited Company (Private Ltd – “Chevra Ba’am”):
Company Incorporation: Register the company with the Israel Corporations Authority (Registrar of Companies). This involves choosing a unique company name and submitting incorporation documents: an application form, Articles of Association, initial shareholders’ and directors’ declarations, and paying the registration fee
tel-aviv.gov.il
. Signatures must be certified by an Israeli attorney or notary/consul (if done abroad)
tel-aviv.gov.il
. This process can be done online via authorized lawyers under recent reforms, which significantly speeds up registration
tel-aviv.gov.il
. Upon approval, you receive a Certificate of Incorporation and Company Number.
Post-Incorporation Setup: Open a business bank account in the company’s name (required before tax registration)
tel-aviv.gov.il
tel-aviv.gov.il
. Banks will ask for the company’s registration certificate, certified copies of corporate documents, board resolution approving account opening, and identification of directors/signatories
tel-aviv.gov.il
. Once the bank account is ready, register the company with the Tax Authority for VAT and income tax. This means filing Form 821 + Annex 821A for VAT (indicating it’s a company)
kolzchut.org.il
 and submitting the “Opening File for Corporation” form to open corporate income tax files
kolzchut.org.il
. Include supporting documents: a copy of the Registrar of Companies certificate, protocol of directors appointment (stamped by the registrar), list of directors and their IDs, the lease or property contract for premises, and bank account confirmation
kolzchut.org.il
kolzchut.org.il
. The tax authority will open a corporate income tax file and a VAT dealer file for the company.
Payroll Registration: If the company will have employees (including paying the founders a salary), open a withholding (Nikuyim) file with the Tax Authority for payroll tax and a corresponding employer account with Bituach Leumi. This is done by ticking the relevant section in the income tax opening form (for self-employed or corporation)
kolzchut.org.il
. Once the Tax Authority processes it, they automatically transmit the employer registration to Bituach Leumi
kolzchut.org.il
. This ensures the company can remit employee income tax and national insurance contributions.
Business License (if applicable): If the company’s activity falls under the Business Licensing Law, proceed with license application as described below (licensed activities).
Licensed Activities (Businesses Requiring a License):
Certain types of businesses (e.g. restaurants, factories, educational facilities, hazardous materials, entertainment venues, etc.) must obtain a Business License (Rishayon Esek) from the local municipality under the Business Licensing Law, 1968. The law and its regulations enumerate which business categories are “license-required”
odata.org.il
. If your business falls in this list, you must apply to the municipal Licensing Department after completing tax registrations. Key steps include:
Application Submission: Submit a license application form to the municipality, including details of the business, address, and ownership. You’ll need to attach supporting documents such as facility layout plans, proof of zoning or usage permits, sanitation plans, etc., depending on the business type
gov.il
buslic.co.il
. Many municipalities provide checklists or “uniform specifications” (מפרט אחיד) for each industry – these documents consolidate all required paperwork and conditions for that business type as part of a nationwide licensing reform
ofaqim.muni.il
.
Approvals from Authorities: The application is circulated to relevant national bodies (“confirming entities”) for inspection and approval. Common entities include Fire & Rescue Authority (fire safety inspection), Israel Police (public safety/security check), Ministry of Health (for food or health-related businesses), Ministry of Environmental Protection (for pollution/hazardous materials), etc.
data.gov.il
julis.muni.il
. Each authority has specific conditions. For example, the Fire Authority publishes standardized fire safety requirements for business licensing, which list the required fire safety measures for various business types (e.g. sprinklers, extinguishers, emergency exits)
data.gov.il
. These requirements must be met (sometimes verified via site inspection or by providing a certified declaration for low-risk businesses
gov.il
).
License Issuance: Once all relevant approvals are obtained and any necessary corrections made (e.g. installing safety equipment), the municipality will issue the business license. Initial licenses are usually time-limited (often one year, sometimes up to 3-5 years for low-risk businesses). The PWA should record the license expiry date and conditions for renewal. (Note: Recent reforms allow “simple” low-risk businesses to get a license based on an affidavit of compliance instead of full inspections, to streamline the process
buslic.co.il
.)
Feature Considerations: The PWA should tailor onboarding questions to determine the user’s category (freelancer vs company, and whether a license is needed). Based on this, it can present a custom checklist of registration steps. For example, a sole trader who selects “food truck” should see the general tax registration steps plus guidance on obtaining a local business license and health permit. The app can provide step-by-step wizards with progress tracking for each step (e.g., “Step 3 of 5: Submit Form 821 to VAT office”) and links to download forms or access online submission portals (such as the online Osek Patur registration service on Gov.il
kolzchut.org.il
 or the online Bituach Leumi form
kolzchut.org.il
). Where possible, leverage integrations: for instance, pre-fill known information into forms, or redirect to the one-stop joint registration form that covers both Tax and Bituach Leumi for new sole proprietors
kolzchut.org.il
. Notifications can remind users to follow up if, say, a company registration isn’t confirmed within the typical timeframe.
Ongoing Operations: Reporting and Compliance
Once the business is up and running, the PWA will help users stay on top of recurring obligations and compliance tasks. These include tax filings (monthly/bi-monthly and annual), payments, license renewals, and any changes that need reporting. The system should support both Hebrew and English, given many official systems are in Hebrew. Key ongoing processes:
VAT Reporting: Most businesses (all Osek Murshah and companies) must file VAT reports either monthly or bi-monthly (every two months) depending on turnover. The PWA should determine the reporting frequency (by business type or revenue) and set up a recurring task. Users need to report output tax and input tax and pay the net VAT by the due date. Israel has implemented an electronic VAT filing system – returns are filed as a digital form or by uploading a PCN874 file from accounting software
hcat.co
. Osek Murshah dealers can file online via the Tax Authority’s secure portal (requires smart card login for detailed VAT reporting)
gov.il
. The app can provide a shortcut to the online VAT filing service
gov.il
 and send reminders ahead of each deadline. For Osek Patur (VAT-exempt), there is no periodic VAT filing (they do not charge VAT), but they must stay below the annual revenue threshold. The PWA can track the user’s reported income to warn if they approach the osek patur ceiling (₪120K/year in 2024-25)
greeninvoice.co.il
. If they exceed it, they’ll need to convert to Osek Murshah (which involves updating the VAT registration status). The app should flag this scenario and guide the user through changing status at the VAT office.
Income Tax Advances and Annual Returns: Self-employed individuals and companies pay income tax in two main ways: periodic advance payments (מקדמות) and an annual tax return. After opening a file, the Tax Authority often sets a schedule of bi-monthly advance tax payments based on projected income (or the new *“osek zair” regime for very small businesses allows skipping advances)
gov.il
. The PWA should track these due dates – typically each mid-month for the previous period – and amounts (users can input or adjust if their assessment changes). We can integrate with calendars so that, for example, on March 15 a reminder says “Submit Jan-Feb income tax advance (mikdamot) to Mas Hachnasa.” The app can link to the online payment system or provide bank giro details.
Additionally, all businesses must file an annual income tax return (דוח שנתי) after the close of the fiscal year (calendar year). For individuals (including sole proprietors), the deadline is usually April 30 (with extensions to around September if via an accountant); for companies, usually by end of May (extensions possible)
kolzchut.org.il
. The PWA should list the deadline and assist in preparing the needed info. It could prompt the user to gather financial statements, expense receipts, etc., or even integrate with bookkeeping software to generate a draft report. The app might link to the official e-filing portal or provide the forms (like Form 1301 for individuals, 1214 for companies, etc.). Failure to file on time can incur penalties
kolzchut.org.il
, so automated email/SMS reminders are crucial.
Payroll & Withholding Reporting: If the business has employees or makes payments requiring tax withholding (e.g. rent or contractor payments), monthly reports are required. Every month, employers must report and pay income tax withholding (Nikuim) for the prior month’s salaries, and similarly pay Bituach Leumi and health insurance contributions for employees. The PWA should have a sub-flow for businesses with employees: after the user indicates they have X employees, the app can include tasks like “Submit monthly payroll report and payments by 15th of each month.” Israel’s system requires filing Form 102 to Bituach Leumi (which can be done online on the Bituach Leumi site) and a separate withholding report to Mas Hachnasa (often via the Tax Authority’s online system or via an accountant’s software). We can provide deep links to those services or the forms. Since our PWA is geared to simplicity, we might advise using a payroll service or provide integration if possible. Also, annual wage reporting (such as Form 126 summary to tax authority) could be tracked at year-end.
National Insurance (Self-employed): A self-employed person’s own Bituach Leumi contributions are typically paid via bi-monthly bills (or monthly) based on income levels. After registering, Bituach Leumi sends a payment booklet or sets up online billing
kolzchut.org.il
. The PWA should include these payments in the schedule (e.g., every 1st of Jan, Mar, May… if bi-monthly) and provide a link to pay online on the Bituach Leumi site. It should also remind the user to update Bituach Leumi if their income level changes significantly (since contributions are income-based). If the user had also regular salary income elsewhere, the PWA can remind to ensure combined contributions are adjusted, but that may be beyond MVP.
Business License Renewals: For businesses under the Business Licensing Law, licenses often need periodic renewal. Many licenses expire after one year (some low-risk categories may get 3-year or 5-year licenses). The PWA should track the expiration date of the license (record when the user obtained it) and notify the user 2-3 months in advance to start the renewal process. Renewal usually requires ensuring ongoing compliance (e.g. another fire safety inspection if needed, or just paying the annual license fee and getting approval). The app can list the steps to renew: e.g., “Your food establishment license expires in 90 days – contact the municipal licensing dept for renewal. Ensure fire extinguisher inspection is up to date and pay the renewal fee.” If there are open data feeds or APIs, the app might even fetch the license status from municipal databases. (Notably, some cities publish open data of businesses with licenses, including license validity dates
kfar-saba.datacity.org.il
, which could be leveraged to verify if a license is still active).
Ongoing Compliance and Changes: Other tasks the app should handle:
Record-Keeping: Remind users to update their accounting books and issue receipts/invoices as required by law. (Israeli law requires maintaining proper bookkeeping – PWA can include a checklist per “ניהול ספרים” regulations
kolzchut.org.il
).
Updates to Authorities: If the business moves address, adds a branch, or changes name/ownership, these changes must be reported to VAT, Income Tax, and possibly the Registrar of Companies (for companies) within a specified time. The PWA can provide a “Change Wizard” for these scenarios, outlining the forms to submit (e.g., VAT change of details form, updated company info to Registrar, etc.).
Compliance Calendar: The app should maintain a compliance calendar showing all upcoming deadlines: tax payments, filings, license renewals, etc. This calendar can be synced with user’s phone calendar or send push notifications. For example, the 15th of each relevant month could trigger: “⚠️ VAT return due in 5 days (for July-August period)”. A special yearly view in December could remind: “Prepare annual reports and gather expense documentation for year-end.”
Features to implement: dynamic task lists that adjust to the business profile (e.g., show payroll tasks only if employer). Each task can have an info page with “What, Why, How”: describing the obligation, linking to official instructions or forms, and a one-click link to the official e-service or a generated form. For instance, a VAT filing task could have a “File now” button that deep-links to the Tax Authority’s login page for e-filing
gov.il
. Where automation is possible (see Section 5), the PWA might pre-fetch certain data – e.g., retrieving current license conditions or verifying if a VAT report was submitted (via email confirmation parsing or API). The design should make these ongoing tasks highly visible and allow the user to check them off when done (possibly even have the app confirm submission via integration).
Business Closure Flow
Closing a business requires notifying all the relevant authorities and fulfilling any final obligations. The PWA will provide a guided “closure checklist” to ensure users properly wind down to avoid future penalties. Key steps include:
Closing VAT File: The business (or its accountant) must inform the VAT office within 15 days of ceasing business activity
kolzchut.org.il
. This is done by submitting Form 18 (Notification of Business Closure) to the VAT office
gov.il
. Form 18 requires details like the business number, date of cessation, final inventory, disposal of assets, etc.
midrag.co.il
. An Osek Patur can indicate on the form accordingly (there’s a checkbox for exempt dealers)
gov.il
. The PWA should provide Form 18 and the address of the user’s regional VAT office (or link to any online submission if available). After processing, the VAT office will close the file – meaning the business will no longer need to file VAT returns going forward. (If the business had any VAT refunds due or liabilities, those must be settled during closure.)
Closing Income Tax File: Notify the Income Tax (מס הכנסה) office (your Pkid HaShoma assessor) within 90 days of stopping business activity
kolzchut.org.il
. Typically, a letter or form is sent to inform them of the closure date. Kol Zchut notes that the file will only be fully closed after the VAT file is closed
gov.il
 – since income tax wants confirmation you’ve closed VAT first. The business will still need to file a final annual tax return for the last year of activity (and for companies, possibly a final balance sheet upon liquidation). The app should list these requirements (e.g., “Submit final annual tax return for year X by date Y, marking it as final”). After final tax assessments are done and any due taxes paid, the tax authority will close the file.
Closing Bituach Leumi (National Insurance): If self-employed, inform Bituach Leumi that you’ve stopped the business so they stop billing self-employed contributions. This can be done by updating and submitting the Din V’Heshbon Rav Shnati form again (to report cessation) or by an online notice to the local branch
btl.gov.il
. The PWA can guide the user to Bituach Leumi’s site or form for closing the atzmai account
btl.gov.il
. If the business had employees, closing the withholding file as above will also inform Bituach Leumi to close the employer file (they might ask for final payroll reports). Our app should remind the user to pay any remaining Bituach contributions before closure.
Company Liquidation/Deregistration: If the business is a company, closing is more involved. The PWA should differentiate this case: closing a company requires either a voluntary liquidation process or a simpler “dormant company strike-off” if eligible. The app should advise that after settling all taxes and debts, the company needs to request removal from the Companies Registry. That means submitting a formal application to the Registrar of Companies to dissolve the company (including shareholder resolutions, affidavits, and final tax clearance). This step may require legal assistance. While the PWA might not handle the legal filing, it should remind the user that simply closing tax files is not enough for a company – the legal entity continues to exist (and incur annual fees) until it’s officially struck off. It could provide a link to a guide or the Corporations Authority service for company dissolution.
License and Others: If a business had a license or permits, those authorities should also be notified. For example, if you had a business license from the municipality, you should inform the licensing department that the business closed (often they require returning the physical license). Similarly, any professional licenses or VAT “authorized dealer” certificate should be returned. The PWA’s closure checklist can include “Notify municipality to cancel business license” and “Cancel any recurring subscriptions (e.g., POS machine rental, licenses)” as general best practices. It should also advise the user to inform suppliers/clients as needed and handle last employee terminations per labor law (if employees are present).
Feature Implementation: A “Close Business” wizard in the app can compile all these steps into a manageable to-do list. It can auto-fill known info into closure forms (e.g., business number, last known activity date) and possibly generate a template letter for income tax notification. After the user completes the steps, the app could have an optional survey to capture why they closed – providing feedback or perhaps offering help if they plan to start a new venture. Ensuring that users know how to properly close out prevents future surprises (like unexpected tax bills or fines). The app can also include content explaining that closing properly is important – e.g., “Note: The Income Tax file is officially closed only after the VAT file is closed and final tax return is submitted
gov.il
. Make sure to complete all filings.” This guidance will increase user trust that the app covers all angles.
Finally, the PWA should allow the user to download an archive of their data (forms, deadlines, documents) upon closure, and provide a way to delete their account (tying into privacy compliance in Section 9).
2. Legal and Regulatory Requirements
Developing an app in this domain requires familiarity with Israeli laws and regulations in several areas: taxation, business registration, licensing, privacy, accessibility, and use of government e-services. Below we outline key legal frameworks and requirements relevant to the PWA and the businesses using it.
Tax and Business Laws
Income Tax Ordinance and Corporate Tax: Israel’s Income Tax Ordinance (פקודת מס הכנסה) governs taxation of individuals (including sole proprietors) and companies. SMBs must pay taxes on their taxable income each year and comply with bookkeeping regulations. There are specific rules for deductible expenses, depreciation, etc., which our app might reference in guidance. For companies, the Companies Law (1999) applies – for example, requiring them to file annual reports with the Registrar and keep certain records. While the app’s primary function is guiding through bureaucracy, it should reflect basic tax law requirements like registration timing (immediately upon starting business)
kolzchut.org.il
, and the obligation to maintain proper accounting books and file annual returns
kolzchut.org.il
.
Value Added Tax (VAT) Law: VAT in Israel is governed by the Value Added Tax Law, 1976. Key points: standard VAT rate (currently 17%), requirement to register as a dealer (osek) before starting business, and to charge VAT on sales if not exempt. The law defines “Osek Patur” as a small dealer under a revenue threshold (₪120,000 as of 2024)
greeninvoice.co.il
 who is exempt from charging VAT but cannot claim input VAT. The PWA must incorporate these rules: for example, if a user’s revenue exceeds the threshold mid-year, by law they must re-register as an Osek Murshah and start charging VAT. Also, VAT law sets out filing frequency: typically bi-monthly if annual turnover is under a certain amount (around ₪1.5 million) and monthly if above, and mandates keeping VAT invoices and purchase books. We ensure our workflows align with these legal requirements (e.g., reminding a patur not to charge VAT, and an murshah to issue tax invoices and file on time).
Business Licensing Law, 1968: This law (חוק רישוי עסקים תשכ"ח-1968) and its regulations require certain businesses to obtain a license to operate. It lists categories of businesses that are “עסקים טעוני רישוי” – ranging from food establishments, gas stations, factories, education centers, to entertainment venues. The law serves to protect public health, safety, and welfare by ensuring these businesses meet conditions set by authorities. For our app, it’s important to identify if a user falls under this law. If so, we must guide them to comply with the licensing process (as detailed in the flows above) and meet any ongoing requirements. Each license typically has specific conditions (תנאי רישיון) the business must continuously uphold – e.g., maximum occupancy, noise limitations, hygiene standards. Non-compliance can lead to license revocation or fines. The app should highlight to users that operating a license-required business without a valid license is a criminal offense. We also ensure to update any changes: for instance, if the law is amended to add or remove categories of licensed businesses (reforms happen occasionally), our content should reflect that. Recent reforms have introduced the concept of a “uniform conditions specification” (מפרט אחיד) for each business type to increase transparency and consistency
ofaqim.muni.il
. Our app references these where possible to provide official conditions directly to the user.
Companies Ordinance / Registrar Requirements: If the user runs a company, aside from tax laws, the Companies Ordinance requires certain filings. For example, every company must file an Annual Return to the Registrar of Companies and pay an annual fee. The app’s compliance calendar should include this for company users. The Registrar also mandates updating any change in directors, address, or capital. We incorporate such triggers in the app (e.g., a prompt if the user indicates a company address change: “You must notify the Registrar of Companies within 14 days”). Not adhering to Registrar requirements can result in penalties or even deregistration of the company, so this is critical.
Privacy Protection Law and Data Regulations
Our PWA will handle sensitive user data (personal and business information, possibly financial details). As such, Israeli Privacy Protection Law, 1981 (PPL) and its latest amendments are highly relevant:
Privacy Protection Law & Amendment 13 (2025): This law governs how personal data can be collected, used, and stored. Amendment 13, effective 14 August 2025, significantly strengthened the privacy regime
safetica.com
. It brings Israel’s law closer to EU GDPR standards and adds unique local requirements. Key changes include: expanded definitions of personal and “especially sensitive” data, stricter consent requirements, mandatory appointment of Data Protection Officers for certain organizations, and increased enforcement powers
safetica.com
safetica.com
. For instance, personal data now explicitly covers online identifiers (IP addresses, geolocation) and sensitive data encompasses biometric, genetic, financial, and health information
safetica.com
safetica.com
. If our app processes any such data (e.g., if we handle user’s financial info or ID number), we must treat it with enhanced security and confidentiality. Amendment 13 requires certain organizations to appoint a Privacy Protection Officer (akin to a DPO) and a Data Security Officer if they handle large amounts of data or especially sensitive info
cookie-script.com
. As a startup PWA service, we might not immediately need a formal DPO unless we scale significantly, but we should designate someone responsible for privacy compliance. The amendment also gives individuals the right to sue for privacy violations without needing to prove damage
safetica.com
, raising the stakes for compliance. Our app’s privacy policy and practices must align with these new rules. For example, we need explicit, granular consent from users for any use of their data beyond providing the service
safetica.com
. If we ever decide to process data for additional purposes (like analytics or marketing), we must obtain informed consent and allow opt-out.
Data Security Regulations (2017): Israel’s Privacy Protection (Data Security) Regulations, 2017 – still in force alongside Amendment 13 – set out detailed security obligations for any database of personal information
cookie-script.com
. They categorize databases by risk/size (basic, medium, high) and impose measures accordingly. At minimum, our service must implement: role-based access controls (each user only sees their data, admins only what’s necessary)
cookie-script.com
, regular security audits
cookie-script.com
, encryption of sensitive personal data (both in transit and at rest)
cookie-script.com
, and staff training on data privacy
cookie-script.com
. We also need a written information security policy addressing physical access, network security, access authorizations, and risk management
iapp.org
. The regulations require maintaining an up-to-date document mapping what personal data we hold, the purposes of holding it, who has access, etc.
iapp.org
. Furthermore, in case of serious data breaches (e.g., leak of users’ PII), we are obligated to report to the Privacy Protection Authority (PPA) promptly
iapp.org
. Our architecture and incident response plan should facilitate detecting and reporting breaches. Non-compliance with these regulations can lead to sanctions: the PPA can investigate and even suspend a company’s database registration
iapp.org
. With Amendment 13, although routine database registration requirements have been reduced for many businesses, compliance with security measures is more critical than ever
dataguidance.com
iapp.org
. We must also ensure any third-party service we use (e.g., cloud hosting, analytics) is bound by privacy and security obligations – the regs say we must have agreements in place covering data protection when sharing data with third parties
iapp.org
.
Data Subject Rights: Under Israeli law (especially post-Amendment 13), individuals have rights such as access to their data, correction, deletion (in some cases), and the right to object to certain uses
cookie-script.com
cookie-script.com
. Our PWA should facilitate these. For instance, allow users to view all personal info we store (likely via profile section), let them correct inaccuracies, and enable account deletion (with data purge) upon request. If we expand to store SMBs’ customer data (maybe in future features), we would need to handle things like providing an individual’s data to them on request (data portability)
cookie-script.com
. We should also be cautious with any cross-border data transfer – e.g., if our servers are outside Israel – Israeli law permits it only to countries with adequate protection or with proper safeguards
cookie-script.com
. This means if we host on US cloud, we might need users’ consent or to use standard clauses, since Israel’s PPA maintains a list of approved countries and the U.S. might not be on it
cookie-script.com
. These legal details inform our infrastructure decisions in Section 6.
In summary, privacy by design and security by design are not just best practices but legal requirements. We will minimize personal data collection (see Section 7 on data minimization) and apply strong security controls (Section 9) to comply with Israeli privacy laws.
Accessibility Requirements (IS 5568 Standard)
Israel has robust digital accessibility regulations to ensure people with disabilities can use online services. Israeli Standard 5568 (IS 5568) is the Web Accessibility standard in Israel
deque.com
, essentially aligning with W3C’s WCAG 2.0 Level AA guidelines
accessibe.com
. Since October 2017, this standard is legally enforceable under regulations of the Equal Rights for Persons with Disabilities Law (1998)
accessibe.com
accessibe.com
. In practice, any website or application offering services to the public in Israel must be accessible to users with visual, auditory, motor, and cognitive impairments.
Key points of IS 5568 and related regulations:
Our PWA must support screen readers and other assistive technologies. This means using proper semantic HTML, ARIA attributes where needed, text alternatives for images, and ensuring all functionality is available via keyboard (for those who can’t use a mouse).
Color contrast and text size must meet the standards. We should allow resizing text and avoid color combinations that are not high contrast.
For right-to-left (RTL) support: Since our app will be in Hebrew (and possibly Arabic) as well as English, we must implement proper RTL layout for Hebrew to ensure it’s not only accessible but also correctly formatted for those languages.
Exemptions and Deadlines: Small businesses below a certain revenue had extended compliance deadlines or partial exemptions. Medium/large businesses (≥₪300K annual revenue) established after Oct 2017 had to comply immediately, while older or smaller businesses had until Oct 2020 to comply
accessibe.com
. Very small “private” businesses under ₪100K were exempt
accessibe.com
. However, as of 2020, effectively any active business site above ₪100K revenue should now be compliant. Since our app is a publicly offered service (even if freemium), we should assume compliance is required. Non-compliance is a civil offense – disabled individuals or advocacy groups can file lawsuits against websites that are not accessible
accessibe.com
. Fines can reach tens of thousands of shekels per violation. Thus, from day one, our PWA’s UI must be built with accessibility in mind to meet IS 5568.
Concretely, we will conduct an accessibility audit (manual or via tools) prior to launch. We’ll provide an Accessibility Statement on the app (a requirement in Israel) describing the compliance level and any known gaps. We’ll also include features like the ability to enlarge text, high-contrast mode, and clear focus indicators – these align with common practices and some are mandated (e.g., providing an accessibility toolbar or options on the site). The development team might consider using accessibility testing tools and even involve users with disabilities in testing. Our goal is to make the bureaucratic processes easier for all users, including those with disabilities, which also keeps us on the right side of the law.
Government Digital Services and Standards
When integrating with government systems, we must respect any terms of use and technical requirements they have. For example:
Gov.il Portal and Forms: The Israeli government’s Gov.il portal provides many services (as referenced throughout our report). These often require authentication (some via GovID or smart card for businesses). If our PWA deep-links or automates interactions, we must ensure we do not violate their usage policies. For instance, automating form submissions might require using official APIs or authorized methods rather than scraping web pages, to comply with terms of service.
Electronic Signature Law (2001): Israel recognizes digital signatures for official documents. If our app ever helps generate documents that need signing (like forms to send to authorities), using a certified digital signature (כרטיס חכם or approved signing service) might be necessary. While our MVP may not include a signing feature, being aware of this law means we could integrate with digital signing solutions (for example, some forms can be signed with personal certificates or through the government ID system).
Records Retention and E-Documentation: Israeli law and various regulations may require that certain communications with government be kept or follow a format. If our app acts on behalf of the user to send communications, we should provide them with a copy for their records. Government agencies often send back confirmations or reference numbers – our app should capture those for the user. For example, if the user files something via our app and an official reference number is returned, storing it is important in case of disputes.
Open Data and Open Government: Israel has an open data initiative (data.gov.il) and encourages use of APIs to improve services. Our usage of public APIs/data (discussed in Section 4) aligns with this. We should however credit sources appropriately and ensure data is up-to-date (some datasets come with update frequencies or disclaimers). No privacy issues arise with open public data, but if we use any government login on behalf of users (for example, to retrieve their data), we must do it securely and likely with the user’s explicit consent (and possibly using official OAuth if available rather than storing their passwords).
In summary, our PWA must navigate a complex legal landscape: tax and licensing laws define what tasks the user must do; privacy and accessibility laws define how we must handle user data and design the app; and government digital standards define how we interact with official systems. By baking compliance into our design – e.g., enforcing least data collection, building an accessible UI, and integrating only through proper channels – we reduce legal risks and build trust with users and regulators.
3. Official Forms and Documents
A core value of our PWA is consolidating all the bureaucratic paperwork in one place. To do this, we need to list every major form, document, and certificate an SMB in Israel might need across various processes. Below we enumerate these, organized by use-case, and provide details on obtaining, filling, and submitting each. We also include direct links (deep links) to official sources for these forms where available.
New Business Registration Forms
Form 821 – VAT Registration Application (טופס 821):
Use: Opening a VAT file for a new business (sole proprietor or company)
kolzchut.org.il
kolzchut.org.il
. This is the primary form for registering as an Authorized Dealer (Osek Murshah) or Exempt Dealer (Osek Patur) with Mas Vemam (VAT).
Obtaining: Available on the Tax Authority/Gov.il website. We have a deep link to the Gov.il service page which provides Form 821 for download
gov.il
. The form is provided in Hebrew; an accessible version (for screen readers) is also available on Gov.il
gov.il
.
Details to Fill: Business name, owner’s personal details (ID number, address), business address, bank account info, type of business, and expected activity. There’s a section to indicate if registering as patur (exempt) or murshah (charge VAT).
Submission: Historically done in-person at the regional VAT office (especially for Osek Murshah). You bring the filled form along with attachments: copy of owner’s Teudat Zehut (ID), proof of bank account (canceled check or bank letter), and proof of premises (rent or purchase contract)
kolzchut.org.il
. Osek Patur can now apply online or via email without visiting in person
kolzchut.org.il
 – the Tax Authority’s online services (referred to as MAF”L system) allow submitting Form 821 digitally for exempt dealers
kolzchut.org.il
. Our PWA will link directly to that online submission portal (which is a secure web form on taxes.gov.il)
kolzchut.org.il
. If submitting online, attachments are uploaded electronically. For companies or partnerships, Form 821 has an annex (821A) to list corporate details and partner info
kolzchut.org.il
kolzchut.org.il
. Those must be submitted together.
Income Tax File Opening Forms:
Use: Registering a new business with the Income Tax department (Mas Hachnasa). There are two separate official forms: one for individuals (self-employed) and one for corporations.
Individuals (self-employed or partnership): “Opening a File for Self-Employed” form (טופס פתיחת תיק לעצמאי)
kolzchut.org.il
.
Companies: “Opening a File for Corporation” form (טופס פתיחת תיק לתאגיד)
kolzchut.org.il
.
Obtaining: These forms are downloadable from the Tax Authority’s website – deep linked on Gov.il. Kol Zchut provides direct links: 
kolzchut.org.il
 shows links for “טופס פתיחת תיק עבור עצמאי”
kolzchut.org.il
 and “טופס פתיחת תיק עבור תאגיד”
kolzchut.org.il
 which lead to Gov.il download pages. Our app will incorporate those links for easy access.
Details to Fill: These forms collect information parallel to Form 821 but for income tax: personal/corporate details, address, accounting method, business activity description, and crucially include a section to register as an employer (withholding file) if applicable
kolzchut.org.il
. For example, the form asks “Will you have employees or pay others with tax withholding? If yes, check here to open a Nikuyim file.”
Submission: Unlike VAT, opening the income tax file does not require a physical visit. The instructions (and Kol Zchut) indicate you can send the signed form by mail, fax, or email to the local Tax Assessor’s office
kolzchut.org.il
. Gov.il often lists the email of each tax office. Our PWA could list the contact info for the user’s relevant office (we could determine it from their address or have them choose). Alternatively, new online services may allow opening both VAT and income tax together (there is a Gov.il service specifically for opening an Osek Patur online that handles both
gov.il
). For completeness, our app will provide guidance: e.g., “Email the signed form to Mas Hachnasa at [office email] – keep the confirmation.” The user should receive a notice of file number once opened.
Bituach Leumi Self-Employed Registration – “Din V’Heshbon Rav Shnati” (דין וחשבון רב שנתי):
Use: To register as an “Atzmai” (self-employed) with National Insurance and declare expected income/work scope
kolzchut.org.il
. This form is multi-year because it’s used to report income each year (and at start/stop).
Obtaining: Available on Bituach Leumi’s site and as an online form via GovForms
kolzchut.org.il
. Our app will link to the online form interface
kolzchut.org.il
 for convenience; alternatively, a PDF can be downloaded from Bituach Leumi site
kolzchut.org.il
.
Details to Fill: Personal details, business info, and crucially, indicate if you meet criteria of an “Obligated Self-Employed” (עובד עצמאי חייב) by hours or income
kolzchut.org.il
. You also estimate your income for the year (this determines your advance contribution rate). If you have other income sources (like also salaried), you note that.
Submission: If using the online GovForms, you fill and submit digitally (with an option to identify via your personal details or government ID login). If using paper, you send or bring it to the local Bituach Leumi branch
kolzchut.org.il
. The PWA will provide the address of the local branch (Bituach’s site has a branch locator
kolzchut.org.il
). Note: As mentioned, when registering an Osek Patur via the Tax Authority’s site, there’s an integrated option to open Bituach Leumi – in that case, you might not need to separately submit this form
kolzchut.org.il
 (the data is forwarded). Our app will clarify that: perhaps include a note “(If you used the one-stop online registration, your Bituach Leumi registration is already taken care of, but if in doubt, contact Bituach Leumi to confirm you’re registered).”
Company Incorporation Documents: (These are not single forms, but important documents to list)
Use: Registering a company with the Registrar of Companies. Typically includes:
Companies Registrar Application Form (טופס בקשה לרישום חברה) – this is a form where you fill proposed company name, company purpose (can be general “any lawful purpose”), details of initial directors and shareholders, and share capital structure.
Articles of Association (Takanon) – can use a template (the default Companies Ordinance provisions) or custom.
Initial Shareholders Declaration – a form where initial shareholders declare compliance with requirements (e.g., not legally barred).
Initial Directors Declaration – directors declare their consent and that they meet legal criteria.
These forms are often provided on the Justice Ministry website. Our PWA can link to the Registrar of Companies “Register a Company” guide on Gov.il
gov.il
 which explains what to prepare and may have the forms. The Tel Aviv Municipality summary lists these requirements
tel-aviv.gov.il
.
Obtaining: Download from the Corporations Authority site or obtain from a lawyer. Many people use a lawyer to incorporate, but DIY is possible. If the Corporations Authority offers an online application, it likely steps through these without needing to separately download forms. We will direct advanced users to that online system (which might require a smartcard or lawyer login).
Submission: If offline, documents must be signed and notarized as required
tel-aviv.gov.il
, then delivered to the Registrar (either by mail or in person at their offices, or via an attorney). There’s a fee (around NIS 2,614 as of recent years) to be paid – available online payment. Our app can list the current fee and link to the payment portal or give instructions to pay at Bank/Post. Once submitted, incorporation takes a few days; the user gets a Certificate of Incorporation and company number. Our app might prompt them to upload or save their company number for use in other forms.
Ongoing Reporting Forms and Documents
VAT Return Forms:
Historically, Form 874 was the manual VAT report form, but nowadays most VAT reporting is electronic. If someone files by paper (small dealers in remote areas, perhaps), the form is provided by the VAT office. Since 2019, online detailed VAT reporting is mandatory for most businesses, which means uploading the data (PCN874 format) or filling it online
hcat.co
. Our app will not require users to fill a paper form, but for completeness: the VAT return captures total sales, output VAT, total purchases, input VAT, and the net amount payable or refundable. We should list that if a user prefers offline, they can get Form 874 at the post office or VAT office, but strongly encourage online filing for speed.
Invoice Reporting (New E-Invoicing mandates): It’s worth noting Israel is moving towards a real-time invoice reporting system (Continuous Transaction Controls) in coming years
edicomgroup.com
. If by the time of our app’s operation this is live, users might need to report each invoice to the Tax Authority. We’ll keep an eye on this but it’s beyond the classic “forms” – more an API system.
Income Tax Payments – Voucher (Shovar) Forms:
When paying bi-monthly advances (mikdamot) or payroll withholdings, businesses use payment vouchers. Many now pay via online banking or direct debit, but a common form is Form 102 for Bituach Leumi (which doubles as a summary for income tax withheld from salaries) and a separate Mas Hachnasa payment slip for advance tax. If our user base includes those who pay offline, we might list “Bituach Leumi Form 102” and how to get it: Bituach sends it or it can be downloaded from their site; it includes fields for total salaries and total tax/NI due. For advance tax (mikdamot), the tax authority often issues a payment booklet with reference numbers. Our app can instruct: “Use the voucher provided by Mas Hachnasa – or pay online via their system.”
Annual Income Tax Return Forms:
Form 1301 – Annual tax return for individuals (including sole proprietors)
kolzchut.org.il
. This hefty form includes sections for all income sources, business income, deductions, credits, etc. Many use an accountant or the Tax Authority’s online system (“mishtach”) to file it. But we will list it, and possibly link to the English guide for it on Tax Authority site.
Form 1214 – Corporate tax return for companies. This is a form plus attached financial statements. Our app can mention that companies must submit audited financials with their return (so typically an accountant’s job). We provide links to the Tax Authority corporate return page.
Form 1320 – Declaration of filing (for those not required to file an annual return, like small salary earners, but that likely won’t apply to our users except maybe an osek patur below a threshold who might be exempt from filing? In Israel, generally, if you have a business you must file annual return, so likely all our users do).
For these forms, we should direct users to the Mas Hachnasa yearly filing service (which as of recent years is available via personal area login or via an accountant’s system). We will maintain deep links to any “file annual return” online service on Gov.il.
Withholding and Salary Annual Reports:
Form 126 – Bi-annual or annual summary of salaries and tax withheld. Employers must file this (often mid-year and year-end). It details each employee’s total salary and tax. Possibly beyond an MVP, but if we have employer users, we list it. There’s an online upload for Form 126 as well.
Form 856 – annual summary of payments to contractors and withheld tax from them. If our users pay freelancers and withhold tax, they must file this.
Our app can include these in a “year-end tasks” list for relevant users (only those who indicated they have employees or contractor payments).
Business License Renewal Application:
When renewing a municipal business license, typically the business must fill a renewal request form or sometimes just pay a fee and confirm no changes. The exact form can vary by municipality. Many municipalities send a renewal notice. The PWA should direct users: “Contact your local Licensing Dept for renewal forms” and provide any downloadable forms if available. For instance, Tel Aviv has a renewal application on their site. Since it’s local, we might not store all, but perhaps link to the Gov.il business licensing page
gov.il
 which lists general info and maybe links to major city licensing sites. If a standardized renewal form exists, we’ll include it.
Miscellaneous Compliance Forms:
Form 6111/6110 – Declaration for maintaining accounts (for certain professionals), if applicable. (This might be too detailed; can skip unless needed by law in certain cases).
Form for Changes: If changing from Osek Patur to Murshah or vice versa (when exceeding threshold, etc.), typically one just notifies VAT office (no special form number known, possibly just use 821 to update or a letter). We will instruct on process rather than a form.
Closing Forms: As covered in closure, Form 18 (VAT closure)
gov.il
 and an Income Tax closure notice letter.
Declarations for License: e.g., Fire Safety Affidavit for low-risk businesses, if applicable (the Fire Authority open data indicates some businesses just submit a declaration of compliance
yaffa.org.il
). We can obtain a template of that affidavit from the fire authority or municipality. Similarly, an Accessibility compliance affidavit may be required for license (confirming the premises is accessible as per law, or has exemption). These forms often appear in licensing checklists. For thoroughness, we mention them and that the user can get them from the relevant authority’s website or through our app’s guidance.
Where and How to Obtain & Submit Documents
Our PWA will serve as a document vault and guide. For each form, in the app’s content we will:
Provide the latest version of the form (PDF or link). We can host a copy or fetch from the official site to ensure it’s up-to-date. For dynamic forms (like online wizards), we provide the direct link to that service. For example, the link to open an Osek Patur online on Gov.il
kolzchut.org.il
, or the link to the Fire Department’s license requirements API for details.
Explain how to fill the critical fields in plain language. Many official forms are only in Hebrew; our app can offer translated field explanations or an English wizard that then populates the Hebrew form for the user. For instance, we could create a form interface for Form 821 in English, then produce a filled Hebrew PDF that the user can print/sign. That’s a possible feature for convenience.
Submission instructions: For each form, clarify the acceptable submission channels:
Email: Many authorities now accept forms via email (with scanned signatures). If so, provide the email address (e.g., “tz@taxes.gov.il for Tel Aviv Tax office”).
Web upload: e.g., Bituach Leumi’s online form is a direct web submission
kolzchut.org.il
.
In-person: If required (like original signature for some things or verifying ID for the first VAT registration), note the office location and hours, and perhaps suggest making an appointment if possible.
Our app could integrate with map APIs to show the nearest offices, etc.
Required Attachments: List what must accompany each submission. We gleaned these above: ID copies, bank proof, etc. For each form, our app will have a checklist of attachments. Possibly allow the user to upload/store those documents in the app securely for reuse (so they don’t scramble each time to find their Teudat Zehut copy or company certificate).
For example, in the Registration Checklist for a new sole trader, we’ll show:
Form 821 – link to download, and below it checklist: “ID copy ✅, Bank details ✅, Lease agreement ✅”.
After the user gathers and perhaps uploads these to the app, we could have a “Generate package” that compiles everything. However, storing ID copies is sensitive; we might instead just prompt and not store unless user insists.
We will also incorporate deep links to official guidance on forms. For instance, the Tax Authority publishes guides (on Gov.il or PDF) like “Guide to Opening a Business – Mas Hachnasa”
kolzchut.org.il
, which likely contains filled form examples and addresses. We’ll link these so users can reference authoritative instructions.
In summary, all required forms and documents for SMB bureaucracy in Israel, grouped by context:
Starting a Business: Form 821 (VAT)
kolzchut.org.il
, 821A annex (if company/partnership)
kolzchut.org.il
, Opening file forms for income tax (self-employed or corporation)
kolzchut.org.il
, Bituach Leumi registration form
kolzchut.org.il
, Company incorporation forms (application, declarations)
tel-aviv.gov.il
.
Routine Operations: VAT return (online/PDF 874), Income tax advance payment slips, Payroll Form 102 (NI/tax) if applicable, Invoices/receipts (stationery – not a government form but legal document: we might include guidance on proper invoice format, as per law), Annual tax return forms (1301, 1214)
kolzchut.org.il
, license renewal forms (municipal).
Changes: Forms to change business status (VAT status change, update address – usually done by letter or via the online system “Maam communications”), Adding/removing partners (if partnership, via tax forms or registrar forms), etc.
Closing: Form 18 (Close VAT)
gov.il
, Notice to Income Tax (no standard form number, but we can provide a template letter), Closing Bituach Leumi (submit Din V’Heshbon marking closure)
btl.gov.il
, Company strike-off request (Registrar’s forms).
Each of these will be documented in the app with what it’s for, link to get it, and how to send it. By aggregating this, the PWA serves as a one-stop reference library, sparing users from hunting across multiple sites.
4. External APIs and Data Sources
To streamline and automate processes, our PWA will integrate with various government and public APIs and utilize open data sources. These allow us to fetch information (so the user doesn’t have to enter it manually or leave the app), verify data, and keep content updated. Below is a list of reliable APIs/data relevant to Israeli SMB administration, along with how we can use them and deep links to their documentation or endpoints:
Business Registry (Corporations Authority) API: The Israeli Corporations Authority provides public information on registered companies and partnerships. While not a freely open REST API, there is a public search service for company information (via Justice Ministry websites). Tools like VATify.eu indicate one can retrieve basic company data (company name, status) from this source
vatify.eu
. Use in PWA: When a user inputs a company ID (ח"פ), we can call this lookup to auto-fill the registered company name and verify that the company is active. This helps in forms (no typos in official name) and in validating that a given company exists. If available, we could consume an open data file of companies – for example, there might be downloadable datasets of all active companies updated periodically. (In the past, basic company data was sold, but there’s been pressure to open more data; we’ll check data.gov.il for “רשם התאגידים” dataset). Even without a full API, we might use a scripted lookup on the justice.gov.il site if terms permit. Deep Link: The Gov.il “Register a Company” page
israelbusiness.org.il
 and the search page on Justice’s site (which requires a captcha for manual use, so we’d use it sparingly). If the userbase is just the company’s own info, one call per user to verify them is fine.
VAT Dealer Verification Service: The Tax Authority has a service to verify a business VAT number (עוסק מורשה). For example, they allow checking if a VAT number is valid and perhaps the name associated. There isn’t a documented open API for public use, but some third-party tools (Commenda, Avalara) offer Israeli VAT validation
commenda.io
, likely leveraging an official source. Use in PWA: We can use this to validate the user’s own VAT number at sign-up (did they input it correctly) and possibly to verify counterparties if we add a feature to check vendors. It’s also helpful if the app auto-populates the business name once the user enters their VAT/ID number. Deep Link: The Tax Authority’s “Authorized Dealer query” page if exists (there was historically a phone SMS service and possibly a web form). Also, data.gov.il hosted a dataset of all licensed dealers wasn’t found (likely for privacy reasons they don’t list individuals). We may rely on an internal list updated from somewhere. Alternatively, we might incorporate a library or API like VATify which claims to get data (perhaps through Corporations Authority for companies, which covers companies but not sole traders). For now, we cite VATify’s note: they get Israeli company data from the corp authority
vatify.eu
, so it may not fully validate sole proprietor VAT IDs (which are personal IDs). In absence of an official API, we ensure format validation (Israeli VAT ID is 9 digits with a known check algorithm) and maybe prompt to double-check if needed.
Business Licensing Open Data Catalog: The Government Open Data site hosts datasets related to business licenses. For example, Fire Safety Requirements for Business Licensing is available via API
data.gov.il
data.gov.il
. This dataset lists the fire safety conditions by business type (probably keyed by the business license category code). Similarly, there may be datasets for Environmental requirements or Health Ministry requirements for licenses. These are part of the “uniform conditions” published by each authority and can be accessed in machine-readable form
data.gov.il
. Use in PWA: When a user indicates their business type (during onboarding or in profile), if it maps to a license category, we can pull the relevant conditions from these datasets. For example, if the user is opening a bakery, the app can fetch from the fire department dataset the list of required fire measures for “bakery/food service” category and present it in a checklist. This turns opaque regulations into a clear to-do list. Additionally, if the data includes an API endpoint with update info, we can regularly refresh it to keep conditions current. Deep Link: Data.gov.il provides an API for each dataset (likely a CKAN API). Specifically, the Fire Safety Requirements dataset is documented and accessible via API
data.gov.il
. We would use those endpoints (likely JSON or CSV). We’ll also watch for a possible “Business License Catalog” dataset which might list all categories of businesses requiring a license (maybe the “עסקים טעוני רישוי” dataset we saw
data.gov.il
). If that dataset exists via API, we could query by a business description to see if it’s in the list of licensed categories. That would be powerful: the user writes what they do, and we check against the catalog to tell them if a license is needed. For now, we have a dataset of licensed businesses in some cities (e.g., Kfar Saba’s open data) which is more about already licensed entities
kfar-saba.datacity.org.il
. That one shows fields like business name, address, license validity
kfar-saba.datacity.org.il
. We might use such data for verification (e.g., “Yes, we found that your business appears in Kfar Saba’s licensed list, license valid until X”). But because that’s city-specific, it’s more a nice-to-have.
Government Services API (Gov.il): There is a centralized API or at least structured URLs for many government e-services. For example, some government forms on Gov.il might accept pre-filled parameters or calls. The exact API is not public for submission (for security reasons), but we can integrate via deep links. For instance, the “Mefaal” system (מפ"ל – public inquiries system of Tax Authority) which is used for online registration and communication, might have an API. At minimum, we link to it
kolzchut.org.il
. If the Tax Authority or other offices offer web services to, say, submit a VAT return via API (some countries have such for software providers), we could integrate those in future. Notable upcoming integration: Invoicing API – by 2024/25, Israel is piloting an API for invoice reporting
assets.kpmg.com
. If that becomes mandatory and available to use, our app could connect to it to automate tax reporting (though that might target larger orgs first).
Open Data on Deadlines and Updates: We will utilize any open data that provides updated reference values: for example, the osek patur revenue threshold historically is published by the Tax Authority (we saw it on a blog and Gov.il news
taxcollege.co.il
). If there’s an official source (like data.gov.il might have “tax thresholds by year”), we’ll use that to auto-update the app’s values each year. Similarly, the average wage (for Bituach Leumi calculations) is often published and could be scraped or taken from the National Insurance Institute site. If available via API, even better.
Calendars or Holiday Data: We might use a public calendar API to know Jewish holidays or weekends to adjust deadlines (since Israeli offices consider those).
Bank/Payment APIs: If integrating payments (see monetization section), we’d use Stripe/Nuvei APIs, but those are not government – they’re commercial. Still, listing them: Stripe API for payment processing (charges, subscriptions), Nuvei API if we integrate a local gateway (they have developer docs on their site), etc. Those will be crucial when building premium features.
External Business Info APIs: e.g., Dun & Bradstreet Israel or Zap (business directory) might have APIs to get business info by name or ID. Not sure if open, but if needed for enrichment (like auto-filling address or category), we could consider. Since user will input their own data mostly, this is lower priority.
Mapping and Address Validation: Possibly use Google Maps API or Israel Post API to validate addresses. For example, if user enters their address for license registration, using an API to get proper formatted address and postal code could reduce errors on official forms. Not a government API, but useful external integration.
Ministry of Interior Population Registry API: Unlikely open to us (that’s private), but if we ever needed to validate an Israeli ID number and name match, there isn’t a public API for that due to privacy. We will rely on checksum validation for ID numbers offline.
How to Integrate: For each of these, we plan whether it’s a real-time API call from the front-end or back-end:
Business registry lookup: likely back-end call (as it may involve scraping or a non-public endpoint).
Open datasets: could be fetched and cached on our server (like load the fire safety requirements JSON once a month).
Gov.il deep links: open in a webview or external browser from front-end.
Payment APIs: back-end (to handle secrets) and front-end (Stripe has client libs for checkout, etc.).
We will handle API keys and compliance: e.g., data.gov.il might require an API key for high usage (some require registering). We’ll ensure to follow their usage policy (ODbL license for open data which usually just requires attribution – we can credit sources in our app’s info).
Examples of deep links we will include in the report/app:
Link to the Open Fire Safety Conditions API (so devs can see format) – e.g., GET endpoint on data.gov.il for dataset “fire-safety-business” returning JSON
gov.il
.
Link to Gov.il service for opening Osek Patur (which covers VAT+Income tax)
gov.il
 – we use this as both a user-facing link and as a description of integration possibility.
Link to VAT Detailed Report service on Gov.il
gov.il
 – for users to click and file, and for us to note if an API exists behind it.
Link to Israel Company Search (if available publicly online – might be [Justice.gov.il Companies Search page]).
Link to data.gov.il Business License dataset (if a unified one is published) – or at least city example like Kfar Saba’s open dataset
kfar-saba.datacity.org.il
.
Possibly link to Privacy Protection Authority site for reference on our compliance (not directly needed in app, but in our sources here we might cite it as an authority on law).
Link to BizPortal (Bizdata): Kol Zchut mentions Bizdata (bizdata.org.il) as a free tool by Digital Israel for business planning
kolzchut.org.il
kolzchut.org.il
. This is not exactly an API, but a service we can refer users to for analytics and benchmarking. If Bizdata has an API or open data (maybe economic indicators for SMBs?), could be interesting to integrate insights (like “businesses like yours have on average X expenses”).
By leveraging these data sources, our PWA can reduce manual entry, provide verification (e.g., alert “Your license is about to expire according to city data”), and ensure that information we present (like regulatory conditions or thresholds) is authoritative and up-to-date
iapp.org
. Where an official API is lacking, we will rely on scraping or periodic manual updates, but we’ll note those as areas for future improvement (perhaps lobbying the government to provide better developer APIs as part of their open gov initiative).
5. Automation Opportunities
One of the main goals of our PWA is to automate tedious bureaucratic processes for SMBs. Automation can save users time, reduce errors, and ensure compliance by handling tasks on their behalf (with consent). Below we identify processes ripe for automation and how we plan to implement them, as well as opportunities for data enrichment to provide smarter services:
Compliance Calendar & Reminder Automation: Rather than relying on users to remember deadlines, the app will automatically generate a personalized compliance calendar. Based on the business profile (tax filing frequency, license renewal dates, etc.), the system will create events and reminders. We will integrate with device calendars and send push notifications. For example, after the user sets up their business info, the app might automatically create recurring events: “Submit VAT return” every two months, “File annual report” every March, “Renew business license” on a specific date, etc. The timing of reminders can be optimized (e.g., a two-week reminder, one-day reminder, and overdue alert). This automation ensures nothing falls through the cracks. The user can adjust or dismiss events, but defaults will be in place. This essentially serves as an automated bureaucracy assistant that keeps track of all obligations.
Form Filling Automation: The PWA can drastically simplify form filling by pre-populating forms with data the user has already provided or that we fetched from official sources. We will maintain a central profile of all the user’s key info (personal ID, company number, addresses, etc.). When a user needs to fill a form, instead of downloading a blank PDF and writing in the same info, our app can generate a filled form. For instance, when it’s time to submit Form 18 (business closure for VAT), the app already knows the user’s VAT number, name, and address – it can fill those fields and perhaps guess the closure date as today. The user reviews and just signs it. This can be done either via PDF templating or via an interactive form in-app that then produces the official layout. We could also do this for annual tax returns to some extent (pulling in totals from their bookkeeping if integrated, etc., although a full tax calc is complex). Even simple forms like the Bituach Leumi opening – we can fill name, address, just leaving the user to input specific numbers like income estimate. Another automation is storing copies of frequently needed documents (ID, company cert) so that when submitting an online form that requires attachment, the app can attach from its secure storage without user hunting files each time.
Data Validation and Error Checking: Manual form-filling often leads to errors (wrong ID, mismatched names, etc.). Our app can automatically validate inputs using external data (as described in Section 4). For example, if the user enters a company number, we can automatically fetch the official name and confirm it matches what they typed
vatify.eu
. If not, alert them – preventing a submission with the wrong details. We can validate Israeli ID numbers with the checksum algorithm instantly to avoid typos. Another validation: when users prepare a VAT report, we can ensure the numbers add up (the app can check that output minus input = reported payable). Or if a user claims zero sales for multiple periods, the app might flag “are you sure? Zero sales repeatedly might trigger tax office attention.” (This moves into advisory, which can be a premium feature, but the point is automation can highlight anomalies).
Integration with Government Systems (Automation of submissions): The ultimate convenience is if the app can file reports or submissions automatically on behalf of the user. This depends on available APIs or at least programmatic access. Some possibilities:
Automatic VAT Return Submission: If the Tax Authority offers a web service or if we use a headless browser approach with the user’s credentials (less ideal security-wise), we could send the VAT report directly when the user confirms the numbers. Many accounting software in Israel already do something similar (they produce the PCN874 file and can upload it via the tax authority’s secure portal). As a start, our app might generate the file and provide instructions to upload, but in future, fully automate upload at a scheduled time (with user consent).
Automating Tax Payments: Through integration with payment systems or the bank’s API (if user provides a Masav authorization or credit card), the app could automatically pay due taxes right before the deadline to avoid delays. For example, the app knows an advance payment of ₪1,000 is due on 15th, it could initiate that payment from the user’s account on 14th and send a confirmation. This requires heavy security and likely partnership with banks or an intermediate like Pepper / Poalim Biz API. Possibly outside MVP, but conceptually a big time-saver.
Renewal filings: For license renewal, maybe the app can submit a renewal request email to the municipality automatically with the necessary attachments the user already provided. Or, using an API if city provides (some cities have online portals for license renewal – we could mimic that submission).
One-Click Notifications: If a user needs to notify authorities of something (address change, closure, etc.), the app could have a one-click “Notify all” button. Behind the scenes, it sends an email to the VAT office, one to the Income Tax office, and maybe generates a letter to Bituach Leumi – covering all bases in one action. The content of these communications can be templated using user data. The user just confirms and the app dispatches them (and logs what was sent, to whom, when). This spares the user writing multiple letters/emails.
Document Management & Smart Reminders: The PWA can act as a mini-DMS (Document Management System) for official docs. For instance, it can parse and store the official confirmation of VAT registration (the certificate the user receives) and set reminders for any expiration (VAT registration doesn’t expire, but business license certificates do). It can also parse yearly notices like “Your advance tax % for next year is X” and adjust reminders accordingly. If the user connects their email, the app could automatically detect emails from gov sources (e.g., noreply@taxes.gov.il) and offer to import that info. For example, when the Tax Authority sends the annual property tax or a notice of underpayment, our app could pick it up and alert the user with an explanation. This kind of email scraping/automation would require user permission to read their email, which is sensitive; but it could be a future feature that really automates tracking official communications.
Data Enrichment from Registries: Using external data to enhance user experience:
Auto-fill addresses from the Israeli address database or Google API so that forms have correct format (improves acceptance by gov systems).
Business Category classification: If the user describes their business, we could map it to official codes (like Israeli industry classification) automatically using keyword matching. This might help if forms ask for “industry code”. There might be an open list of industries from CBS (Central Bureau of Statistics) or the Tax Authority (they have profession codes on forms). We can use that to present a dropdown or auto-select likely code, which saves the user from guessing.
Holidays Calendar: As mentioned, automatically adjust due dates if they fall on Shabbat or holiday (the app knows the holiday calendar via data and can show the adjusted legal due date, which often moves to next business day – that’s an automation of logic that ensures accuracy).
Exchange Rates: If user deals with foreign currency for some reason (less in basic SMB, but could be), pulling Bank of Israel exchange rates to help fill forms that require amounts in ILS, etc.
Intelligent Recommendations: By analyzing data (either user-specific or aggregated), the app can proactively assist:
Example: If the user’s Osek Patur revenues YTD are, say, 100K by October, the app can predict they might cross the exemption threshold (120K)
zscpa.co.il
 and automatically recommend: “It looks like you might exceed the VAT exemption limit. We’ll guide you to switch to Osek Murshah to avoid penalties.” This is data-driven and saves them from an end-of-year surprise.
Another: if a user consistently files VAT returns with large refunds (input VAT > output VAT), the app might suggest checking if they qualify to file monthly instead of bi-monthly to improve cash flow (since large refunds, maybe they can request monthly filing – under Israeli law if mostly refunds one can ask to move to monthly). This is advanced advisory automation.
Penalty avoidance: If the user misses a deadline, the app can automatically provide next steps: “You missed the VAT filing due yesterday. We’ve calculated a rough estimate of the potential penalty (₪____). It’s best to file ASAP. Click here to do it now.” and maybe provide info on asking for penalty waiver.
Chatbot / Q&A Automation: Incorporating a chatbot that can answer common questions 24/7 based on a knowledge base (which we build from the content). This isn’t process automation per se, but it automates customer support. E.g., user asks “How do I add an employee?” – the bot can respond with steps and link to the relevant module.
Many of these automation features can be gated by user permission and gradually introduced. Early on, we can focus on reminders and form-filling as the key automations (these are less sensitive and high-impact). As we gain trust, we might implement direct submissions and financial integrations (like auto-pay).
All automation will be designed with a human-in-the-loop mindset: the user stays in control. The app might prepare everything automatically, but usually ask for user confirmation before sending data to authorities (except maybe straightforward reminders). This ensures the user can review for accuracy.
Finally, automation must keep up with changes. If the government introduces new online systems (say a new unified filing portal), we adjust our automations to hook into those rather than the old way. Therefore, monitoring updates (Section 10) is crucial so our automated workflows remain valid and compliant.
6. Technical Stack Recommendation
To build a cost-effective, robust PWA with the capabilities discussed, we propose a modern full-stack architecture with an emphasis on Progressive Web App features (offline support, push notifications, etc.), scalability, and ease of development. The stack should leverage free or low-cost tiers initially, given budget-conscious goals, but also be able to grow with the product. Below is our recommended stack:
Front-End: React + Next.js (JavaScript/TypeScript) – Using React will allow us to create a dynamic and responsive user interface. We recommend Next.js (a React framework) for several reasons:
PWA Support: Next.js can be configured for PWA out-of-the-box (via plugins to generate service workers and pre-cache assets). It will help us implement offline functionality – e.g., caching key pages (like the checklist and form pages) so users can access them without internet, and enabling add-to-home-screen behavior.
Server-Side Rendering (SSR) & SEO: While our app is mostly an application (logged-in area not needing SEO), having SSR for public pages (landing page, help articles) will improve load performance and SEO. Next.js also supports static generation for content pages which can be great for our guides/documentation sections.
Routing and Internationalization: Next.js has built-in routing (file-based) which simplifies navigation in the app, and built-in support for multiple languages (i18n routing). We can easily serve English and Hebrew versions of pages, with proper <dir> direction tags for RTL on Hebrew pages. This is vital for our multi-language requirement.
Community and Plugins: Next.js/React has a huge ecosystem. We can use component libraries like Material-UI (MUI) or Ant Design which support RTL layout and have pre-styled accessible components, saving us time on UI. There are also many NPM libraries for things like form generation, PDF filling, calendar integration, etc., which we can incorporate cheaply.
Back-End: Node.js (Express or Next.js API Routes) with TypeScript – A Node.js server is a good fit for real-time operations and can also share code (like validation schema) with the front-end if using TypeScript. We have a couple of approaches:
Use Next.js API routes: Next can handle backend endpoints within the same project for simplicity (serverless functions when deployed on platforms like Vercel). This is great for a lightweight architecture – we can implement our API calls (to external services, or our DB) as serverless functions that scale automatically. Given budget, deploying on Vercel’s free tier could cover a lot initially.
Alternatively, a separate Express server can be used if we need more control (e.g., for long-running tasks or WebSocket push notifications).
Node.js is chosen for its cost efficiency (free open-source runtime) and the ability to use one language across the stack (JS/TS). The learning curve for our team is likely small with Node, and the community support is vast. We can also easily integrate with numerous Node libraries for PDF generation, email sending, etc.
Database: PostgreSQL (relational database) – We suggest PostgreSQL for the main application database due to its reliability, SQL capabilities, and open-source/free nature. Postgres will comfortably handle our structured data: users, business profiles, tasks, deadlines, form templates, etc. We can model the relationships (e.g., one user to many tasks, one business to many compliance records) naturally. Postgres is also known for being robust with financial data and can enforce constraints (we might use it to ensure unique user emails, etc.). It also supports JSON fields if we want some unstructured data storage (like storing a blob of form data). We can initially use a free tier of a cloud Postgres service (like Heroku’s free Postgres – though Heroku free tier is phased out in 2022, we have alternatives like Supabase free tier or Railway’s free tier). Postgres is also a good choice for long-term scaling, handling hundreds of thousands of records with proper indexing.
Justification: While NoSQL (like MongoDB) could be used, the transactional nature of our data (we may want to do joins, ensure consistency like deleting a business cascades to tasks) fits SQL. Also, for compliance (privacy), having a strong ACID DB ensures we don’t lose or corrupt user data. Postgres is free and open source, aligning with budget.
Alternative/Additional Data Store: We might complement Postgres with a lightweight key-value store or cache (like Redis) to store session data, frequent API call results (like caching open data results) to reduce latency and cost on repeated calls. Redis has free options on some clouds. But this is optional at start; Node memory or Postgres can handle caching small amounts initially.
Authentication & User Management: We can use Firebase Authentication or a similar service for quick, secure user auth that supports email/password, Google login, etc., without us building it from scratch. Firebase Auth is free for generous usage and saves us dealing with password storage security directly. It also easily supports features like multi-factor auth, which might be needed for security down the line. Alternatively, Auth0 has free tier for small users but can get pricey. Given budget, Firebase Auth (or Supabase Auth) is a good bet. If we use Firebase Auth, we can integrate it into our React app (it has SDKs) and still use our Postgres for other data.
Hosting / Infrastructure: We aim to keep infrastructure minimal:
Vercel or Netlify for hosting the front-end (and serverless functions) – they have generous free tiers and automatic deployments from Git. Next.js is first-class on Vercel.
If we need a persistent server (for websockets or certain scheduled jobs), we could use a small DigitalOcean droplet or Heroku (hobby tier ~$7) or Railway.app (which has some free credits) for the Node server and Postgres. However, we might avoid a constantly-on server by using serverless and cron jobs in the cloud (e.g., GitHub Actions, or Vercel Cron, or cloud functions scheduled).
We will use Cloud storage for user-uploaded documents if needed. For example, AWS S3 or Google Cloud Storage, which have free tier for some GBs. This is better than storing files in Postgres (for large files like PDF scans). We’ll integrate something like S3 (with a library like aws-sdk) to upload documents (like scans of ID, etc.) securely. As a budget option, we can use Firebase Storage which is free for quite a bit of usage and integrates with Firebase Auth’s security rules (so we can restrict files to owners).
Push Notifications: To send push notifications (for reminders) we’ll use the standard Web Push API via service workers in the PWA. Setting this up requires VAPID keys and typically involves sending notifications from the server. We could use a service like Firebase Cloud Messaging (FCM), which simplifies device subscription management and has a free tier. FCM works with web push in Chrome/Firefox and can unify our push handling across web and potentially mobile if we later wrap the PWA in a native shell. So the plan: use FCM for push – our server will trigger FCM messages when a reminder is due (or use Firebase’s scheduling if any, or our own cron jobs to check due tasks daily).
Multilingual and RTL Support: We will use an i18n library such as react-i18next or Next.js’s built-in internationalization. This allows us to maintain strings in English and Hebrew (and any other language) easily. We will store translations in JSON files. For RTL, libraries like Material-UI automatically switch to RTL if we set <Theme direction="rtl"> for Hebrew locale. We will also include some CSS for any custom components to support [dir="rtl"]. Testing in Hebrew from the start is vital. Additionally, for forms that output official docs in Hebrew, we’ll ensure our PDF templates or HTML outputs support Hebrew fonts (likely need to embed fonts if generating PDFs to avoid missing characters).
APIs & Integration Libraries:
For government integration, we may use Axios/fetch to call external REST endpoints (for open data JSON, etc.).
If interacting with SOAP or older systems, use appropriate clients (some Israeli services might have SOAP, e.g., if we ever integrate something like payroll systems – but likely not).
PDF Generation: Use a library like PDFKit or pdfmake (JS-based) or server-side ReportLab (Python) if we had a Python microservice. But staying in Node/JS, pdf-lib is another good choice for filling PDF forms (it can fill form fields in a PDF template). If official blank forms have fillable fields, we might load them and fill fields using pdf-lib.
Calendar: Possibly integrate a library for .ics file generation if user wants to add to Outlook/Google. Or use Google Calendar API to create events (with user permission). That might be something to consider for deeper integration (like connecting the user’s Google Calendar).
Database Access: Use an ORM like Prisma or TypeORM for type-safe database operations with Postgres, which speeds development and reduces errors. Prisma in particular can work well with serverless and has a free Data Proxy if needed.
State Management: On front-end, perhaps use React Context or Redux Toolkit for managing complex state (like the forms data across pages). Redux might be helpful if many components need to share data like the tasks list and profile info.
Security frameworks: Use Helmet on Node for setting security headers, rate-limit middleware to prevent abuse of any APIs (like someone spamming an ID verification endpoint), and ensure all network calls use HTTPS (which is default on modern hosting).
Budget Considerations: The above stack is largely open-source and free to use. The primary costs will be hosting:
Vercel/Netlify free tier: $0 to start (limited bandwidth but enough for MVP).
Postgres: could use Supabase free (500MB), Railway free ($5 of usage which might cover a small db), or a local instance on DO ($5/mo server). Possibly $0 initially.
Domain name and SSL: minimal (SSL is free via Let’s Encrypt or provided by hosts; domain ~$10/year).
Firebase Auth/FCM: free at our likely usage (they allow many MAUs and messages before billing).
S3 storage: pennies per GB, so likely <$1 for initial document storage since documents will be mostly small PDFs/scans.
This setup allows us to scale gradually: If usage grows, we can upgrade the Postgres to a larger instance or move to a managed service like AWS RDS. The Node backend can remain serverless on Vercel (they have paid plans for more bandwidth) or we containerize and deploy to a service like AWS ECS or Heroku if needed. React/Next can handle a large number of users with appropriate caching and CDN (Vercel uses CDN globally).
We also considered Firebase full-stack (Firestore as DB) as an alternative, since it offers an almost no-server approach: Firestore for data, Cloud Functions for backend logic, hosting for front. This could be cost-efficient up to a point (Firestore has a free quota). However, Firestore (NoSQL) might complicate some relational data needs and complex queries (like “find all tasks due next week for all users” for sending notifications might be harder). So, while we might use Firebase Auth and Storage, we lean towards Postgres for core data. If we absolutely needed to cut server costs, a Firestore+Cloud Functions approach could eliminate the need for our own server hosting, but we trade that for more complex data handling.
PWA Features Implementation: With Next.js, we will use a plugin or custom service worker. For example, next-pwa plugin can generate a service worker that precaches static files and pages. We will define which pages to cache offline (likely the dashboard, tasks list, maybe last viewed guide page, etc.). We’ll also ensure to cache our static assets (JS/CSS) and perhaps use the service worker for background sync – e.g., if user fills a form offline, the service worker can queue it and send when back online. The PWA will have a manifest.json defining app name, icons (we’ll design an app icon), theme colors etc., so that users can “install” it on their mobile home screen. We’ll test PWA compliance with Lighthouse to ensure it’s considered installable and offline-ready.
Multi-language and RTL tech: We will maintain separate locale files and use <html dir="rtl" lang="he"> when rendering Hebrew. We can use libraries like rtl-css-js or just manual CSS to flip any needed styles (most modern CSS frameworks handle it, as long as we include their RTL CSS or use logical properties). Next.js can detect user locale or use subpaths like /he/ for Hebrew pages.
DevOps and CI/CD: We’ll set up GitHub or GitLab CI for automated testing and deployment. Vercel integrates with Git – every push can deploy to a preview, making it easy and free to iterate. Testing frameworks (Jest for unit tests, Cypress for integration tests on the UI) should be added to catch bugs, especially given regulatory stakes (we don’t want a calculation error in deadlines).
In conclusion, this stack (React/Next, Node, Postgres, plus Firebase services) offers:
Cost efficiency: heavy use of free tiers and no costly licenses.
Development velocity: thanks to high-level frameworks and one language (JS/TS) across stack.
PWA excellence: Next.js + service worker plugin for offline and push, easy multi-platform support (web, mobile via installable PWA).
Scalability: Each component (frontend, serverless backend, DB) can scale on cloud as needed, and separating concerns (we can scale read-heavy with CDN, and write-heavy with optimizing DB or adding caching).
Maintainability: Using TypeScript helps reduce bugs; using popular frameworks ensures many devs can understand the code if the team grows.
7. Database Design and Entities
We will design a database schema that captures all necessary information while adhering to data minimization (collecting only what’s needed) and ensuring regulatory compliance. Here’s a proposed data model with key entities and their attributes:
User – represents an individual using the app.
Fields: user_id (primary key, could be email or a UUID), name, email, phone (optional), password_hash (if not using external auth, but likely we use Firebase so we might store Firebase UID here instead), preferred_language (en/he), notifications_enabled (preferences for push/email).
Notes: We store minimal personal info – name and contact. If using external auth, we might not even store password. We do not need things like ID number here, because ID number is tied to a business (for a sole proprietor, the business ID is the person’s ID, but we will store that in Business entity). Data minimization: don’t ask for address or other PII unless needed for a feature. We can optionally store a government_id if user wants us to remember their Teudat Zehut for form-filling, but that is sensitive so we might store it under Business instead for sole proprietors. All personal data will be protected (see security section).
Business Profile – each user can have one or multiple businesses they manage (to support an accountant or an entrepreneur with multiple businesses).
Fields: business_id (PK), user_id (owner or main admin, foreign key to User), business_name, business_type (enum: SoleProprietor, Company, Partnership, etc.), registration_number (for company: the 9-digit company number; for sole trader: their ID; for partnership: partnership reg no if exists or combined IDs), vat_status (patur/murshah), industry_category (maybe a code for type of business e.g., retail, food – to help determine license requirements), start_date, closure_date (if closed), address (could be broken into street, city, etc., if needed for forms – or we store it in a related Address table if normalization needed, but one address per business is fine here), license_required (boolean), license_expiry (date if applicable), tax_office (maybe store which regional tax office they belong to, to know where to submit forms – could derive from address, but storing might be easier if user selects it).
Notes: This table centralizes key business info. Data minimization: we store what we need for forms and compliance – likely we do need most of these. We avoid extraneous fields; e.g., we wouldn’t store number of employees here (that can be derived from having an employee list if we even need that level, or simply from tasks). But maybe a has_employees boolean is useful to toggle employer-related tasks. We also include vat_frequency (monthly/bi-monthly) and income_tax_advance_frequency to drive schedule – these could be derived from law (if revenue > threshold monthly else bi-monthly) but we may allow override if tax authority specifically instructs a different frequency. For companies, registration_number is sensitive but public (it’s on the certificate, not secret). For sole proprietor, their ID is sensitive personal data; storing it is necessary for form-filling though. We will encrypt this field in the database (or at least strongly hash if we only need to verify and not display, but since we need to print it on forms, we’ll encrypt and decrypt when needed).
Task/Compliance Item – each individual obligation or task for the business.
Fields: task_id (PK), business_id (FK), task_type (category e.g., “VAT Filing”, “License Renewal”, “Income Tax Payment”, “Custom” etc.), description (short text like “File VAT for Jan-Feb 2025”), due_date, frequency (if recurring, e.g., “bi-monthly” or a cron expression or period field to auto-generate next tasks), completed (boolean), completed_date. Possibly official_form (FK linking to a Form template entity, see below) to know which form is associated, and data (JSON blob to store any specific data like “amount to pay” for a tax payment task).
Notes: This table drives the reminders. Upon creating a business, we will insert a bunch of rows here (for upcoming year’s deadlines, or generate on the fly). Recurring tasks can regenerate new instances when one is completed (or we have a logic to compute due dates on the fly rather than storing far future tasks). Completed tasks we keep for audit/history (and to allow user to see what’s done). We might separate one-time tasks (like initial registrations or closing tasks) from recurring tasks (like monthly filings). Potentially have a recurrence_pattern table or store in task. But to keep it simple, tasks that recur will spawn new tasks.
Data minimization: tasks are not personal data, they are operational. We store minimal info needed to identify the task.
We’ll also have tasks for administrative updates (like “update app content for new tax year” – but those aren’t user tasks, rather internal, so those might not be in this DB, or we have a separate table for system admin tasks if we build an admin back-end).
Document (or Form Submission) Tracker – to track official documents for the business.
Fields: doc_id, business_id, doc_type (e.g., “Form821”, “AnnualReport2024”, “LicenseCertificate”), status (e.g., pending, submitted, approved), due_date (if applicable), file_url (if we stored a copy of the filled or submitted document), reference_number (if the authority gave a reference).
Notes: This table is like a log of forms and filings. It overlaps somewhat with tasks, but more document-centric. For instance, when a VAT return (task) is done, we could log a document with the submission confirmation. Or when the user uploads their Business License PDF, we store it here with type “LicenseCert”. This helps the user (and us) have all key papers in one place. It also enables a feature where the app shows something like “Uploaded ✅ Certificate of Incorporation, ✅ VAT Certificate, ❌ haven’t uploaded NII confirmation”. However, we should be careful: storing actual documents (like ID scans or certificates) is sensitive; we should store only what’s necessary. Perhaps we give users the option to store certain docs in their vault for convenience. By default, we might store nothing or only public documents. This adheres to data minimization – e.g., we don’t automatically pull their official docs unless needed. But likely storing the business license or incorporation cert is beneficial for automations (the app could then remind before license expiry as it knows the date from the cert or from them entering it). We will secure these file URLs (they’ll be in cloud storage with access rules).
Another approach: merge document tracking with tasks (e.g., tasks have an optional file attached and reference number). But separating might be cleaner.
Form Template/Metadata – an entity to represent official forms, for generating and linking to instructions.
Fields: form_id, name (e.g., “Form 821 – VAT Registration”), description, download_link (URL to blank form on official site), auto_fill_supported (bool – whether our app can generate it), last_updated (date of form version). Possibly also store fields (a JSON of field mappings if we auto fill).
Notes: This is mainly for our reference. It allows the app to list forms (like in the library section) and link tasks to forms. For example, a “VAT registration” task can reference form_id of 821 to easily fetch info (like where to send it, which our instructions know). If forms update (new version), we update one row here instead of hunting through code. We may also store in this entity the submission_method (e.g., “Submit via email to X or in person”) so we can display that in the UI or potentially use it in automation logic (like knowing the endpoint).
Data minimization: This entity doesn’t hold personal data – it’s reference data. So no privacy issues; we can store as much as needed to facilitate features.
User-Business Relations/Roles – if we allow multiple users per business (e.g., co-founders or an accountant invited), we’d need a join table like business_user_role (business_id, user_id, role). Role could be Owner, Editor, ReadOnly, etc. Initially, we assume one user = one business to keep things simple, but planning multi-tenant usage (accountant scenario) is good for future. Designing the DB with separate user and business tables already sets the stage for multi-tenant. We just might not expose adding team members until later. The table can be there or added easily.
Audit Log – for security compliance, we might have a table that logs important actions (user logged in, changed data, generated a form, etc.) with timestamp, user_id, action, details. This helps with audit logging requirement of privacy regs
iapp.org
. It’s also useful in debugging and proving compliance (e.g., if user says “I filed on time via your app”, we have a record of that action). We’ll likely implement this after core features, but mention it for completeness.
Settings/Config – a generic table for app-wide settings (e.g., current VAT threshold, current tax rates, etc.). Could be key-value pairs. This way updating such values doesn’t require code changes. An admin UI can edit it (Section 10 discusses change mgmt).
Data Minimization Best Practices: From a privacy perspective, we commit to collecting and retaining only what’s needed to provide value:
We avoid storing full sensitive personal info unless absolutely needed. For example, we won’t store a user’s national ID unless they want us to for auto-filling forms. Even then, we might allow it but with encryption or just ask them each time (trade-off between convenience and holding sensitive data). Another example: we won’t ask for or store things like gender, date of birth, etc., as irrelevant to these processes.
We pseudonymize where possible. The primary key for users is a random ID, not their email or name, to avoid exposing identity in logs. We might keep email for login, but we can hash it in certain contexts.
Encryption at rest: For fields like registration_number if it’s a personal ID, we will encrypt it in the DB using Postgres PGCrypto or at the application level. Same for any stored passwords (though with Firebase Auth we don’t handle passwords ourselves).
Limited retention: We will offer users the ability to delete their account and all associated data (as required by law upon request). In our DB design, deleting a user will cascade delete their business and tasks. We’ll ensure that backup retention policies align with privacy regs (e.g., if we delete user data, we remove it from active DB and ensure it gets removed from backups in a reasonable timeframe).
No oversharing: Each user’s data is linked to their user_id or business_id, and all queries will be scoped to that. We will implement access control in queries (e.g., a user cannot query tasks for a business that isn’t theirs). This is both a security and privacy measure, preventing any data leakage across accounts. If we implement multi-tenant (accountants), we’ll have role-based access so that, say, an accountant user can see Business X because they’ve been given access, but not others.
Masking where appropriate: In the UI, if we display sensitive numbers (like ID or account numbers), we may mask parts by default (like show last 3 digits) and reveal fully only on demand, to avoid shoulder-surfing issues and to reduce exposure.
The database design also supports compliance by making it easier to find and delete data. E.g., if a user requests to see all personal data we have on them, we know it’s mainly in User and Business tables. If they request deletion, we delete those entries (and via cascading, all tasks and docs). Audit logs may be an exception – sometimes you keep logs for legal reasons even after user deletion, but we could anonymize logs (replace user id with something) if needed to honor deletion but keep system integrity.
Entities Summary:
User (UserID, Name, Email, etc.) – minimal personal data.
Business (BusinessID, Name, Type, RegNo, … key profile info including whether license needed, etc.).
Task (TaskID, BusinessID, Type, DueDate, Completed, etc.) – each compliance task or event.
Document (DocID, BusinessID, Type, Status, FileRef, etc.) – track forms and files.
FormTemplate (FormID, Name, URL, etc.) – reference for official forms.
(Optional) BusinessUser join for multi-user access.
(Optional) AuditLog for actions.
(Optional) Config for global settings.
(Optional) Notifications (if we want to track if a specific notification was sent or read, could have a table of notifications per user, but not required – we can use Task as a basis for notifications without separate table).
We will enforce referential integrity (foreign keys from tasks to business, business to user, etc.). We’ll also use indexes on key fields like due_date (for quickly querying upcoming tasks) and maybe on status flags.
Finally, a word on multi-language data: If we need to store data in multiple languages (e.g., business name in Hebrew vs English), we might add fields or separate translation table. But for business name, likely it’s one official name in Hebrew (for local forms) and maybe we allow a Latin transcription if they want. We may not need to separate that in DB, could just store exactly as needed for forms (which is typically Hebrew).
This database design provides a solid foundation to implement the features while being mindful of data privacy. It is normalized enough to avoid duplication (one place for each piece of info) which helps if laws or user changes happen (update in one place). At the same time, it’s structured to answer the queries we’ll have: e.g., “what tasks due for user X in next week” (join Task->Business->User or directly Task->User via business). We will test these queries under load if needed.
8. Infrastructure for Monetization (Post-MVP)
As we plan for the business model and scaling, we need to build infrastructure that supports monetization in the future, such as payments, premium feature gating, and multi-tenant or white-label capabilities. Although our MVP is focused on delivering core value, designing with these in mind from the start will save refactoring later.
Payment System Integrations
For processing payments (should we introduce paid plans or one-time service fees), we’ll integrate with reliable payment gateways that operate in Israel:
Stripe: Stripe launched support for Israeli businesses (they can payout to Israeli bank accounts) as of 2021. Stripe is developer-friendly, with a robust API and clear pricing, and supports credit cards and various payment methods. We recommend Stripe for handling subscription billing or one-time charges
hellodarwin.com
. With Stripe, we can implement a subscription model (monthly/annual fees for premium tier) using Stripe Billing; it will manage recurring charges, retries, invoicing, etc. For instance, a premium plan at NIS X per month can be set up in Stripe, and the app simply checks the subscription status via Stripe API. Stripe’s advantage is transparency and ease of integration (plus they handle PCI compliance). The fees (around 2.9%+1.2 NIS per transaction) are reasonable for SMB SaaS, and there’s no monthly minimum. We will incorporate Stripe Elements for a smooth checkout in-app.
Nuvei (formerly CreditGuard): Nuvei is an Israeli/global payment provider that might offer better support for local payment methods, possibly installments, or acceptance of local debit cards. Nuvei might have an edge if we want NIS settlement and Israeli-specific features. However, their integration can be a bit more involved and they typically work with businesses that have larger volume or need tailored solutions
hellodarwin.com
. For MVP, Stripe might suffice; but we keep the option for Nuvei if, for example, we need to support direct debit or local wallets. Nuvei’s API would allow transactions in NIS and might integrate with things like Isracard, etc., more natively. We could abstract our payment interface so we can plug in additional gateways later (some companies might prefer a local provider). But to minimize initial complexity, likely choose one (Stripe) and stick with it unless a client specifically asks.
Other Payment Options: The prompt mentioned RavKav, which is actually the brand name for transit cards in Israel – perhaps it was referring to some payment system or it might be a confusion. Possibly they meant “Rav-Kav Online” which isn’t a payment gateway, so likely not relevant. However, there are other Israeli payment avenues:
PayPal (widely used, including in Israel; could offer it as an alternative if some users trust it, but it’s easy to add later via Stripe integration with PayPal or as separate).
Direct Bank Transfer (Masav): For businesses, sometimes recurring payments are done via direct debit (Masav). If we later charge larger clients, we might allow them to pay via bank transfer invoice. But not needed at small scale.
Local digital wallets (like Bit or PayBox) are popular P2P but not typical for SaaS payments; we likely skip those.
We suspect Stripe covers enough (since it accepts credit cards, Apple/Google Pay, etc., which should be fine for most).
Implementation: We will set up a backend endpoint that handles Stripe webhooks for payment events (like successful payment, subscription renewal, failed payment). This ensures we can update our database (e.g., mark user’s plan as paid through next period). We’ll store minimal billing info in our DB – likely just a plan field on the user or a separate Subscription table with user_id, plan_type, status, renewal_date etc. The actual payment details (card info) will stay with Stripe (we’ll use tokens; no sensitive card data on our servers). We’ll also comply with Israeli tax invoice regulations for our own service: since we’ll be charging users, we might need to issue a proper invoice (Stripe can auto-generate receipts, but in Israel, an official receipt/tax invoice might be needed if we’re a registered business – we can consider using Stripe’s invoice customization to include our VAT ID, etc.).
Feature Gating (Freemium Model)
We plan to offer a free tier with core features and a premium tier with advanced automation and personalized support. To implement this:
Plan tiers in DB: We will define plans, e.g., “Free”, “Premium”. The User or Business entity will have a plan attribute or we’ll have a separate Subscription record linking to plan. If multi-business, we might make plans per business (so a user could choose which business to upgrade). However, likely it’s user-level if one user = one business typical case. We’ll decide, but storing plan info is straightforward.
Conditional Features: In code, we’ll wrap premium features with checks. For example, free users might get basic deadline reminders, but premium users might get: auto-filing, direct chat support, advanced analytics, etc. The app’s UI will show premium features with a lock icon or “Upgrade” call to action if a free user tries to access them. We must ensure the backend also enforces these – e.g., if a free user calls an endpoint to auto-submit a VAT return (a premium feature), the backend should reject or prompt upgrade.
Examples of Premium Features to gate:
Auto-generation and submission of forms (maybe free allows generating but not auto-submitting).
Integration with accounting software or bank feeds.
Team collaboration (maybe free for one user, premium to invite accountant or partner).
Advanced customization of the compliance calendar or custom task templates.
Data backup/export perhaps free, but maybe extended data history only premium.
Priority support or consulting could be premium (though that’s outside app technically).
We’ll define these so that free tier is fully useful (covering everything mandatory, so people will love it), and premium makes it even easier (automation, time-saving, rich insights).
Trial management: Possibly allow a free trial of premium for new users (e.g., first 30 days premium features). Our system should be able to switch a user’s plan and schedule a downgrade if trial not converted. This means storing trial_expiry date and checking it.
Tenant-Ready (Multi-tenancy & White-Label):
Multi-tenant (Organization accounts): We should build the data model and auth in a way that multiple users can collaborate on one business (like an accountant and a business owner both accessing the same data). Our earlier mention of a join table BusinessUserRole covers this. We’d implement an interface for the business owner to invite another user by email. That user would then have access with certain permissions. The system would scope data by business_id and role. All our queries already join on business which is tied to a user’s context, so adding more users is natural. We should test that our code always filters by the current user’s allowed businesses so one user can’t see another’s (this is part of access control).
By being multi-tenant in design, we also open the door to B2B offerings: for example, a large accounting firm could sign up and manage 50 businesses through one interface (with each business as a record in our DB, possibly under that firm’s user account group). To scale that, we might incorporate an “Organization” entity above users (org with many users, each user can have businesses). But since accountants might handle many unrelated businesses, perhaps the user itself is the org (like one user manages many businesses, already allowed). If multiple accountants in one firm want to share, we then consider an Org grouping multiple user accounts. That complexity can be added when needed.
White-label / Partner integrations: Tenant-ready could also mean the ability to spin up separate instances or segregate data by client group. For example, if down the line the Israeli Chamber of Commerce wants a version of the app for their members, we might want a way to “theme” or separate those users. An easy way: include an organization_id or partner_id field on User, which could tag users belonging to a certain partner. We can then scope or theme content accordingly. Not needed at start, but mentioning it as we might design the DB with extensibility (maybe just keep in mind not to tie everything to a single global context if we foresee partitions).
On a technical level, multi-tenancy also means making sure our architecture can handle multiple distinct sets of data securely. We are doing that logically with foreign keys. We won’t need separate databases per tenant unless a particular client demands it; one database with proper scoping is enough for now. If white-label with separate DB was needed, our code should be flexible to point to different DB connections, etc., but that’s over-optimization now.
Scalability for Monetization
Once money is involved, reliability and auditability are crucial. Some considerations:
Transaction Logging: For payments, we will log transactions in a Payments table including amount, date, Stripe charge ID, user, etc., so we have an internal record besides Stripe’s dashboard. Important for accounting and to handle any disputes or double-check if webhook missed.
Currency and Tax on our service: If we charge in shekels (likely, since Israeli SMBs expect NIS), Stripe can settle in ILS and we need to include 17% VAT on our service if we are an Israeli company selling to Israeli customers (digital services usually are subject to VAT). We would then possibly need to issue VAT invoices. We might integrate with an Israeli invoicing system or just manually handle at small scale. But maybe initially we might avoid charging VAT by using some threshold or model (like if we incorporate outside IL or if customers are B2B they can self-account, but likely we’ll register for VAT ourselves when we monetize).
Freemium conversion tracking: We should have metrics to see how many free users convert to paid, which features drive conversion, etc. So some analytics (non-personal, or aggregated) will be needed. We can use tools like Google Analytics or Mixpanel with caution (ensuring compliance, maybe only tracking events in a way that doesn’t leak personal data). This helps us refine monetization approach.
Paywall UX: Provide in-app upgrade prompts at natural points. E.g., user tries to auto-submit a form (premium feature) – we show “Upgrade to Premium to enjoy one-click filings and more” with a button. On click, integrate with Stripe Checkout for seamless purchase and then unlock features immediately via webhook or callback. Ensure the app listens for the post-payment event to update user status without requiring logout.
Customer Support for Paid Users: Possibly integrate a support chat or ticketing system (even email) where premium users get faster responses. Not a direct tech stack piece, but we might tag users in our support tool by plan.
By laying the groundwork in the data model (plan fields, roles) and choosing Stripe which is easily integrated, we make the app monetization-ready. We’ll test the payment flow thoroughly with test cards before going live to avoid any revenue loss due to bugs.
9. Security and Compliance Measures
Handling sensitive business and personal data, our PWA must implement strong security and compliance measures from day one. We will follow best practices in web security, align with Israeli legal requirements (Privacy Protection Law and data security regs), and document our compliance efforts. Here’s a breakdown of key measures:
Data Encryption and Secure Storage
Encryption in Transit: All network communication will be done over HTTPS with TLS encryption. We will enforce HSTS so that browsers always use HTTPS. This protects user data (credentials, form info, etc.) from eavesdropping. If using service workers, we ensure the service worker itself is served over HTTPS (required for PWA) and that any external API calls (like to gov APIs) are also to HTTPS endpoints where available.
Encryption at Rest: We will encrypt sensitive fields in the database. For example, if we store national ID numbers or access tokens for APIs, those will be encrypted using strong algorithms (AES-256-GCM or similar) with a server-held key. We might use a library or PG’s encryption functions for this. If using cloud storage for documents, we’ll enable server-side encryption (S3 does AES-256 by default, for instance) and optionally use our own encryption before upload for extra security (client-side encryption). Additionally, database backups will be encrypted. We’ll manage encryption keys securely – possibly using a cloud KMS (Key Management Service) which often has free tier for a few keys. By encrypting, even if someone got hold of the DB data, critical personal info remains gibberish.
Access Control (Authorization): We implement strict checks in code to ensure users can only access their own data. This means every API endpoint will infer user identity (from JWT or session) and filter queries by that user’s permitted scope (their user_id or business_id). On the front-end, we’ll hide UI elements that shouldn’t be accessible (but still enforce on backend to be safe). If multi-user roles, we’ll enforce role-based permissions: e.g., only an “Owner” can invite new members or delete the business, a “Read-only” advisor might view tasks but not mark them complete, etc. We’ll likely incorporate a middleware that checks the user’s role for certain routes.
Authentication Security: If using Firebase Auth or similar, we inherit a lot of security (like salted hashing for passwords done by Firebase, etc.). We’ll enforce strong passwords (the auth service usually does by default or we add rules: e.g., minimum length). We’ll also offer 2FA/MFA for users (could be via Firebase which supports SMS or Authenticator app login). Particularly if accountants or others use it, enabling MFA adds security to accounts that have lots of client data. We will also implement session management securely: use HTTPOnly cookies or secure storage for tokens, short token lifespans with refresh, detection of unusual login (maybe notify user on new device login).
Secure Coding Practices: We’ll follow OWASP guidelines to prevent common vulnerabilities:
Protect against SQL Injection by using parameterized queries or an ORM.
XSS (Cross-Site Scripting): Use React which auto-escapes content. For any user input that is rendered (like if we allowed custom task names or notes), we’ll escape or sanitize properly. We’ll also use Content Security Policy headers via Helmet to restrict script sources, etc., mitigating XSS.
CSRF (Cross-Site Request Forgery): Since we’ll likely use JWT in SPA or cookies, we’ll implement CSRF tokens if needed for sensitive state-changing requests if using cookies. If using JWT in Auth header, CSRF is less of an issue, but we might use double-submit cookie pattern for extra safety on forms.
Clickjacking: Use framebuster headers (X-Frame-Options: DENY via Helmet) to prevent our app from being iframed.
Rate limiting & brute force protection: On our API, especially login or any critical function, implement rate limits (e.g., max 5 login attempts per 5 minutes per IP) to slow down brute force. Also potentially use Captcha on sign-up or critical actions if abuse is observed.
Input validation: All user inputs (especially that go into forms generation or API calls) will be validated against expected formats. This prevents accidental malformed requests and security issues (like if an input is later used in a shell command, though we likely won’t do that; more relevant is ensuring an input doesn’t break PDF gen or something).
Secure Storage of Keys and Secrets: Any API keys (for Stripe, third-party APIs, etc.) will not be exposed in front-end. They’ll be stored in environment variables on the server or integrated via a secret management if on serverless (e.g., Vercel’s secret env). We’ll ensure to not commit secrets to code repo. For encryption keys, ideally use a KMS or store in env variables that are not accessible to front-end. If using Firebase, certain keys (like Firebase API key) are okay to expose (not truly secret), but any admin or service account keys won’t be on client side.
Audit Logging: As per Israeli regs, we will “adopt a written policy and implement measures including audit of access”
iapp.org
cookie-script.com
. Concretely, we’ll maintain logs for administrative access to data and possibly for certain user activities:
Admin actions: If we build an admin portal for ourselves, every time admin views or edits user data, that’s logged (so we have an audit trail to show we monitor internal access).
User actions: We log login times, important changes (like user changed their email, user exported data), and potentially any access to sensitive info (for example, if a user views their stored ID number, we could log that – but since it’s their own, not as critical; this is more for admin).
These logs will include timestamp, user, action, and ideally IP or device info for security events. They’ll be stored in an append-only fashion (maybe in a separate table or log management system). In case of a breach, these help forensic analysis. Also, the Data Security regs require logging access to databases containing sensitive info
iapp.org
, so we’ll consider even logging queries that fetch personal data (perhaps too granular in practice, but at least log that “user X downloaded their data on Y date”).
Secure Development Lifecycle: We will perform code reviews with security in mind and use tools (like static analyzers or dependency vulnerability checkers). We’ll keep dependencies up-to-date (relying on npm audit or GitHub Dependabot to alert to vulnerabilities in libraries).
Compliance Documentation and Workflows
Privacy Policy & Terms of Service: We will draft clear privacy policy and terms that users accept, which detail what data we collect, how we use it, how it’s protected, and users’ rights. This is required by law and builds trust. It will mention compliance with Israeli Privacy Protection Law, how users can exercise their rights (access, rectification, deletion as in Section 2 above)
cookie-script.com
cookie-script.com
. We’ll provide a channel (email or in-app) for privacy requests. The policy will also clarify data retention (for instance, tasks data is kept for X years unless deleted, etc.) to comply with data minimization and retention principles
cookie-script.com
cookie-script.com
.
Internal Privacy/Security Policy: As required, we’ll maintain an internal document describing how we protect personal data
iapp.org
. This will cover things like who has access to production data (perhaps only the CTO and one engineer, etc.), how we handle breaches, how often we review security, etc. We’ll also document our data inventory (mapping what personal data is stored in each system)
iapp.org
. This is useful not just for compliance but for clarity among our team. If the Privacy Protection Authority ever audits us, having this ready is crucial.
Appointing Officers: Under Amendment 13, if we grow to handle a lot of sensitive data, we might need to formally appoint a Privacy Protection Officer (PPO) and a Data Security Officer (DSO)
safetica.com
cookie-script.com
. Initially, our team leads can fill these roles (e.g., CTO as security officer). We will note this in our docs. The responsible person will conduct periodic risk assessments and ensure ongoing compliance (as required by law).
User Consent and Preferences: We will obtain user consent for things like sending notifications or emails beyond necessary service messages (e.g., newsletter or promotional content – we won’t spam by default, maybe only send critical compliance reminders which is part of service). If we integrate any analytics or tracking that might collect personal data, we will have a cookie consent or similar mechanism to let users opt out, in line with Privacy Protection Law and perhaps other regulations like GDPR (which might indirectly apply if we get foreign users). For now, target is IL users, but we err on side of transparency.
Data Subject Requests Workflow: We’ll have a defined process for handling requests such as:
Access: If a user asks for a copy of their data, since we provide a lot in the UI, they can manually get most. But we’ll also be ready to export all their raw data (we could build an export function that generates a JSON or PDF report of all their info).
Deletion: When a user deletes their account in-app, we will (after a confirmation) delete all personal data. Possibly with a short delay or a “soft delete” period in case they reconsider, but as law suggests, if they request deletion, we should delete unless we have legal reason not to. For business compliance, we likely don’t need to keep their data if they leave. We might keep some aggregate stats but not personal identifiers.
Correction: Users can edit their profile info anytime, that covers rectification. For things they cannot edit themselves (like a wrong log entry), they can contact support.
We will respond to these requests within the legally required time (likely 30 days or so in Israeli law for access requests).
Incident Response Plan: We will develop a workflow for potential data breaches. Israeli regs require reporting severe breaches to the PPA “immediately”
iapp.org
. So our plan:
If we suspect a breach (like data leak or hack), the DSO will lead an investigation, identify scope, and within 24-72 hours (likely as soon as confirmed) report to the Privacy Protection Authority’s incident form (they have an online form or email for such).
We’ll also notify affected users (if e.g., their personal info was compromised) as per best practice, unless law says otherwise (Israel’s law encourages notifying data subjects if it’s a severe breach).
We’ll document the incident and our response for our records.
We’ll then fix the vulnerability that led to it, and possibly offer affected users mitigation help (like advice to change passwords if that was an issue, etc.).
Having this planned meets regulatory expectations and minimizes damage.
Regular Security Audits: We will schedule periodic reviews of our security measures. This could be internal audits (like every quarter, review user access logs, test backups restore, check dependency vulns) and eventually external audits (maybe hire a firm to do penetration testing annually once we handle a lot of data). The 2017 regs specifically mention regular audits and risk assessments
cookie-script.com
, so we’ll incorporate that culturally.
Employee Training & NDA: If we have team members beyond founders, we will train them on privacy and security (as per regs)
cookie-script.com
. This means ensuring they know not to mishandle user data, to follow secure coding, and to report any suspicious issue. We will also have them sign confidentiality agreements acknowledging the sensitivity of data. Although our team may be small, this formalizes privacy culture.
Secure Device and Environment: Development and production environments will be secured. Developers should ideally work on anonymized or test data, not real user data. Production database access will be limited (only via secure VPN or keys, not directly open). We’ll also ensure our machines are encrypted and we use 2FA on all cloud services (like the hosting, Git repo, etc.) to prevent supply chain attacks.
By implementing all the above, we intend to not only comply with Israeli regulations but also build user trust through solid security. We will mention compliance certifications or standards if applicable: while we may not immediately pursue ISO 27001 or SOC2 (expensive for a startup), we align our practices with their principles, which will help if we target enterprise clients later. Also, since the app deals with potentially financial-related data, demonstrating strong security can be a selling point.
In summary, security is woven into our design (encryption, access control, safe coding) and compliance is maintained by policy and transparency (clear privacy policy, user rights, logging, training). We will continuously update these measures as laws evolve (for instance, if Amendment 13’s regulations spawn new guidelines, or if biometric data comes into play in some feature, etc., we’ll adapt).
10. Maintenance and Change Management
The bureaucratic rules and government interfaces our app relies on are not static – forms get updated, laws change, and URLs move. We need a robust strategy to keep our content and integrations up-to-date. Additionally, as our user base grows, we should have administrative tools to manage content changes efficiently. Here’s how we plan to handle maintenance and change management:
Keeping Official Links and Information Current
Regular Update Checks: We will establish a routine (e.g., quarterly or monthly) to review critical content:
Visit key Gov.il pages (VAT registration, business licensing, tax authority news) to see if any forms or procedures changed.
Subscribe to newsletters or RSS feeds: For example, the Tax Authority often issues press releases or circulars on changes (like new thresholds each year, new online services). We should subscribe to the Ministry of Finance/TAX newsletter or check the Gov.il updates section relevant to businesses
sba.org.il
.
Monitor Kol Zchut (All Rights) site updates: Kol Zchut is actively maintained and often quickly reflects changes in processes. Since we’ve used it as a source, we can periodically check pages (they have “last updated” notes) to catch changes. They also often link to updated forms.
Data.gov.il datasets: Some open datasets have version info or update frequency mentioned. For example, the fire safety requirements dataset might be updated when regulations change. We can use their API to check if new data is available (maybe by checking a “last modified” timestamp via the API). If a dataset is updated, we can incorporate those changes (perhaps even automate a nightly fetch to always have latest).
Government API changes: If we integrate with any official API or site, ensure we’re on mailing lists or developer portals for those. E.g., if the Corporations Authority ever provides an open API or changes their site, we want to know. Since some things we do might be unofficial scraping, we have to be vigilant that a site redesign could break our code. We might implement automated tests or pings – e.g., a small script to attempt a company lookup and alert if it fails (indicating site changed).
Community and Forums: Participate in local SMB or accounting forums (even Facebook groups, professional forums) – often, practitioners discuss changes (like “hey the tax authority website changed the login procedure this week…”). This informal intel can be early warning. Also, engage with organizations like the Small and Medium Business Agency (sba.org.il); they might announce reforms. For licensing, the Ministry of Interior or Economy might publish news on reforms (like the “עסק זעיר” reform we saw
gov.il
). We should keep an eye on the Knesset legislation tracker for any new amendments in relevant laws (e.g., if a new Amendment 14 to Privacy Law comes, we adapt accordingly).
Versioning of Content: Internally, maintain version numbers or dates for forms and procedures. For instance, our FormTemplate table can have a version field. When we become aware of a new form version, we update the link and version. The app could then notify admin or even users if needed (e.g., “Form X has been updated, make sure to use the latest one”). Usually changes are minor (like year or minor fields), but if significant (like a new requirement to report something), we might also update our guidance text.
User Feedback Loop: Provide a channel for users to report if something seems outdated or broken. For example, a user might click a link to Gov.il and find it 404’s. If they tell us via a “Report an issue” button, we can quickly fix it. We may implement a small feedback widget on each guide page like “Is this information still correct? Yes/No” and if no, ask what’s wrong. This crowdsourcing helps catch changes early, given users are on the front lines renewing licenses or filing returns.
Admin Backend or CMS for Content
To avoid constant code deployments for content tweaks, we will set up a lightweight Content Management System (CMS) or admin portal. This will allow non-developers (or a developer with no code change) to update text, links, and possibly add new tasks or forms. Options:
Use a headless CMS like Strapi, Contentful or even Google Firebase’s Firestore for storing content. But given our content is quite structured (forms, tasks), maybe building a simple admin UI ourselves is feasible.
Admin Panel Features:
Manage list of official forms (update URLs, add a new form if government introduces one).
Manage tasks templates – e.g., if a new type of compliance obligation arises (like say “report beneficial ownership” law is introduced for companies, we’d add a task type for that).
Manage text snippets in guides or help sections. Possibly the guides like “how to register” could be partially stored in a CMS so we can edit wording easily when laws change, and have multi-language support. Alternatively, we maintain them in markdown files in the code (like this content), but then editing requires deployment. A CMS for guide content could expedite updates especially if dynamic (Kol Zchut style).
However, writing a full CMS might be overkill; an in-between is to store guide content in a database and have an admin page to edit (with an HTML editor or markdown). This way minor edits (like changing a threshold number) can be done by an authorized admin quickly. If using markdown, we can version control it in DB, or easier, use something like Contentful which has UI and we fetch via API (but Contentful costs if heavy usage; though a community edition might suffice).
Admin Rights: Only authorized team members can access the admin portal (protected by role in the User table, e.g., is_admin flag). They log in and can perform content updates. All such changes should be audit-logged (who changed what, when), as that’s both good practice and needed if something goes wrong.
Testing Changes: For bigger changes (like a new flow due to a law change), we will test internally or in a staging environment before publishing. E.g., if the VAT filing process moves to a new system, we’d simulate that in staging to ensure our integration still works. The admin panel might have a preview mode for content changes (like preview new text in the front-end context).
Feature Flags: We can implement feature flags to turn on/off certain features quickly if something changes. For instance, if tomorrow the Tax Authority disables the old VAT file upload and everything must go through a new API, some part of our app might break. We could have a feature flag to hide/disable the “auto-file VAT” button until we adapt, rather than showing a broken feature. These flags can be toggled in an admin UI or config without redeploy. This reduces downtime or user confusion during transitions.
Staying Legally Updated
Hire/Consult experts: As we grow, it’s wise to have an accountant or lawyer on retainer to inform us of significant changes in tax laws, privacy laws, etc. For instance, if a new tax reform for SMBs is passed, we want to adapt quickly (maybe even turn it into a feature opportunity). Similarly, new privacy regs or accessibility updates we should comply with. Being proactive here prevents compliance drift.
Continuous Learning: The team should periodically attend relevant seminars or webinars (Tax Authority sometimes holds webinars for new e-invoicing, Privacy Protection Authority might release guidelines for Amendment 13, etc.). This keeps us ahead of changes. We might join industry associations or groups (e.g., Israeli Privacy Professionals forum, or Fintech communities) to get heads-up.
Handling Official Website Changes
We have integration points (like deep links) to many external sites. We anticipate issues like broken links or changed web page structures. Strategies:
Link Monitoring: We could set up an automated script that regularly checks all external URLs in our database for a 200 OK status. If any return 404 or redirect unexpectedly, flag it. There are tools or simple scripts for link health checking. For instance, check the Gov.il service URLs in our FormTemplate list. This can run weekly and email the admin on issues.
Fallback Content: If a link is broken, ensure our app doesn’t crash or leave user stranded. Possibly detect and offer, “The official site seems unavailable. Here is an alternative instruction: please go to gov.il and search for 'XYZ'.” At least users can proceed. This is more user experience but can be helpful if say Gov.il is down or a page moved and we haven't fixed it yet.
Flexible Integration: For APIs we rely on (like open data), implement error handling: if the API is down or returns unexpected data, our app should degrade gracefully (maybe use last cached data and indicate that it's possibly outdated). Also be prepared that some open datasets might update structure – design our parsing logic to be adaptable or clearly log errors so we notice if something breaks.
Admin/Content Maintenance Workflow
When a change is needed (e.g., new threshold or form), identify the source of truth (government announcement).
Update the relevant content in the admin CMS: e.g., update threshold value and effective date.
If code change needed (e.g., fundamentally new flow), schedule a dev update and release promptly.
Announce changes to users if it significantly affects them: Possibly through an in-app notification or email. Example: “New Reform: As of Jan 2024, Osek Patur threshold is ₪120,000 (was ₪107,000). Our app has been updated to reflect this
greeninvoice.co.il
. We’ve adjusted your settings if applicable.” This kind of proactive communication builds trust and shows we are on top of things.
Keep a Changelog for the app (visible to users or at least internally) documenting changes and updates to rules. This is useful for support – if a user says “why does the app now require me to input X?”, the support team can see “Oh, on version 1.2 we added that due to new regulation.”
Scaling Maintenance by Community or Crowdsourcing
In future, we might allow community contributions for non-critical content: e.g., a forum where users share tips or note local variations (like “In Haifa, license renewals can be done online via this link…”). This user-generated content could keep things fresh. But we’d moderate it for accuracy. For now, this is a potential idea to lighten our burden as a small team, but it introduces reliability concerns, so we might not use it for core info.
In conclusion, maintenance is an ongoing effort requiring a combination of technical solutions (automation, admin tools) and process (scheduled reviews, staying informed). By building our system to be easily updatable (through a CMS or config) and establishing habits of monitoring changes, we can ensure that our PWA remains accurate and useful in the face of evolving bureaucracy. This agility in updates will be one of our service’s strengths – unlike static info sources, we’ll be quickly reflecting the latest requirements, giving users confidence that they’re always compliant.
Sources:
Israeli Tax Authority – Guidelines and forms
kolzchut.org.il
kolzchut.org.il
Kol Zchut (All Rights) – Procedures for VAT, Income Tax, Bituach Leumi
kolzchut.org.il
kolzchut.org.il
Privacy Protection Law Amendment 13 – summary of new obligations
safetica.com
cookie-script.com
Israel Standard 5568 – accessibility requirements aligning to WCAG 2.0
accessibe.com
Data.gov.il – Open datasets for business licensing conditions
data.gov.il
 and licensed businesses
odata.org.il
Ministry of Economy/Interior – Business licensing reform info