// Упрощённый фирменный знак по мотивам логотипа: два крыла и нимб.
// Когда появится файл оригинального логотипа (public/logo.svg или .png) —
// замените разметку на <img src="/logo.svg" alt="" />.
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="24" cy="24" r="23" fill="#ffffff" stroke="#1d2733" strokeWidth="1.5" />
      <path
        d="M12 30c6-2 10-6 12-12 1 5 0 9-2 12-3 4-7 4-10 0z"
        fill="#2fa8d5"
      />
      <path
        d="M36 30c-6-2-10-6-12-12-1 5 0 9 2 12 3 4 7 4 10 0z"
        fill="#2b3384"
      />
      <ellipse cx="24" cy="13" rx="4.5" ry="2" fill="none" stroke="#9aa4ad" strokeWidth="1.5" />
    </svg>
  )
}
