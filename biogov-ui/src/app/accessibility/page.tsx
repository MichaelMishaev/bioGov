/**
 * Accessibility Statement Page
 * IS-5568 / WCAG 2.1 AA Compliance
 *
 * This page describes the accessibility features of bioGov
 * and provides contact information for accessibility feedback.
 */

import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, Mail, Phone, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'הצהרת נגישות - bioGov',
  description: 'הצהרת נגישות לאתר bioGov - מחויבותנו לנגישות דיגיטלית לכל המשתמשים',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header role="banner" className="gradient-hero text-white py-12">
        <div className="container mx-auto container-mobile">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowRight className="w-5 h-5 ml-2" />
            חזרה לדף הבית
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">הצהרת נגישות</h1>
          <p className="text-xl text-white/90">
            מחויבותנו לנגישות דיגיטלית עבור כל המשתמשים
          </p>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="container mx-auto container-mobile py-12">
        {/* Commitment Statement */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              המחויבות שלנו
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg">
            <p>
              bioGov מחויבת לספק חוויית משתמש נגישה לכל האנשים, כולל אנשים עם מוגבלויות.
              אנו שואפים לעמוד בתקן הישראלי לנגישות אתרי אינטרנט (ת"י 5568) ברמת AA של WCAG 2.1.
            </p>
            <p>
              אנו מאמינים שכל אדם זכאי לגשת למידע ולשירותים באינטרנט באופן עצמאי, ללא קשר ליכולות שלו.
              נגישות דיגיטלית היא זכות יסוד, ואנו עובדים ברציפות כדי לשפר את הנגישות של האתר שלנו.
            </p>
          </CardContent>
        </Card>

        {/* Standards Compliance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              תקינה ורמת תאימות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">תקנים שאנו שואפים לעמוד בהם:</h3>
              <ul className="mr-6 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span><strong>תקן ישראלי 5568:</strong> התקן הישראלי לנגישות תכנים באינטרנט</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span><strong>WCAG 2.1 רמה AA:</strong> הנחיות הנגישות לתכנים באינטרנט מטעם W3C</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span><strong>תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013</strong></span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">רמת התאימות הנוכחית:</h3>
              <p className="text-lg">
                אנו נמצאים בתהליך של יישום מלא של תקן הנגישות. חלקים מסוימים של האתר עומדים כבר עכשיו
                ברמת AA של WCAG 2.1, ואנו עובדים על שיפור מתמיד של כל החלקים.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">תכונות נגישות באתר</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">ניווט ושליטה</h3>
                <ul className="mr-6 space-y-2 text-sm">
                  <li>• ניווט מלא באמצעות מקלדת בלבד</li>
                  <li>• קישור "דילוג לתוכן הראשי" בראש כל עמוד</li>
                  <li>• סדר מיקוד (focus order) הגיוני</li>
                  <li>• אינדיקטור מיקוד (focus indicator) ברור וגלוי</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">תוכן וקריאות</h3>
                <ul className="mr-6 space-y-2 text-sm">
                  <li>• ניגודיות צבעים עומדת בתקן (4.5:1 לטקסט רגיל)</li>
                  <li>• מבנה כותרות היררכי ומסודר</li>
                  <li>• טקסט חלופי לכל התמונות המשמעותיות</li>
                  <li>• תמיכה בהגדלת טקסט עד 200%</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">תמיכה בטכנולוגיות מסייעות</h3>
                <ul className="mr-6 space-y-2 text-sm">
                  <li>• תאימות לקוראי מסך (NVDA, JAWS, VoiceOver)</li>
                  <li>• שימוש נכון ב-ARIA landmarks ו-labels</li>
                  <li>• הודעות דינמיות באמצעות aria-live</li>
                  <li>• תמיכה מלאה בעברית RTL</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">חוויית משתמש</h3>
                <ul className="mr-6 space-y-2 text-sm">
                  <li>• תמיכה במצב הפחתת תנועות (reduced motion)</li>
                  <li>• טפסים עם תוויות (labels) ברורות</li>
                  <li>• הודעות שגיאה מפורטות וברורות</li>
                  <li>• עיצוב רספונסיבי לכל גדלי מסך</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Known Issues */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              בעיות ידועות ותוכניות לתיקון
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              אנו ממשיכים לעבוד על שיפור הנגישות באתר. להלן רשימת בעיות ידועות שאנו עובדים על תיקונן:
            </p>
            <ul className="mr-6 space-y-2">
              <li>• <strong>טפסים מורכבים:</strong> חלק מהטפסים המורכבים באתר נמצאים בתהליך שיפור נגישות</li>
              <li>• <strong>תרשימים ודוחות:</strong> אנו עובדים על הוספת טקסט חלופי מפורט יותר לתרשימים פיננסיים</li>
              <li>• <strong>תוכן צד שלישי:</strong> חלק מהתוכן המשולב מאתרי ממשלה עשוי להיות פחות נגיש</li>
            </ul>
            <p className="text-sm text-gray-600">
              <strong>עדכון אחרון:</strong> נובמבר 2025
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">צור קשר בנושא נגישות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">
              אנו מעוניינים לשמוע על כל בעיית נגישות שנתקלתם בה באתר. המשוב שלכם עוזר לנו לשפר
              את הנגישות עבור כל המשתמשים.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">דואר אלקטרוני</h3>
                  <a
                    href="mailto:accessibility@biogov.com"
                    className="text-primary hover:underline"
                  >
                    accessibility@biogov.com
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    אנו מתחייבים להשיב תוך 5 ימי עסקים
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">טלפון</h3>
                  <a
                    href="tel:+972-3-1234567"
                    className="text-primary hover:underline"
                    lang="en"
                  >
                    03-1234567
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    ראשון-חמישי 09:00-17:00
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">מה לכלול בפנייה?</h3>
              <ul className="mr-6 space-y-1 text-sm">
                <li>• תיאור הבעיה שנתקלת בה</li>
                <li>• העמוד או התכונה הספציפית באתר</li>
                <li>• הדפדפן והמכשיר שבהם השתמשת</li>
                <li>• הטכנולוגיה המסייעת שבה השתמשת (אם רלוונטי)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">משאבים נוספים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              למידע נוסף על נגישות דיגיטלית ותקנים:
            </p>
            <ul className="mr-6 space-y-2">
              <li>
                • <a href="https://www.gov.il/he/departments/topics/digital_accessibility" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  מידע על נגישות דיגיטלית - אתר gov.il
                </a>
              </li>
              <li>
                • <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" lang="en">
                  Web Content Accessibility Guidelines (WCAG)
                </a>
              </li>
              <li>
                • <a href="https://www.kolzchut.org.il/he/%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA_%D7%91%D7%90%D7%99%D7%A0%D7%98%D7%A8%D7%A0%D7%98" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  נגישות באינטרנט - כל זכות
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button size="lg" className="text-lg">
              <ArrowRight className="w-5 h-5 ml-2" />
              חזרה לדף הבית
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto container-mobile text-center">
          <p className="text-sm text-gray-400">
            הצהרת נגישות זו עודכנה לאחרונה ב-{new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            © {new Date().getFullYear()} bioGov. כל הזכויות שמורות.
          </p>
        </div>
      </footer>
    </div>
  );
}
