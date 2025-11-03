-- =====================================================
-- Migration: 004_enhance_task_templates.sql
-- Purpose: Add comprehensive descriptions with legal basis,
--          deadlines, penalties, and government links
-- Created: 2025-11-03
-- =====================================================

-- Update task_templates table to include structured metadata
-- Metadata will contain: external_link, required_documents, legal_basis, penalties

-- =====================================================
-- PART 1: UPDATE INCOME TAX TEMPLATES
-- =====================================================

-- Q1 Advance Payment
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>תשלום מקדמה על מס הכנסה לרבעון ראשון (ינואר-מרץ). עוסקים מורשים וחברות חייבים בתשלום מקדמות רבעוניות על חשבון מס ההכנסה השנתי.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>פקודת מס הכנסה - סעיף 175: חובת תשלום מקדמות על מס הכנסה</p>

<h3>📅 מועד הגשה</h3>
<p><strong>עד 15 באפריל</strong> (30 יום לאחר תום הרבעון)</p>
<p>לדיווח מקוון: אפשרות להארכה עד ל-19 באפריל</p>

<h3>⚠️ קנסות ואיחור</h3>
<ul>
<li><strong>קנס פיגורים:</strong> 1.5% לחודש על הסכום שלא שולם</li>
<li><strong>ריבית והפרשי הצמדה:</strong> לפי מדד המחירים לצרכן</li>
<li><strong>קנס נוסף:</strong> אם האיחור עולה על 30 יום - עד 5% מסכום המס</li>
<li><strong>הערה:</strong> התשלום לא יכול להיות פחות מ-25% מהמס השנתי הצפוי</li>
</ul>

<h3>🔧 איך ממלאים?</h3>
<ol>
<li>התחבר לאזור האישי באתר רשות המסים</li>
<li>בחר "דיווח ותשלום מקדמות" - טופס 5327</li>
<li>חשב 25% מהרווח הצפוי לשנה (או לפי הוראת פקיד השומה)</li>
<li>מלא את הטופס והגש</li>
<li>שלם באמצעות כרטיס אשראי / העברה בנקאית / הוראת קבע</li>
</ol>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>דוח רווח והפסד מעודכן לרבעון</li>
<li>חישוב מקדמות (אם קיבלת הוראה מיוחדת מפקיד השומה)</li>
<li>אישורים על ניכויים במקור (אם רלוונטי)</li>
</ul>

<h3>💡 טיפ חשוב</h3>
<p>אם המקדמה שאתה משלם נמוכה מהמס בפועל, יתכן שתצטרך לשלם ריבית פיגורים בסוף השנה. מומלץ להתייעץ עם רואה חשבון לגבי סכום המקדמה הנכון.</p>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/advance-tax-payment"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["דוח רווח והפסד רבעוני", "חישוב מקדמות (אם קיים)", "אישורי ניכויים במקור"]'::jsonb
),
metadata = jsonb_set(
  metadata,
  '{legal_basis}',
  '"פקודת מס הכנסה - סעיף 175"'
)
WHERE template_code = 'TAX_ADVANCE_Q1';

-- Q2 Advance Payment
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>תשלום מקדמה על מס הכנסה לרבעון שני (אפריל-יוני). תשלום חובה עבור עוסקים מורשים וחברות.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>פקודת מס הכנסה - סעיף 175</p>

<h3>📅 מועד הגשה</h3>
<p><strong>עד 15 ביולי</strong> (30 יום לאחר תום הרבעון)</p>
<p>דיווח מקוון: עד 19 ביולי</p>

<h3>⚠️ קנסות ואיחור</h3>
<ul>
<li>קנס פיגורים: 1.5% לחודש</li>
<li>ריבית והפרשי הצמדה</li>
<li>קנס נוסף לאיחור מעל 30 יום</li>
</ul>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>דוח רווח והפסד לרבעון שני</li>
<li>חישוב מקדמות</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/advance-tax-payment"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["דוח רווח והפסד רבעוני", "חישוב מקדמות"]'::jsonb
)
WHERE template_code = 'TAX_ADVANCE_Q2';

-- Q3 Advance Payment
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>תשלום מקדמה על מס הכנסה לרבעון שלישי (יולי-ספטמבר).</p>

<h3>📅 מועד הגשה</h3>
<p><strong>עד 15 באוקטובר</strong></p>
<p>דיווח מקוון: עד 19 באוקטובר</p>

<h3>⚠️ קנסות</h3>
<p>קנס פיגורים 1.5% לחודש + ריבית והפרשי הצמדה</p>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>דוח רווח והפסד לרבעון שלישי</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/advance-tax-payment"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["דוח רווח והפסד רבעוני"]'::jsonb
)
WHERE template_code = 'TAX_ADVANCE_Q3';

-- Q4 Advance Payment
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>תשלום מקדמה על מס הכנסה לרבעון רביעי (אוקטובר-דצמבר). זהו התשלום האחרון בשנת המס.</p>

<h3>📅 מועד הגשה</h3>
<p><strong>עד 15 בינואר</strong> (של השנה הבאה)</p>
<p>דיווח מקוון: עד 19 בינואר</p>

<h3>💡 שימו לב</h3>
<p>זהו המועד האחרון לתשלום מקדמות לשנת המס הנוכחית. ודאו שסך כל המקדמות לא נמוך מ-100% מהמס הצפוי.</p>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>דוח רווח והפסד לרבעון רביעי</li>
<li>סיכום מקדמות שנתי</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/advance-tax-payment"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["דוח רווח והפסד רבעוני", "סיכום מקדמות שנתי"]'::jsonb
)
WHERE template_code = 'TAX_ADVANCE_Q4';

-- Annual Tax Return
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>הגשת דוח שנתי למס הכנסה (טופס 1301) - דוח המסכם את כל ההכנסות וההוצאות בשנת המס החולפת.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>פקודת מס הכנסה - סעיפים 131-132: חובת הגשת דוח שנתי</p>

<h3>📅 מועדי הגשה</h3>
<ul>
<li><strong>30 באפריל:</strong> מועד רגיל</li>
<li><strong>31 במאי:</strong> דיווח מקוון</li>
<li><strong>30 בנובמבר:</strong> הגשה באמצעות רואה חשבון (בתשלום אגרה)</li>
</ul>

<h3>⚠️ קנסות ואיחור</h3>
<ul>
<li><strong>קנס איחור:</strong> 1,190 ₪ (נכון ל-2025)</li>
<li><strong>קנס נוסף:</strong> עד 5% מסכום המס בגין איחור מעל 90 יום</li>
<li><strong>ריבית פיגורים:</strong> על יתרת המס שלא שולמה</li>
<li><strong>הערה:</strong> בהיעדר הגשת דוח - רשות המסים רשאית לשער שומה</li>
</ul>

<h3>🔧 איך ממלאים?</h3>
<ol>
<li>אסוף את כל אישורי השכר, הכנסות ונכויים (טופס 106, 856, וכו\')</li>
<li>הכן דוח רווח והפסד שנתי + מאזן (אם עוסק מורשה/חברה)</li>
<li>התחבר למערכת שירות האזרח - "מס הכנסה שלי"</li>
<li>מלא טופס 1301 במערכת המקוונת</li>
<li>צרף מסמכים רלוונטיים (ספרים, דוחות)</li>
<li>הגש והמתן לאישור</li>
</ol>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>אישור שכר שנתי (טופס 106) - אם שכיר</li>
<li>דוח רווח והפסד מבוקר - עוסקים מורשים וחברות</li>
<li>מאזן שנתי - חברות בע"מ</li>
<li>טופס 856 - ניכויים במקור על הכנסות</li>
<li>אישורי תרומות (אם רלוונטי)</li>
<li>אישורי ניכויים (פנסיה, ביטוח מנהלים, השתלמות)</li>
</ul>

<h3>💡 טיפים חשובים</h3>
<ul>
<li>אם אין לך הכנסות מעסק - הדוח יכול להיות פשוט יחסית</li>
<li>עוסקים מורשים וחברות - מומלץ בחום להשתמש ברואה חשבון</li>
<li>שמור עותק של הדוח המוגש לתיק האישי</li>
<li>המתן לקבלת שומה סופית (בדרך כלל תוך 6-12 חודשים)</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/income-tax-report-self-employed"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["טופס 106 (אישור שכר)", "דוח רווח והפסד שנתי", "מאזן שנתי (חברות)", "טופס 856 (ניכויים במקור)", "אישורי תרומות וניכויים"]'::jsonb
),
metadata = jsonb_set(
  metadata,
  '{legal_basis}',
  '"פקודת מס הכנסה - סעיפים 131-132"'
)
WHERE template_code = 'TAX_ANNUAL_RETURN';

-- =====================================================
-- PART 2: UPDATE BITUACH LEUMI (NATIONAL INSURANCE) TEMPLATES
-- =====================================================

-- Monthly Bituach Leumi
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>דיווח ותשלום חודשי לביטוח הלאומי עבור עצמאים ועובדים. המוסד לביטוח לאומי מחייב דיווח חודשי על הכנסות ותשלום דמי ביטוח.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>חוק הביטוח הלאומי [נוסח משולב], התשנ"ה-1995</p>

<h3>📅 מועד תשלום</h3>
<p><strong>עד 15 בכל חודש</strong> (עבור החודש הקודם)</p>
<p>לדוגמה: דמי ינואר 2025 משולמים עד 15 בפברואר 2025</p>

<h3>⚠️ קנסות ואיחור</h3>
<ul>
<li><strong>קנס פיגורים:</strong> 2%-5% מסכום החוב</li>
<li><strong>ריבית והפרשי הצמדה:</strong> לפי מדד המחירים</li>
<li><strong>עיכוב זכויות:</strong> אי תשלום עלול למנוע קבלת גמלאות (דמי אבטלה, מחלה, לידה)</li>
<li><strong>חובה:</strong> בעצמאים - אי תשלום מעל 6 חודשים עלול לגרום להקפאת זכויות</li>
</ul>

<h3>🔧 איך משלמים?</h3>
<ol>
<li>התחבר לאזור האישי בביטוח הלאומי: <a href="https://ps.btl.gov.il">ps.btl.gov.il</a></li>
<li>בחר "תשלום דמי ביטוח"</li>
<li>בדוק את סכום החיוב (מחושב לפי הכנסה שדווחה או הכנסה משוערת)</li>
<li>שלם באמצעות אשראי / בנק / הוראת קבע</li>
<li>שמור אישור תשלום</li>
</ol>

<h3>📊 שיעורי דמי ביטוח לעצמאים (2025)</h3>
<ul>
<li><strong>ביטוח לאומי:</strong> ~7% מההכנסה (עד תקרת הכנסה)</li>
<li><strong>ביטוח בריאות:</strong> ~5% מההכנסה</li>
<li><strong>סה"כ:</strong> כ-12% מההכנסה החודשית</li>
</ul>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>דוח הכנסות חודשי (אם יש שינוי בהכנסה)</li>
<li>אישור על הכנסה מרואה חשבון (לעדכון שיעור)</li>
</ul>

<h3>💡 טיפ חשוב</h3>
<p>מומלץ להגדיר הוראת קבע לתשלום אוטומטי ב-15 בכל חודש. כך תמנעו איחורים וקנסות.</p>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.btl.gov.il"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["דוח הכנסות חודשי", "אישור הכנסה מרואה חשבון (לעדכון)"]'::jsonb
),
metadata = jsonb_set(
  metadata,
  '{legal_basis}',
  '"חוק הביטוח הלאומי, התשנ\"ה-1995"'
)
WHERE template_code = 'BITUACH_LEUMI_MONTHLY';

-- Annual Bituach Leumi Report
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>דוח הכנסות שנתי לביטוח הלאומי - דוח המסכם את סך ההכנסות של העצמאי בשנת המס.</p>

<h3>📅 מועד הגשה</h3>
<p><strong>עד 31 במרץ</strong> (של השנה שלאחר שנת המס)</p>

<h3>⚠️ קנסות</h3>
<ul>
<li>קנס איחור על אי הגשת דוח</li>
<li>התאמת דמי ביטוח למפרע (אם ההכנסה בפועל גבוהה מההכנסה שדווחה)</li>
</ul>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>דוח רווח והפסד שנתי</li>
<li>דוח מס הכנסה (טופס 1301)</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.btl.gov.il/SelfEmployedPerson"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["דוח רווח והפסד שנתי", "טופס 1301"]'::jsonb
)
WHERE template_code = 'BITUACH_LEUMI_ANNUAL';

-- =====================================================
-- PART 3: UPDATE VAT TEMPLATES
-- =====================================================

-- Monthly VAT
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>דוח מע"מ חודשי לרשות המסים. עוסקים מורשים חייבים להגיש דוח מע"מ המפרט את מע"מ עסקאות, מע"מ תשומות, ויתרת המע"מ לתשלום/החזר.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>חוק מס ערך מוסף, התשל"ו-1976 - סעיף 50: חובת הגשת דוח</p>

<h3>📅 מועדי הגשה</h3>
<ul>
<li><strong>15 בכל חודש</strong> - עבור החודש הקודם (כלל ה-15)</li>
<li><strong>19 בכל חודש</strong> - דיווח מקוון (הארכה של 4 ימים)</li>
<li><strong>הערה:</strong> אם המועד חל בשבת/חג - נדחה ליום העבודה הבא</li>
</ul>

<h3>⚠️ קנסות ואיחור</h3>
<ul>
<li><strong>קנס איחור בהגשה:</strong> 1,420 ₪ (נכון ל-2025)</li>
<li><strong>קנס על אי תשלום:</strong> 4% מסכום המס שלא שולם</li>
<li><strong>ריבית פיגורים:</strong> 4.5% שנתי (נכון ל-2025) + הפרשי הצמדה</li>
<li><strong>קנס מוגבר:</strong> איחורים חוזרים - עד 5,000 ₪</li>
<li><strong>הערה:</strong> אי הגשת דוח במועד תגרום לשומת מס מנהלתית</li>
</ul>

<h3>🔧 איך ממלאים?</h3>
<ol>
<li>אסוף את כל חשבוניות המכר והקנייה של החודש</li>
<li>חשב סכום מע"מ עסקאות (18% על מכירות)</li>
<li>חשב סכום מע"מ תשומות (18% על קניות עסקיות)</li>
<li>התחבר למערכת שירות האזרח - "מע"מ שלי"</li>
<li>מלא את הדוח במערכת (טופס מקוון)</li>
<li>חשב יתרת תשלום/זיכוי</li>
<li>הגש ושלם באופן מקוון</li>
</ol>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>כל חשבוניות המכר (עסקאות) של החודש</li>
<li>כל חשבוניות הקנייה (תשומות) של החודש</li>
<li>דוח מע"מ מתוכנת הנהלת חשבונות</li>
<li>אסמכתאות על קבלות/תשלומים</li>
</ul>

<h3>💡 טיפים חשובים</h3>
<ul>
<li>שמור את כל החשבוניות הממוחשבות - החוק מחייב שמירה ל-7 שנים</li>
<li>ודא שחשבוניות המכר כוללות מספר אסמכתא ייחודי</li>
<li>רק הוצאות עסקיות זכאיות להחזר מע"מ</li>
<li>מומלץ להשתמש בתוכנת הנהלת חשבונות לניהול אוטומטי</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/reporting-or-payment-of-vat-reports"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["חשבוניות מכר חודשיות", "חשבוניות קנייה חודשיות", "דוח מע\"מ מתוכנת הנהח\"ש", "אסמכתאות קבלות ותשלומים"]'::jsonb
),
metadata = jsonb_set(
  metadata,
  '{legal_basis}',
  '"חוק מס ערך מוסף, התשל\"ו-1976 - סעיף 50"'
)
WHERE template_code = 'VAT_MONTHLY';

-- Bimonthly VAT (similar to monthly, but every 2 months)
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>דוח מע"מ דו-חודשי לרשות המסים. עוסקים מורשים שמחזורם נמוך יכולים לדווח אחת לחודשיים במקום מדי חודש.</p>

<h3>📅 מועדי הגשה</h3>
<ul>
<li><strong>15 בחודש הזוגי</strong> (פברואר, אפריל, יוני, אוגוסט, אוקטובר, דצמבר)</li>
<li><strong>19 בחודש הזוגי</strong> - דיווח מקוון</li>
</ul>

<h3>⚠️ קנסות</h3>
<ul>
<li>קנס איחור: 1,420 ₪</li>
<li>ריבית פיגורים: 4.5% שנתי</li>
</ul>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>חשבוניות מכר וקנייה לשני החודשים</li>
<li>דוח מע"מ מתוכנת הנהח"ש</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/reporting-or-payment-of-vat-reports"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["חשבוניות מכר וקנייה לחודשיים", "דוח מע\"מ מתוכנת הנהח\"ש"]'::jsonb
)
WHERE template_code = 'VAT_BIMONTHLY';

-- =====================================================
-- PART 4: UPDATE LICENSE TEMPLATES
-- =====================================================

-- Business License Renewal
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>חידוש רישיון עסק שנתי מהעירייה. רישיון עסק הוא אישור חוקי להפעלת העסק במקום מסוים.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>חוק רישוי עסקים, תשכ"ח-1968: כל עסק חייב ברישיון</p>

<h3>📅 מועד חידוש</h3>
<p><strong>לפני תום תוקף הרישיון הנוכחי</strong> (משתנה לפי עירייה)</p>
<p>מומלץ להתחיל תהליך 60 יום לפני פקיעת הרישיון</p>

<h3>⚠️ קנסות והשלכות</h3>
<ul>
<li><strong>קנס מנהלי:</strong> החל מ-1,000 ₪ והולך וגדל</li>
<li><strong>קנס פלילי:</strong> עד 292,000 ₪ על הפעלת עסק ללא רישיון</li>
<li><strong>סגירת עסק:</strong> העירייה רשאית לסגור את העסק בכוח</li>
<li><strong>הליכים משפטיים:</strong> הפעלה ללא רישיון היא עבירה פלילית</li>
</ul>

<h3>🔧 איך מחדשים?</h3>
<ol>
<li>התחבר לאתר העירייה שלך</li>
<li>הכנס לאזור "רישוי עסקים"</li>
<li>מלא בקשה לחידוש רישיון</li>
<li>צרף מסמכים נדרשים</li>
<li>שלם אגרת רישוי (משתנה לפי סוג עסק ועיר)</li>
<li>המתן לבדיקת מפקח רישוי (אם נדרש)</li>
<li>קבל רישיון מחודש</li>
</ol>

<h3>📄 מסמכים נדרשים (משתנה לפי עסק)</h3>
<ul>
<li>טופס בקשה מלא (מאתר העירייה)</li>
<li>תעודת זהות / תעודת עוסק מורשה</li>
<li>אישור מרשות המיסים על ניהול ספרים תקין</li>
<li>אישור זכויות במקום (חוזה שכירות / בעלות)</li>
<li>אישור מאת כיבוי אש (אם נדרש)</li>
<li>אישור משרד הבריאות (עסקי מזון)</li>
<li>אישור משרד הגנת הסביבה (עסקים מזהמים)</li>
<li>תעודת כושר למבנה (טופס 4)</li>
</ul>

<h3>💡 טיפים חשובים</h3>
<ul>
<li>כל עירייה בישראל מנהלת רישוי בנפרד - דרישות משתנות</li>
<li>עסקי מזון דורשים אישור בריאות מחמיר</li>
<li>תכנן מראש - תהליך האישור יכול לקחת חודשים</li>
<li>שמור את הרישיון במקום בולט בעסק</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/application-for-new-business-license"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["טופס בקשה", "תעודת זהות", "אישור ניהול ספרים", "חוזה שכירות", "אישור כיבוי אש", "אישור משרד הבריאות (מזון)", "טופס 4"]'::jsonb
),
metadata = jsonb_set(
  metadata,
  '{legal_basis}',
  '"חוק רישוי עסקים, תשכ\"ח-1968"'
)
WHERE template_code = 'BUSINESS_LICENSE_RENEWAL';

-- Health Ministry License (Food businesses)
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>חידוש רישיון עסק מזון ממשרד הבריאות. כל עסק המייצר, מעבד, אורז או משווק מזון חייב ברישיון בריאות.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>פקודת בריאות העם, 1940 + תקנות בריאות העם (מזון), תשנ"ט-1999</p>

<h3>📅 מועד חידוש</h3>
<p><strong>לפני פקיעת הרישיון</strong> (בדרך כלל שנתי)</p>
<p>מומלץ להתחיל תהליך 60 יום מראש</p>

<h3>⚠️ קנסות והשלכות</h3>
<ul>
<li>קנס כספי: עד 226,000 ₪</li>
<li>סגירת עסק מיידית</li>
<li>הליכים פליליים נגד בעל העסק</li>
<li>פרסום שם העסק ברשימת עסקים מפרים</li>
</ul>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>בקשה לחידוש רישיון</li>
<li>אישור קורס בטיחות מזון (לבעל העסק ולעובדים)</li>
<li>תוכנית HACCP (ניתוח סיכונים)</li>
<li>אישור ממכון התקנים (אם רלוונטי)</li>
<li>אישור כשרות (אם רלוונטי)</li>
</ul>

<h3>💡 טיפ חשוב</h3>
<p>ביקורות פתע של משרד הבריאות יכולות להתבצע בכל עת. שמרו על תקני היגיינה ברמה גבוהה תמיד.</p>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.health.gov.il/Subjects/FoodAndNutrition/Nutrition/Pages/business_license.aspx"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["בקשה לחידוש", "אישור קורס בטיחות מזון", "תוכנית HACCP", "אישור ממכון התקנים"]'::jsonb
),
metadata = jsonb_set(
  metadata,
  '{legal_basis}',
  '"פקודת בריאות העם + תקנות בריאות העם (מזון), תשנ\"ט-1999"'
)
WHERE template_code = 'HEALTH_LICENSE_FOOD';

-- =====================================================
-- PART 5: UPDATE FINANCIAL REPORTING TEMPLATES
-- =====================================================

UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>הכנת דוחות כספיים שנתיים מבוקרים לחברות בע"מ. חברה חייבת להגיש מאזן ודוח רווח והפסד לרשם החברות.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>חוק החברות, תשנ"ט-1999 - סעיפים 171-177</p>

<h3>📅 מועד הגשה</h3>
<p><strong>31 במרץ</strong> (7 חודשים לאחר סוף שנת המס)</p>

<h3>⚠️ קנסות</h3>
<ul>
<li>קנס איחור: 2,640 ₪</li>
<li>קנסות נוספים על איחורים חוזרים</li>
<li>פגיעה במוניטין החברה</li>
</ul>

<h3>📄 מסמכים נדרשים</h3>
<ul>
<li>מאזן מבוקר</li>
<li>דוח רווח והפסד מבוקר</li>
<li>דוח תזרים מזומנים</li>
<li>ביאורים לדוחות</li>
<li>דוח רואה החשבון המבקר</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/submit-annual-financial-statements"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["מאזן מבוקר", "דוח רווח והפסד", "דוח תזרים מזומנים", "ביאורים", "דוח רואה חשבון"]'::jsonb
),
metadata = jsonb_set(
  metadata,
  '{legal_basis}',
  '"חוק החברות, תשנ\"ט-1999 - סעיפים 171-177"'
)
WHERE template_code = 'FINANCIAL_STATEMENTS_ANNUAL';

-- =====================================================
-- PART 6: UPDATE LABOR LAW TEMPLATES
-- =====================================================

UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>הפקת ותשלום תלושי שכר חודשיים לעובדים. מעסיק חייב לשלם שכר במועד ולספק תלוש מפורט.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>חוק הגנת השכר, תשי"ח-1958 - סעיף 17</p>

<h3>📅 מועד תשלום</h3>
<p><strong>עד 9 בכל חודש</strong> (למשכורת החודש הקודם)</p>
<p>חלק מהעסקים משלמים בסוף החודש במקום בתחילת החודש הבא</p>

<h3>⚠️ קנסות והשלכות</h3>
<ul>
<li>קנס כספי על מעסיק: עד 34,300 ₪</li>
<li>תלונה לאגף יישום ופיקוח במשרד העבודה</li>
<li>הליכים משפטיים מצד העובד</li>
<li>פיצויים לעובד בגין איחור</li>
</ul>

<h3>📄 מה חייב להופיע בתלוש</h3>
<ul>
<li>שם ות.ז. של העובד</li>
<li>תקופת התשלום</li>
<li>שכר יסוד + תוספות</li>
<li>ניכויים (מס הכנסה, ביטוח לאומי, בריאות, פנסיה)</li>
<li>שכר נטו</li>
<li>צבירת חופשה וימי מחלה</li>
</ul>

<h3>💡 טיפ חשוב</h3>
<p>השתמש בתוכנת שכר מקצועית או שירות חיצוני לניהול שכר. טעויות בתלושים עלולות לעלות ביוקר.</p>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/departments/guides/salary-payslip-guide"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["רשימת נוכחות", "דיווח שעות עבודה", "תוכנת שכר"]'::jsonb
),
metadata = jsonb_set(
  metadata,
  '{legal_basis}',
  '"חוק הגנת השכר, תשי\"ח-1958 - סעיף 17"'
)
WHERE template_code = 'MONTHLY_PAYROLL';

UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>בדיקת יתרות חופשה שנתיות לעובדים בסוף השנה. מעסיק חייב לעקוב אחר ימי החופשה ולאפשר לעובדים לממש אותם.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>חוק חופשה שנתית, תשי"א-1951</p>

<h3>📋 זכאות לחופשה</h3>
<ul>
<li><strong>שנה ראשונה:</strong> 12 ימים</li>
<li><strong>שנה שנייה:</strong> 12 ימים</li>
<li><strong>שנה שלישית:</strong> 14 ימים</li>
<li><strong>שנה רביעית:</strong> 14 ימים</li>
<li><strong>שנה חמישית ואילך:</strong> 16 ימים</li>
</ul>

<h3>⚠️ חשוב לדעת</h3>
<ul>
<li>חופשה שלא נוצלה לא "נופלת" - עובר לשנה הבאה</li>
<li>מעסיק לא יכול לבטל חופשה צבורה</li>
<li>בפיטורים - יש לשלם פדיון חופשה</li>
</ul>

<h3>📄 מה לבדוק</h3>
<ul>
<li>יתרת ימי חופשה לכל עובד</li>
<li>ימי חופשה שנוצלו בשנה החולפת</li>
<li>תכנון חופשה לשנה הבאה</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/departments/guides/annual-leave-guide"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["רישום ימי חופשה", "טבלת זכאות לעובדים"]'::jsonb
)
WHERE template_code = 'ANNUAL_VACATION_REVIEW';

-- =====================================================
-- PART 7: UPDATE MUNICIPALITY TEMPLATES
-- =====================================================

UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>תשלום ארנונה דו-חודשי לעירייה. ארנונה היא מס עירוני על החזקת נכס (עסק או דירת מגורים).</p>

<h3>⚖️ בסיס חוקי</h3>
<p>פקודת העיריות [נוסח חדש] + צו הארנונה המקומי</p>

<h3>📅 מועדי תשלום</h3>
<p>6 תשלומים בשנה:</p>
<ul>
<li>ינואר-פברואר: עד 1 במרץ</li>
<li>מרץ-אפריל: עד 1 במאי</li>
<li>מאי-יוני: עד 1 ביולי</li>
<li>יולי-אוגוסט: עד 1 בספטמבר</li>
<li>ספטמבר-אוקטובר: עד 1 בנובמבר</li>
<li>נובמבר-דצמבר: עד 1 בינואר</li>
</ul>

<h3>⚠️ קנסות ואיחור</h3>
<ul>
<li><strong>קנס פיגורים:</strong> 4% מהסכום שלא שולם</li>
<li><strong>ריבית והפרשי הצמדה:</strong> לפי המדד</li>
<li><strong>הליכי גביה:</strong> עיקול נכסים / חשבון בנק</li>
</ul>

<h3>💡 הנחות אפשריות</h3>
<ul>
<li>תשלום מראש לשנה מלאה - הנחה של 4%-6%</li>
<li>הנחות לעסקים בתחומים מסוימים (בדוק בעירייה שלך)</li>
</ul>

<h3>🔧 איך משלמים</h3>
<ol>
<li>קבל חשבון ארנונה מהעירייה (בדואר או במייל)</li>
<li>התחבר לאתר העירייה</li>
<li>שלם באופן מקוון / בנק / הוראת קבע</li>
<li>שמור אישור תשלום</li>
</ol>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/payment_of_arnona"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["חשבון ארנונה", "אישור על שינוי שימוש (אם רלוונטי)"]'::jsonb
)
WHERE template_code = 'ARNONA_BIMONTHLY';

-- =====================================================
-- PART 8: UPDATE INSURANCE TEMPLATES
-- =====================================================

UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>חידוש ביטוח עסקי שנתי - כולל ביטוח רכוש עסקי, אחריות מקצועית, ציוד, ועוד.</p>

<h3>⚠️ למה זה חשוב?</h3>
<ul>
<li><strong>הגנה כספית:</strong> נזקים לרכוש עלולים לסכן את קיום העסק</li>
<li><strong>חובה חוקית:</strong> חלק מהעסקים חייבים בביטוח (בניה, רפואה, פיננסים)</li>
<li><strong>דרישת שוכר/בנק:</strong> בעלי נכס או בנק עשויים לדרוש ביטוח</li>
</ul>

<h3>📋 סוגי ביטוח עסקי</h3>
<ul>
<li><strong>ביטוח רכוש:</strong> נזק למבנה, ציוד, סחורה</li>
<li><strong>ביטוח אחריות מקצועית:</strong> טעויות וטענות של לקוחות</li>
<li><strong>ביטוח אחריות כלפי צד שלישי:</strong> פציעות במקום העבודה</li>
<li><strong>ביטוח אובדן הכנסה:</strong> פיצוי בגין השבתת עסק</li>
<li><strong>ביטוח סייבר:</strong> פריצות מחשב וגניבת מידע</li>
</ul>

<h3>🔧 איך מחדשים?</h3>
<ol>
<li>צור קשר עם סוכן הביטוח שלך 45 יום לפני תום תוקף</li>
<li>בדוק שמירת ההזדמנות לעדכן כיסויים</li>
<li>קבל הצעות מספר חברות (השוואה חשובה!)</li>
<li>חתום על פוליסה מחודשת</li>
<li>שלם פרמיה שנתית או בתשלומים</li>
<li>שמור עותק של הפוליסה במקום נגיש</li>
</ol>

<h3>💡 טיפים חשובים</h3>
<ul>
<li>אל תחכה לרגע האחרון - חידוש מוקדם חוסך כסף</li>
<li>עדכן את סוכן הביטוח על שינויים בעסק (מוצרים חדשים, ציוד)</li>
<li>קרא את הפוליסה והבן מה מכוסה ומה לא</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/service/business-insurance-guide"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["פוליסת ביטוח קודמת", "שווי ציוד ורכוש עדכני", "דוחות כספיים"]'::jsonb
)
WHERE template_code = 'BUSINESS_INSURANCE_RENEWAL';

UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>חידוש ביטוח אחריות מעבידים - ביטוח חובה לכל מעסיק. מגן על המעסיק בגין תאונות עבודה ופגיעות בעובדים.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>חוק הביטוח הלאומי - סעיף 218: חובת ביטוח אחריות מעבידים</p>

<h3>⚠️ למה זה חשוב?</h3>
<ul>
<li><strong>חובה חוקית:</strong> ללא ביטוח - קנס עד 86,000 ₪</li>
<li><strong>הגנה משפטית:</strong> כיסוי תביעות מצד עובדים</li>
<li><strong>שקט נפשי:</strong> מניעת חבות אישית בתאונות</li>
</ul>

<h3>📋 מה הביטוח מכסה?</h3>
<ul>
<li>תאונות עבודה ופגיעות גוף</li>
<li>מחלות מקצוע</li>
<li>נזקי נפש בעקבות תאונה</li>
<li>הוצאות משפטיות</li>
</ul>

<h3>🔧 איך מבטחים?</h3>
<ol>
<li>פנה לחברת ביטוח או סוכן ביטוח</li>
<li>דווח על מספר עובדים ותפקידים</li>
<li>קבל הצעת מחיר</li>
<li>חתום על פוליסה</li>
<li>שלם פרמיה (לפי מספר עובדים ורמת סיכון)</li>
</ol>

<h3>💡 טיפ חשוב</h3>
<p>עדכן את חברת הביטוח על שינויים במספר עובדים - הוספת עובדים ללא עדכון הפוליסה עלולה לבטל את הכיסוי!</p>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.btl.gov.il/Insurance/Bizua_meabidet/Pages/default.aspx"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["רשימת עובדים עדכנית", "תיאור תפקידים", "פוליסה קודמת"]'::jsonb
),
metadata = jsonb_set(
  metadata,
  '{legal_basis}',
  '"חוק הביטוח הלאומי - סעיף 218"'
)
WHERE template_code = 'LIABILITY_INSURANCE_RENEWAL';

-- Construction safety report
UPDATE public.task_templates
SET description_he = E'<div dir="rtl">
<h3>📋 מה זה?</h3>
<p>דוח בטיחות חודשי לפיקוח עבודה עבור אתרי בניה. חובה לפי חוק העבודה - מטרתו למנוע תאונות עבודה.</p>

<h3>⚖️ בסיס חוקי</h3>
<p>חוק ארגון הפיקוח על העבודה, תשי"ד-1954 + תקנות בטיחות בעבודה</p>

<h3>📅 מועד הגשה</h3>
<p><strong>עד ה-1 בכל חודש</strong> (עבור החודש הקודם)</p>

<h3>⚠️ קנסות</h3>
<ul>
<li>קנס מנהלי: עד 150,000 ₪</li>
<li>עצירת עבודה באתר</li>
<li>הליכים פליליים במקרים חמורים</li>
</ul>

<h3>📄 מה כולל הדוח?</h3>
<ul>
<li>סקר סיכונים באתר</li>
<li>בדיקת ציוד בטיחות</li>
<li>תאונות שאירעו (אם היו)</li>
<li>הדרכות בטיחות שניתנו</li>
</ul>
</div>',
metadata = jsonb_set(
  metadata,
  '{external_link}',
  '"https://www.gov.il/he/departments/molsa/govil-landing-page"'
),
metadata = jsonb_set(
  metadata,
  '{required_documents}',
  '["סקר סיכונים", "רישום תאונות", "אישורי הדרכה"]'::jsonb
)
WHERE template_code = 'CONSTRUCTION_SAFETY_REPORT';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
