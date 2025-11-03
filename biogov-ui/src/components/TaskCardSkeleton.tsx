import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TaskCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Icon skeleton */}
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0" />

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              {/* Title skeleton */}
              <Skeleton className="h-5 sm:h-6 w-3/4" />
              {/* Badge skeleton */}
              <Skeleton className="h-5 w-16" />
            </div>

            {/* Description skeleton */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Buttons skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Skeleton className="h-9 sm:h-9 flex-1" />
          <Skeleton className="h-9 sm:h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}
