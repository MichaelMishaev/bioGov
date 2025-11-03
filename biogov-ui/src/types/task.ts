/**
 * Shared Task type used across all components
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status?: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  taskType: string;
  externalLink: string | null;
  requiredDocuments: string[] | null;
  completedAt?: string | null;
  notes?: string | null;
}
