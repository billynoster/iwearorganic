/** Skip to main content — first focusable control for keyboard users. */
export function SkipLink({ href = '#main-content' }: { href?: string }) {
  return (
    <a href={href} className="ca-skip-link">
      Skip to content
    </a>
  );
}
