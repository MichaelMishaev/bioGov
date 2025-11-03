import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onClick?: (task: Task) => void;
}

const priorityConfig = {
  low: { label: 'נמוך', color: 'bg-blue-100 text-blue-800' },
  medium: { label: 'בינוני', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'גבוה', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'דחוף', color: 'bg-red-100 text-red-800' },
};

const statusConfig = {
  pending: { label: 'ממתין', icon: Clock, color: 'text-gray-500' },
  in_progress: { label: 'בתהליך', icon: AlertCircle, color: 'text-blue-600' },
  completed: { label: 'הושלם', icon: CheckCircle2, color: 'text-green-600' },
};

export function TaskCard({ task, onComplete, onClick }: TaskCardProps) {
  // Derive status from completed_at field if status is not provided
  const taskStatus = task.status || (task.completedAt ? 'completed' : 'pending');
  const statusInfo = statusConfig[taskStatus as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && taskStatus !== 'completed';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd בMMMM yyyy', { locale: he });
    } catch {
      return dateString;
    }
  };

  return (
    <Card
      className={`card-hover cursor-pointer border-l-4 group ${
        isOverdue
          ? 'border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent hover:shadow-danger hover:border-l-red-600'
          : 'border-l-primary hover:shadow-primary hover:border-l-blue-600'
      }`}
      onClick={() => onClick?.(task)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Icon with colored background - mobile-first sizing + animation */}
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
            isOverdue ? 'bg-red-100 group-hover:bg-red-200' : 'bg-primary/10 group-hover:bg-primary/20'
          }`}>
            <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-12 ${
              isOverdue ? 'text-red-600' : statusInfo.color
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 flex-1 group-hover:text-primary transition-colors duration-300">
                {task.title}
              </h3>
              {/* Priority badge with modern styling + pulse for urgent */}
              <Badge className={`${priorityConfig[task.priority].color} border-0 shadow-sm whitespace-nowrap text-xs ${
                task.priority === 'urgent' ? 'animate-pulse-slow' : ''
              }`}>
                {priorityConfig[task.priority].label}
              </Badge>
            </div>

            {task.description && (
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date with visual indicator */}
        {task.dueDate && (
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <div className={`flex items-center gap-1.5 sm:gap-2 ${
              isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'
            }`}>
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>
                {isOverdue && <span className="font-semibold">באיחור: </span>}
                {formatDate(task.dueDate)}
              </span>
            </div>
            <div className={`hidden sm:flex flex-1 items-center gap-2 mr-2`}>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  isOverdue ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-purple-600'
                } w-2/3`} />
              </div>
              <span className={`text-xs ${statusInfo.color} font-medium`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        )}

        {task.requiredDocuments && task.requiredDocuments.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">מסמכים נדרשים:</span>
            <ul className="mr-4 mt-1 space-y-1">
              {task.requiredDocuments.slice(0, 2).map((doc, index) => (
                <li key={index} className="text-muted-foreground">• {doc}</li>
              ))}
              {task.requiredDocuments.length > 2 && (
                <li className="text-primary">+ {task.requiredDocuments.length - 2} נוספים</li>
              )}
            </ul>
          </div>
        )}

        {/* Action buttons - mobile-first stacking */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {task.externalLink && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:border-primary/50"
              onClick={(e) => {
                e.stopPropagation();
                window.open(task.externalLink!, '_blank');
              }}
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2" />
              פתח טופס
            </Button>
          )}

          {taskStatus !== 'completed' && onComplete && (
            <Button
              variant="gradient"
              size="sm"
              className="flex-1 relative overflow-hidden group/btn"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
            >
              <span className="relative z-10 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                סמן כהושלם
              </span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
