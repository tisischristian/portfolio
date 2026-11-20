/**
 * Arrows from Pictures/SVG/SVG ("site - arrow 1/2.svg"). Both inherit the text colour
 * and size to the surrounding text (1em) unless a className overrides it.
 */

const base = "inline-block shrink-0 fill-current";

/** Diagonal arrow ("site - arrow 2.svg"). Points up-right; `rotate` turns it (90 = down-right, 135 = down). */
export function Arrow({ className = "size-[0.8em]", rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      viewBox="0 0 409.6 409.6"
      aria-hidden
      focusable="false"
      className={`${base} ${className}`}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <path d="M387.65,0c11.34,3,19.01,10.93,21.56,22.39v317.51c-4.52,20.12-26.96,29.44-43.5,15.98-3.52-2.86-9.2-11.14-9.2-15.58V90.38L43.94,403.11c-3.67,3.66-8.44,4.9-13.19,6.38-2.53-.25-5.55.35-7.98,0-19.27-2.75-29.44-27.63-16.75-42.77L318.98,52.79H70.27c-4.45,0-12.94-5.41-15.98-8.79C40.47,28.61,49.79,2.7,69.87,0h317.78Z" />
    </svg>
  );
}

/** Circled chevron ("site - arrow 1.svg"). Points right; `rotate` turns it. */
export function ArrowCircle({ className = "size-[1em]", rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      viewBox="0 0 409.6 409.6"
      aria-hidden
      focusable="false"
      className={`${base} ${className}`}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <path d="M216.88,0l30.99,4.54c77.79,16.55,140.37,79.23,156.89,157.14l4.54,31.04v23.99l-4.54,31.04c-16.53,77.91-79.1,140.59-156.89,157.14l-30.99,4.54c-7.92-.33-16.05.45-23.95,0C82.8,403.13-4.06,306.98.46,196.29,4.72,92.26,89.28,5.95,192.93,0h23.95ZM167.96,102.56c-11.48,1.94-18.09,15.68-11.63,25.66l74.86,76.22-71.02,71.84c-17.74,17.72,5.78,42.13,23.98,24.82,24.83-28.6,59.18-54.38,83.05-83.16,7.55-9.11,7.95-16.72.39-26.02-28.57-25.13-54.27-58.92-83.03-83.18-5.09-4.3-9.52-7.38-16.6-6.18Z" />
    </svg>
  );
}
