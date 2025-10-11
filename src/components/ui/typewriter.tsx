"use client";

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

type TypewriterProps = {
  text: string;
  speed?: number;
  loop?: boolean;
  delay?: number;
  className?: string;
  as?: React.ElementType;
};

export function Typewriter({
  text,
  speed = 50,
  loop = false,
  delay = 0,
  className,
  as: Component = 'span',
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const startTimeout = setTimeout(() => {
      const handleTyping = () => {
        if (!isMounted) return;

        if (loop) {
          if (isDeleting) {
            setDisplayedText((prev) => prev.slice(0, prev.length - 1));
          } else {
            setDisplayedText((prev) => prev + text.charAt(index));
          }

          if (!isDeleting && displayedText === text) {
            // Pause at the end
            setTimeout(() => setIsDeleting(true), 2000);
          } else if (isDeleting && displayedText === '') {
            setIsDeleting(false);
            setIndex(0);
          } else {
            setIndex((prev) => (isDeleting ? prev : prev + 1));
          }
        } else {
          // One-time typing
          if (index < text.length) {
            setDisplayedText((prev) => prev + text.charAt(index));
            setIndex((prev) => prev + 1);
          }
        }
      };

      const typingInterval = setInterval(handleTyping, speed);

      return () => {
        clearInterval(typingInterval);
      };
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      setIsMounted(false);
    };
  }, [displayedText, index, isDeleting, text, speed, loop, delay, isMounted]);

  return (
    <Component
      className={cn(
        'font-code text-primary [text-shadow:0_0_5px_hsl(var(--primary)),0_0_10px_hsl(var(--primary))]',
        className
      )}
    >
      {displayedText}
      <span className="animate-pulse">|</span>
    </Component>
  );
}

export function JackpotTypewriter({
    text,
    className,
}: {
    text: string;
    className?: string;
}) {
    const [displayText, setDisplayText] = useState('------');

    useEffect(() => {
        let revealCount = 0;
        const interval = setInterval(() => {
            let currentDisplay = '';
            for (let i = 0; i < 6; i++) {
                if (i < revealCount) {
                    currentDisplay += text[i];
                } else {
                    currentDisplay += String(Math.floor(Math.random() * 10));
                }
            }
            setDisplayText(currentDisplay);
            
            if (revealCount < 6) {
                revealCount++;
            } else {
                clearInterval(interval);
                setDisplayText(text);
            }
        }, 150);

        return () => clearInterval(interval);
    }, [text]);

    return (
         <span
            className={cn(
                'font-mono font-bold tracking-widest text-primary [text-shadow:0_0_5px_hsl(var(--primary)),0_0_10px_hsl(var(--primary))]',
                className
            )}
        >
            {displayText}
        </span>
    )
}
