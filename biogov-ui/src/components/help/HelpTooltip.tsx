'use client';

import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function HelpTooltip({ content, title, side = 'top' }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="עזרה"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 ${
            side === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' :
            side === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' :
            side === 'left' ? 'right-full mr-2 top-1/2 -translate-y-1/2' :
            'left-full ml-2 top-1/2 -translate-y-1/2'
          }`}
        >
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              side === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              side === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              side === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />

          <div className="relative">
            {title && (
              <div className="font-semibold mb-1 text-white">{title}</div>
            )}
            <div className="text-gray-200 leading-relaxed">{content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
