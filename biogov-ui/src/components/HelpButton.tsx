'use client';

import { HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function HelpButton() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative group">
      <Button
        onClick={() => router.push('/help')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-12 h-12 rounded-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl p-0 flex items-center justify-center border-2 border-white/20"
        aria-label="עזרה והדרכה - לחצו לפתיחת מרכז העזרה"
        title="עזרה והדרכה"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>

      {/* Tooltip on hover */}
      {isHovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl whitespace-nowrap z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="text-center font-medium">עזרה והדרכה</div>
          <div className="text-xs text-gray-300 mt-0.5">מדריכים, זרימות ושאלות נפוצות</div>
          {/* Arrow */}
          <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      )}
    </div>
  );
}
