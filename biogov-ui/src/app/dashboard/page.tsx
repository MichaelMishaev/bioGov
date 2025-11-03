'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { ComplianceScore } from '@/components/ComplianceScore';
import { TaskList } from '@/components/TaskList';
import { CalendarView } from '@/components/CalendarView';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import CashFlowWidget from '@/components/finances/CashFlowWidget';
import UnpaidInvoicesWidget from '@/components/finances/UnpaidInvoicesWidget';
import ProfitLossWidget from '@/components/finances/ProfitLossWidget';
import { TaskCardSkeleton } from '@/components/TaskCardSkeleton';
import { Celebration } from '@/components/ui/celebration';
import { HelpTooltip } from '@/components/help/HelpTooltip';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  LayoutDashboard,
  List,
  Calendar as CalendarIcon,
  LogOut,
  User,
  Bell,
  Settings,
  Info,
  HelpCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  FileText,
  Plus,
  Send,
  Receipt,
} from 'lucide-react';
import { Task } from '@/types/task';

type ViewMode = 'overview' | 'list' | 'calendar';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Check for welcome parameter
  useEffect(() => {
    const isWelcome = searchParams.get('welcome') === 'true';
    if (isWelcome) {
      setShowWelcome(true);
      // Auto-hide after 10 seconds
      setTimeout(() => setShowWelcome(false), 10000);
    }
  }, [searchParams]);

  // Fetch tasks
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const result = await response.json();
        // API returns { success: true, data: { tasks: [...], pagination: {...} } }
        setTasks(result.data?.tasks || []);
      } else {
        console.error('Failed to fetch tasks. Status:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update local state
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, status: 'completed' as const, completedAt: new Date().toISOString() }
              : task
          )
        );

        // Trigger celebration animation
        setShowCelebration(true);
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  // Calculate compliance score
  const calculateComplianceScore = () => {
    if (tasks.length === 0) return { score: 100, trend: 0 };

    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;

    // Score calculation: base score - penalties
    let score = 100;
    const completionRate = (completedTasks / tasks.length) * 100;
    score = completionRate;

    // Penalty for overdue tasks
    const overdueRate = (overdueTasks / tasks.length) * 100;
    score -= overdueRate * 0.5;

    return {
      score: Math.max(0, Math.min(100, score)),
      trend: 0, // Would calculate from historical data
    };
  };

  const { score, trend } = calculateComplianceScore();
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  ).length;

  // Get upcoming tasks (next 30 days)
  const upcomingTasks = tasks
    .filter((t) => {
      if (!t.dueDate || t.status === 'completed') return false;
      const dueDate = new Date(t.dueDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return dueDate <= thirtyDaysFromNow;
    })
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Modern Hero Header with Gradient - Animated */}
      <header role="banner" className="gradient-hero animate-gradient text-white sticky top-0 z-10 shadow-xl">
        <div className="container mx-auto container-mobile py-4 sm:py-6 fade-in">
          {/* Top Bar - Logo and Actions */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold">bioGov</h1>
              <span className="text-white/60 hidden sm:inline">|</span>
              <span className="text-white/80 text-sm sm:text-base hidden sm:inline">לוח בקרה</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                aria-label="מרכז העזרה"
                onClick={() => router.push('/help')}
              >
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" aria-label="הודעות והתראות">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" aria-label="הגדרות">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="border-white/30 text-white hover:bg-white/20 hidden sm:flex"
                aria-label="יציאה מהמערכת"
              >
                <LogOut className="w-4 h-4 ml-2" aria-hidden="true" />
                יציאה
              </Button>
            </div>
          </div>

          {/* User Greeting - Animated */}
          <div className="mb-4 sm:mb-6 slide-up">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 leading-tight">
              שלום, {user?.name || 'משתמש'} <span className="inline-block animate-bounce-slow">👋</span>
            </h2>
            <p className="text-white/80 text-xs sm:text-sm md:text-base">הנה סקירת המצב העסקי שלך היום</p>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="container mx-auto container-mobile py-6 sm:py-8">
        {/* View Mode Tabs - Mobile-first */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
          <Button
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            onClick={() => setViewMode('overview')}
            size="sm"
            className="sm:h-11 sm:px-5 whitespace-nowrap"
          >
            <LayoutDashboard className="w-4 h-4 ml-2" />
            <span className="hidden sm:inline">סקירה כללית</span>
            <span className="sm:hidden">סקירה</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
            className="sm:h-11 sm:px-5 whitespace-nowrap"
          >
            <List className="w-4 h-4 ml-2" />
            <span className="hidden sm:inline">רשימת משימות</span>
            <span className="sm:hidden">משימות</span>
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
            size="sm"
            className="sm:h-11 sm:px-5 whitespace-nowrap"
          >
            <CalendarIcon className="w-4 h-4 ml-2" />
            <span className="hidden sm:inline">לוח שנה</span>
            <span className="sm:hidden">לוח</span>
          </Button>
        </div>

        {/* Welcome Message - Animated */}
        {showWelcome && (
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 shadow-lg slide-up">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="text-3xl sm:text-4xl">🎉</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">ברוכים הבאים ל-bioGov!</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    המערכת שלנו ליוותה אתכם בתהליך ההרשמה ויצרה עבורכם לוח משימות אישי מותאם לסוג העסק שלכם.
                  </p>
                  <div className="bg-white/50 rounded-lg p-3 sm:p-4 border border-primary/10">
                    <h3 className="font-semibold text-sm sm:text-base mb-2">💡 מה תמצאו כאן?</h3>
                    <ul className="space-y-1 text-xs sm:text-sm mr-4">
                      <li>• מעקב אחר כל המשימות והתאריכים החשובים</li>
                      <li>• תזכורות אוטומטיות למועדים קרובים</li>
                      <li>• קישורים ישירים לטפסים ושירותים ממשלתיים</li>
                      <li>• חישוב ציון תאימות אוטומטי</li>
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  aria-label="סגור הודעת ברכה"
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <>
            {/* Quick Actions Bar - Prominent */}
            <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  פעולות מהירות
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button
                    className="h-auto py-4 flex flex-col items-center gap-2 bg-primary hover:bg-primary/90"
                    onClick={() => window.location.href = '/dashboard/invoices/new'}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-sm font-medium">צור חשבונית</span>
                  </Button>
                  <Button
                    className="h-auto py-4 flex flex-col items-center gap-2 bg-secondary hover:bg-secondary/90"
                    onClick={() => window.location.href = '/dashboard/expenses/new'}
                  >
                    <Receipt className="w-6 h-6" />
                    <span className="text-sm font-medium">הוסף הוצאה</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 border-primary/30 hover:bg-primary/5"
                    onClick={() => window.location.href = '/dashboard/invoices?status=unpaid'}
                  >
                    <Send className="w-6 h-6" />
                    <span className="text-sm font-medium">שלח תזכורת</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 border-primary/30 hover:bg-primary/5"
                    onClick={() => window.location.href = '/dashboard/finances'}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-sm font-medium">דוחות כספיים</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Financial Dashboard Section - Full Width */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  סקירה כספית
                </h2>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/finances'}
                  className="hidden sm:flex"
                >
                  צפה בדף הפיננסים המלא ←
                </Button>
              </div>

              {/* Financial Widgets Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <CashFlowWidget />
                <UnpaidInvoicesWidget />
              </div>

              {/* P&L Widget - Full Width for Prominence */}
              <div className="mb-6">
                <ProfitLossWidget />
              </div>
            </div>

            {/* Compliance Section - Staggered Animation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-stagger">
              {/* Left Column - Compliance Score */}
              <div className="lg:col-span-1 space-y-6">
                <ComplianceScore
                  score={score}
                  trend={trend}
                  totalTasks={tasks.length}
                  completedTasks={completedTasks}
                  overdueTasks={overdueTasks}
                />

              {/* Compliance Score Explanation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="w-5 h-5" />
                    מה זה ציון תאימות?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                  <p>
                    ציון התאימות מחושב על בסיס אחוז המשימות שהושלמו במועד והמשימות שממתינות לטיפול.
                  </p>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="font-medium mb-2 text-foreground">למה זה חשוב?</p>
                    <p className="mb-2">שמירה על ציון תאימות גבוה מסייעת:</p>
                    <ul className="mr-4 space-y-1">
                      <li>• למנוע קנסות וקנסות פיגורים</li>
                      <li>• לשמור על תקינות מול רשויות המס והביטוח הלאומי</li>
                      <li>• לקבל הנחות בביטוח עסקי (במקרים מסוימים)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Task Categories Explanation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📋 הסבר על סוגי המשימות</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div>
                    <h4 className="font-semibold text-primary">מס הכנסה</h4>
                    <p className="text-muted-foreground">דיווחים ותשלומים לרשות המסים - מקדמות רבעוניות, דוח שנתי</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">ביטוח לאומי</h4>
                    <p className="text-muted-foreground">תשלומים חודשיים ודיווחים לביטוח הלאומי</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">רישוי עסקים</h4>
                    <p className="text-muted-foreground">חידושים שנתיים ואישורים ממשרדי ממשלה</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">משאבי אנוש</h4>
                    <p className="text-muted-foreground">תלושי שכר, ניהול חופשות, ודיווחי שעות עבודה</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Upcoming Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overdue Alert */}
              {overdueTasks > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>שים לב! יש לך {overdueTasks} משימות באיחור</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">איחורים עלולים לגרום לקנסות וחובות:</p>
                    <ul className="mr-4 text-sm space-y-1 mb-3">
                      <li>• קנס על איחור בהגשת מע״מ: עד 1,540 ₪</li>
                      <li>• קנס על איחור בתשלום לביטוח לאומי: 2-5% מהחוב</li>
                      <li>• סגירת עסק בגין אי-חידוש רישיון</li>
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-white hover:bg-gray-50"
                      onClick={() => setViewMode('list')}
                    >
                      הצג משימות באיחור
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Upcoming Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>משימות קרובות (30 ימים הקרובים)</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <TaskCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : upcomingTasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      אין משימות קרובות
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              {task.dueDate && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  יעד: {new Date(task.dueDate).toLocaleDateString('he-IL')}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskComplete(task.id);
                              }}
                            >
                              סמן כהושלם
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Getting Help Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    זקוק לעזרה?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">🏛️ אתרי ממשלה רלוונטיים:</p>
                      <ul className="mr-4 space-y-1 text-muted-foreground">
                        <li>
                          • <a href="https://www.gov.il" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            שירות לאומי דיגיטלי - Gov.il
                          </a>
                        </li>
                        <li>
                          • <a href="https://www.mas.gov.il" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            רשות המסים
                          </a>
                        </li>
                        <li>
                          • <a href="https://www.btl.gov.il" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            הביטוח הלאומי
                          </a>
                        </li>
                        <li>
                          • <a href="https://www.economy.gov.il" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            משרד הכלכלה - רישוי עסקים
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">📞 מוקדי שירות:</p>
                      <ul className="mr-4 space-y-1 text-muted-foreground">
                        <li>• מס הכנסה: *4954 | 02-5656400</li>
                        <li>• ביטוח לאומי: *6050 | 08-6709999</li>
                        <li>• רישוי עסקים: לפי עירייה</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-blue-900 text-xs">
                        <strong>שימו לב:</strong> bioGov מספקת מידע והכוונה בלבד. המערכת אינה מהווה תחליף לייעוץ מקצועי של רוא״ח או עו״ד.
                        לפני קבלת החלטות חשובות, מומלץ להתייעץ עם איש מקצוע מוסמך.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </>
        )}

        {/* List Mode */}
        {viewMode === 'list' && (
          <TaskList
            tasks={tasks}
            onTaskComplete={handleTaskComplete}
            onTaskClick={handleTaskClick}
          />
        )}

        {/* Calendar Mode */}
        {viewMode === 'calendar' && (
          <CalendarView tasks={tasks} onTaskClick={handleTaskClick} />
        )}
      </main>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onComplete={handleTaskComplete}
      />

      {/* Celebration Animation */}
      <Celebration
        show={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}
