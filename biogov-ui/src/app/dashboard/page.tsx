'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { ComplianceScore } from '@/components/ComplianceScore';
import { TaskList } from '@/components/TaskList';
import { CalendarView } from '@/components/CalendarView';
import { TaskDetailsModal } from '@/components/TaskDetailsModal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  LayoutDashboard,
  List,
  Calendar as CalendarIcon,
  LogOut,
  User,
  Bell,
  Settings,
} from 'lucide-react';
import { Task } from '@/types/task';

type ViewMode = 'overview' | 'list' | 'calendar';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
        const data = await response.json();
        setTasks(data.tasks || []);
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

  if (authLoading || loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">bioGov</h1>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">לוח בקרה</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 ml-2" />
                יציאה
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === 'overview' ? 'default' : 'outline'}
            onClick={() => setViewMode('overview')}
          >
            <LayoutDashboard className="w-4 h-4 ml-2" />
            סקירה כללית
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 ml-2" />
            רשימת משימות
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="w-4 h-4 ml-2" />
            לוח שנה
          </Button>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Compliance Score */}
            <div className="lg:col-span-1">
              <ComplianceScore
                score={score}
                trend={trend}
                totalTasks={tasks.length}
                completedTasks={completedTasks}
                overdueTasks={overdueTasks}
              />
            </div>

            {/* Right Column - Upcoming Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overdue Alert */}
              {overdueTasks > 0 && (
                <Card className="border-red-300 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-600">
                      יש לך {overdueTasks} משימות באיחור
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-600 mb-3">
                      משימות אלו דורשות תשומת לב מיידית כדי למנוע קנסות או בעיות משפטיות.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setViewMode('list')}
                    >
                      צפה במשימות באיחור
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>משימות קרובות (30 ימים הקרובים)</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingTasks.length === 0 ? (
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
            </div>
          </div>
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
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onComplete={handleTaskComplete}
      />
    </div>
  );
}
