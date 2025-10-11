
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M17.5,3H6.5C4.567,3,3,4.567,3,6.5v11C3,19.433,4.567,21,6.5,21h11c1.933,0,3.5-1.567,3.5-3.5V6.5 C21,4.567,19.433,3,17.5,3z M17.293,8.293l-4.586,4.586c-0.391,0.391-1.023,0.391-1.414,0L7,8.586V12H5.5V7.793 c0-0.53,0.43-0.96,0.96-0.96H12v1.5H7.707l3.793,3.793l4.293-4.293H14v-1.5h3.207C17.737,6.833,18,7.263,18,7.793V12h-1.5V8.293z M12.707,14.707l-2-2H5.5v1.5h4.793l2.207,2.207c0.391,0.391,1.023,0.391,1.414,0l2.293-2.293H18.5v-1.5h-5.086 L12.707,14.707z"
        fill="url(#logo-gradient)"
      />
    </svg>
  );
}
