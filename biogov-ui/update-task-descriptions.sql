-- Update existing tasks with comprehensive Hebrew descriptions

-- Update Income Tax Q1 tasks
UPDATE tasks 
SET description = E'**מה זה?**\nתשלום מקדמה על מס הכנסה לרבעון ראשון (ינואר-מרץ). עוסקים מורשים וחברות חייבים לשלם מקדמות רבעוניות.\n\n**בסיס חוקי:** פקודת מס הכנסה - סעיף 175\n\n**מועד הגשה:** עד ה-15 באפריל\n\n**קנסות:** קנס פיגורים 1.5% לחודש + ריבית והפרשי הצמדה\n\n**מסמכים נדרשים:**\n• דוח רווח והפסד מעודכן\n• חישוב מקדמות\n• אישור ניכויים'
WHERE title LIKE '%מקדמה רבעונית Q1%';

-- Update Monthly NI reporting tasks  
UPDATE tasks
SET description = E'**מה זה?**\nדיווח חודשי לביטוח הלאומי על הכנסות ותשלום דמי ביטוח.\n\n**בסיס חוקי:** חוק הביטוח הלאומי\n\n**מועד הגשה:** עד ה-15 בחודש שלאחר חודש הדיווח\n\n**קנסות:** 2-5% מהחוב + ריבית והפרשי הצמדה\n\n**מסמכים נדרשים:**\n• דוח הכנסות חודשי\n• תלושי שכר לעובדים'
WHERE title LIKE '%דיווח חודשי לביטוח לאומי%';

-- Update Business License Renewal
UPDATE tasks
SET description = E'**מה זה?**\nחידוש רישיון עסק שנתי - חובה לכל עסק פעיל.\n\n**בסיס חוקי:** חוק רישוי עסקים, תשכ"ח-1968\n\n**מועד הגשה:** לפני תאריך פקיעת הרישיון\n\n**קנסות:** קנס עד 292,000 ₪ + סגירת עסק\n\n**מסמכים נדרשים:**\n• תעודת עוסק מורשה/פטור\n• אישור ביטוח\n• אישורים ממשרדי ממשלה (לפי הצורך)'
WHERE title LIKE '%חידוש רישיון עסק%';

-- Count updated tasks
SELECT 'Updated ' || COUNT(*) || ' tasks' as result FROM tasks WHERE description LIKE '%בסיס חוקי%';
