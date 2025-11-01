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
  const StatusIcon = statusConfig[task.status].icon;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

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
      className={`hover:shadow-lg transition-shadow cursor-pointer ${
        isOverdue ? 'border-red-300 bg-red-50/30' : ''
      }`}
      onClick={() => onClick?.(task)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge className={priorityConfig[task.priority].color}>
              {priorityConfig[task.priority].label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-6 text-sm">
          <div className={`flex items-center gap-2 ${statusConfig[task.status].color}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{statusConfig[task.status].label}</span>
          </div>

          {task.dueDate && (
            <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
              <Calendar className="w-4 h-4" />
              <span>
                {isOverdue && 'באיחור: '}
                {formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>

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

        <div className="flex gap-2 pt-2">
          {task.externalLink && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                window.open(task.externalLink!, '_blank');
              }}
            >
              <ExternalLink className="w-4 h-4 ml-2" />
              פתח טופס
            </Button>
          )}

          {task.status !== 'completed' && onComplete && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
            >
              <CheckCircle2 className="w-4 h-4 ml-2" />
              סמן כהושלם
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
