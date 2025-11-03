'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  isComplete?: boolean;
}

interface FlowDiagramProps {
  title: string;
  steps: FlowStep[];
  orientation?: 'vertical' | 'horizontal';
}

export function FlowDiagram({ title, steps, orientation = 'vertical' }: FlowDiagramProps) {
  if (orientation === 'horizontal') {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-center">{title}</h3>

          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                {/* Step */}
                <div className="flex flex-col items-center min-w-[180px]">
                  {/* Icon Circle */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                    step.isComplete
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-white'
                  }`}>
                    {step.isComplete ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <span className="text-2xl">{step.icon}</span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <div className="font-bold text-sm mb-1">{step.title}</div>
                    <div className="text-xs text-gray-600">{step.description}</div>
                  </div>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <ArrowLeft className="w-8 h-8 text-gray-400 mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vertical orientation
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-6">{title}</h3>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="relative pr-16">
              {/* Step Number/Icon Circle */}
              <div className={`absolute right-0 top-0 w-12 h-12 rounded-full flex items-center justify-center ${
                step.isComplete
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-white'
              }`}>
                {step.isComplete ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <span className="text-xl">{step.icon}</span>
                )}
              </div>

              {/* Content */}
              <div>
                <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute right-[23px] top-14 w-0.5 h-full bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-made flow diagrams for common processes
export const VATRegistrationFlow = () => (
  <FlowDiagram
    title="תהליך הרשמה כעוסק מורשה במע״מ"
    steps={[
      {
        id: '1',
        title: 'בדיקת זכאות',
        description: 'וודאו שמחזור העסק מעל ₪102,292 בשנה',
        icon: '🔍'
      },
      {
        id: '2',
        title: 'הכנת מסמכים',
        description: 'ת.ז., חשבון בנק, פרטי עסק',
        icon: '📄'
      },
      {
        id: '3',
        title: 'מילוי טופס 821',
        description: 'באתר רשות המסים או ידנית',
        icon: '✍️'
      },
      {
        id: '4',
        title: 'המתנה לאישור',
        description: 'כ-2 שבועות',
        icon: '⏰'
      },
      {
        id: '5',
        title: 'קבלת אישור',
        description: 'מעכשיו תגבו מע"מ 18%',
        icon: '✅'
      }
    ]}
  />
);

export const NIRegistrationFlow = () => (
  <FlowDiagram
    title="תהליך הרשמה כעצמאי בביטוח לאומי"
    steps={[
      {
        id: '1',
        title: 'בדיקת חובה',
        description: 'אם אתם עובדים עצמאית - חובה להירשם',
        icon: '📋'
      },
      {
        id: '2',
        title: 'הרשמה באזור האישי',
        description: 'דרך אתר הביטוח הלאומי',
        icon: '💻'
      },
      {
        id: '3',
        title: 'הצהרת הכנסה משוערת',
        description: 'הערכה של ההכנסה השנתית',
        icon: '💰'
      },
      {
        id: '4',
        title: 'הקמת הוראת קבע',
        description: 'לתשלום חודשי אוטומטי',
        icon: '🏦'
      },
      {
        id: '5',
        title: 'תשלום חודשי',
        description: 'כל חודש עד ה-15',
        icon: '📅'
      }
    ]}
  />
);

export const BusinessLicenseFlow = () => (
  <FlowDiagram
    title="תהליך קבלת רישיון עסק"
    steps={[
      {
        id: '1',
        title: 'בדיקת צורך',
        description: 'האם העסק שלכם צריך רישיון?',
        icon: '🔎'
      },
      {
        id: '2',
        title: 'הכנת מסמכים',
        description: 'תשריט, הסכם שכירות, אישורים',
        icon: '📑'
      },
      {
        id: '3',
        title: 'הגשת בקשה',
        description: 'בעירייה או באינטרנט',
        icon: '📮'
      },
      {
        id: '4',
        title: 'קבלת אישורים',
        description: 'כיבוי אש, בריאות, משרדי ממשלה',
        icon: '✓'
      },
      {
        id: '5',
        title: 'ביקור פיקוח',
        description: 'פקח עירוני יבקר במקום',
        icon: '👁️'
      },
      {
        id: '6',
        title: 'קבלת רישיון',
        description: 'תוקף לשנה, יש לחדש מדי שנה',
        icon: '🎉'
      }
    ]}
  />
);

export const InvoiceCreationFlow = () => (
  <FlowDiagram
    title="תהליך יצירת חשבונית"
    orientation="horizontal"
    steps={[
      {
        id: '1',
        title: 'פרטי הלקוח',
        description: 'שם, ח.פ./ת.ז.',
        icon: '👤'
      },
      {
        id: '2',
        title: 'פירוט שירות',
        description: 'תיאור, כמות, מחיר',
        icon: '📝'
      },
      {
        id: '3',
        title: 'חישוב מע"מ',
        description: '18% (אם מורשה)',
        icon: '🔢'
      },
      {
        id: '4',
        title: 'שליחה ללקוח',
        description: 'PDF באימייל',
        icon: '📧'
      },
      {
        id: '5',
        title: 'מעקב תשלום',
        description: 'תזכורות עד לתשלום',
        icon: '💳'
      }
    ]}
  />
);
