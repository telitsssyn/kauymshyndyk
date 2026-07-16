// Фирменный логотип (public/logo.png). Фон у файла непрозрачный,
// поэтому обрезаем в круг — смотрится как аккуратный значок.
export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt=""
      aria-hidden="true"
      width={200}
      height={200}
      className={`rounded-full object-cover ring-1 ring-ink/10 ${className ?? ''}`}
    />
  )
}
