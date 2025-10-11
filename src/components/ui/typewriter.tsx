
'use client';

import { useState, useEffect, useRef } from 'react';
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
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current || !text) return;

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      hasRun.current = true;
      let i = 0;
      let isDeleting = false;

      intervalId = setInterval(() => {
        if (loop) {
          if (isDeleting) {
            setDisplayedText((prev) => prev.slice(0, prev.length - 1));
            if (displayedText.length === 1) {
              isDeleting = false;
              i = 0;
            }
          } else {
            setDisplayedText((prev) => prev + text.charAt(i));
            i++;
            if (i === text.length) {
              // Pause at the end before deleting
              setTimeout(() => {
                isDeleting = true;
              }, 2000);
            }
          }
        } else {
          // One-time typing
          if (i < text.length) {
            setDisplayedText((prev) => prev + text.charAt(i));
            i++;
          } else {
            clearInterval(intervalId);
          }
        }
      }, speed);

    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [text, speed, loop, delay]);

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
