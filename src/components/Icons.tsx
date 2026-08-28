export function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ArrowLeft({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M13 7H1M6 2L1 7l5 5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ArrowDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v12M2 8l5 5 5-5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Chevron({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 12 8" fill="none" aria-hidden="true">
      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
