/**
 * Screen Reader Only Component
 * WCAG 2.1 AA - Utility for screen reader users
 *
 * Renders content that is visually hidden but accessible to screen readers.
 * Useful for providing additional context to assistive technology users.
 *
 * Example usage:
 * <ScreenReaderOnly>This text is only for screen readers</ScreenReaderOnly>
 */

import React from 'react';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  /**
   * HTML element type to render
   * @default "span"
   */
  as?: keyof JSX.IntrinsicElements;
}

export function ScreenReaderOnly({ children, as: Component = 'span' }: ScreenReaderOnlyProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

/**
 * Styles for Screen Reader Only content
 * Add these to your globals.css file:
 *
 * .sr-only {
 *   position: absolute;
 *   width: 1px;
 *   height: 1px;
 *   padding: 0;
 *   margin: -1px;
 *   overflow: hidden;
 *   clip: rect(0, 0, 0, 0);
 *   white-space: nowrap;
 *   border-width: 0;
 * }
 *
 * .sr-only-focusable:focus,
 * .sr-only-focusable:active {
 *   position: static;
 *   width: auto;
 *   height: auto;
 *   overflow: visible;
 *   clip: auto;
 *   white-space: normal;
 * }
 */
