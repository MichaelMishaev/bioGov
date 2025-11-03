'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Task } from '@/types/task';

interface TaskDetailsModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (taskId: string) => void;
  onReschedule?: (taskId: string, newDate: string) => void;
  onAddNote?: (taskId: string, note: string) => void;
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

export function TaskDetailsModal({
  task,
  open,
  onOpenChange,
  onComplete,
  onReschedule,
  onAddNote,
}: TaskDetailsModalProps) {
  const [note, setNote] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);

  if (!task) return null;

  // Derive status from completed_at field if status is not provided
  const taskStatus = task.status || (task.completedAt ? 'completed' : 'pending');
  const StatusIcon = statusConfig[taskStatus].icon;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && taskStatus !== 'completed';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd בMMMM yyyy', { locale: he });
    } catch {
      return dateString;
    }
  };

  const handleComplete = () => {
    onComplete?.(task.id);
    onOpenChange(false);
  };

  const handleReschedule = () => {
    if (rescheduleDate) {
      onReschedule?.(task.id, rescheduleDate);
      setShowReschedule(false);
      setRescheduleDate('');
    }
  };

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote?.(task.id, note);
      setNote('');
      setShowNoteInput(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 mb-2">
            <DialogTitle className="text-2xl flex-1">{task.title}</DialogTitle>
            <Badge className={priorityConfig[task.priority].color}>
              {priorityConfig[task.priority].label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className={`flex items-center gap-2 ${statusConfig[taskStatus].color}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{statusConfig[taskStatus].label}</span>
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
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="font-semibold mb-3 text-lg">תיאור</h3>
              <div className="prose prose-sm max-w-none text-right prose-headings:text-right prose-p:text-right prose-ul:text-right prose-li:text-right">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Style bold text
                    strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                    // Style paragraphs
                    p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-gray-700" {...props} />,
                    // Style lists
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 mr-4" {...props} />,
                    li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                  }}
                >
                  {task.description}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Required Documents */}
          {task.requiredDocuments && task.requiredDocuments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                מסמכים נדרשים
              </h3>
              <ul className="space-y-2">
                {task.requiredDocuments.map((doc, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* External Link */}
          {task.externalLink && (
            <div>
              <h3 className="font-semibold mb-2">קישור לטופס</h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(task.externalLink!, '_blank')}
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                {task.externalLink}
              </Button>
            </div>
          )}

          {/* Completed At */}
          {taskStatus === 'completed' && task.completedAt && (
            <div>
              <h3 className="font-semibold mb-2">הושלם בתאריך</h3>
              <p className="text-muted-foreground">{formatDate(task.completedAt)}</p>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                הערות
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{task.notes}</p>
            </div>
          )}

          {/* Add Note */}
          {showNoteInput && (
            <div>
              <Label htmlFor="note">הוסף הערה</Label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full mt-2 p-3 border rounded-lg text-right"
                rows={3}
                placeholder="הקלד הערה..."
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleAddNote} size="sm">
                  שמור הערה
                </Button>
                <Button
                  onClick={() => {
                    setShowNoteInput(false);
                    setNote('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  ביטול
                </Button>
              </div>
            </div>
          )}

          {/* Reschedule */}
          {showReschedule && taskStatus !== 'completed' && (
            <div>
              <Label htmlFor="reschedule">תאריך יעד חדש</Label>
              <input
                type="date"
                id="reschedule"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full mt-2 p-2 border rounded-lg"
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleReschedule} size="sm">
                  עדכן תאריך
                </Button>
                <Button
                  onClick={() => {
                    setShowReschedule(false);
                    setRescheduleDate('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  ביטול
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          {taskStatus !== 'completed' && (
            <>
              <Button
                onClick={handleComplete}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 ml-2" />
                סמן כהושלם
              </Button>

              {!showReschedule && (
                <Button
                  onClick={() => setShowReschedule(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <Calendar className="w-4 h-4 ml-2" />
                  שנה תאריך
                </Button>
              )}

              {!showNoteInput && (
                <Button
                  onClick={() => setShowNoteInput(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 ml-2" />
                  הוסף הערה
                </Button>
              )}
            </>
          )}

          {task.externalLink && (
            <Button
              onClick={() => window.open(task.externalLink!, '_blank')}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 ml-2" />
              פתח טופס
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
