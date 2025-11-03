/**
 * Skip-to-Content Link Component
 * WCAG 2.1 AA - Success Criterion 2.4.1: Bypass Blocks (Level A)
 *
 * Provides a keyboard-accessible link that allows users to skip repetitive navigation
 * and jump directly to the main content area.
 *
 * The link is visually hidden until it receives keyboard focus.
 */

'use client';

import React from 'react';

interface SkipToContentProps {
  /**
   * The ID of the main content element to skip to
   * @default "main-content"
   */
  targetId?: string;
  /**
   * The text displayed in the skip link
   * @default "דלג לתוכן הראשי" (Hebrew: Skip to main content)
   */
  children?: React.ReactNode;
}

export function SkipToContent({
  targetId = 'main-content',
  children = 'דלג לתוכן הראשי'
}: SkipToContentProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);

    if (target) {
      // Set focus to the target element
      target.focus();

      // If the element is not naturally focusable, set tabindex temporarily
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }

      // Scroll the element into view smoothly
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-to-content"
      aria-label={typeof children === 'string' ? children : 'דלג לתוכן הראשי'}
    >
      {children}
    </a>
  );
}

/**
 * Styles for Skip-to-Content Link
 * Add these to your globals.css file:
 *
 * .skip-to-content {
 *   position: absolute;
 *   left: -9999px;
 *   z-index: 999;
 *   padding: 1rem 1.5rem;
 *   background-color: hsl(var(--primary));
 *   color: hsl(var(--primary-foreground));
 *   text-decoration: none;
 *   font-weight: 600;
 *   border-radius: 0 0 0.5rem 0;
 *   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
 *   transition: left 0.3s;
 * }
 *
 * .skip-to-content:focus {
 *   left: 0;
 *   outline: 3px solid hsl(var(--ring));
 *   outline-offset: 2px;
 * }
 */
