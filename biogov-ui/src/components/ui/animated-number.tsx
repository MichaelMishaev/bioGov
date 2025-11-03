'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // Animation duration in milliseconds
  decimals?: number; // Number of decimal places
  className?: string;
  prefix?: string; // e.g., "₪"
  suffix?: string; // e.g., "%"
  delay?: number; // Delay before animation starts
}

export function AnimatedNumber({
  value,
  duration = 1000,
  decimals = 0,
  className = '',
  prefix = '',
  suffix = '',
  delay = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  // Intersection Observer to trigger animation when element comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setIsVisible(true);
            hasAnimated.current = true;
          }
        });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  // Animate the number
  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now() + delay;
    const startValue = 0;
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue); // Ensure we end on exact value
      }
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, duration, delay, isVisible]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span ref={elementRef} className={`number-animate ${className}`}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
