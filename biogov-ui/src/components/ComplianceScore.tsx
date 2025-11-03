import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/animated-number';

interface ComplianceScoreProps {
  score: number; // 0-100
  trend: number; // Change from last period (-100 to +100)
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export function ComplianceScore({
  score,
  trend,
  totalTasks,
  completedTasks,
  overdueTasks,
}: ComplianceScoreProps) {
  const isPositiveTrend = trend >= 0;
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-green-500/5';
    if (score >= 60) return 'from-yellow-500/20 to-yellow-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'מצוין';
    if (score >= 80) return 'טוב מאוד';
    if (score >= 70) return 'טוב';
    if (score >= 60) return 'סביר';
    return 'דורש תשומת לב';
  };

  return (
    <Card className={`bg-gradient-to-br ${getScoreBackground(score)}`}>
      <CardHeader>
        <CardTitle className="text-lg">ציון ציות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="text-center">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
            <AnimatedNumber
              value={Math.round(score)}
              duration={1200}
              suffix="%"
              className="inline-block"
            />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            {getScoreLabel(score)}
          </p>
        </div>

        {/* Trend Indicator */}
        {trend !== 0 && (
          <div
            className={`flex items-center justify-center gap-2 text-sm font-medium ${
              isPositiveTrend ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositiveTrend ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span>
              {isPositiveTrend ? '+' : ''}
              {trend.toFixed(1)}% מהחודש שעבר
            </span>
          </div>
        )}

        {/* Task Statistics */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">משימות שהושלמו</span>
            <span className="font-semibold">
              <AnimatedNumber value={completedTasks} duration={800} delay={200} /> מתוך <AnimatedNumber value={totalTasks} duration={800} delay={300} />
            </span>
          </div>

          {overdueTasks > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">משימות באיחור</span>
              <span className="font-semibold text-red-600">
                <AnimatedNumber value={overdueTasks} duration={800} delay={400} />
              </span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  score >= 80
                    ? 'bg-green-600'
                    : score >= 60
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              <AnimatedNumber value={completedTasks} duration={800} delay={500} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">הושלם</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              <AnimatedNumber value={totalTasks - completedTasks - overdueTasks} duration={800} delay={600} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">פעיל</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              <AnimatedNumber value={overdueTasks} duration={800} delay={700} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">באיחור</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
