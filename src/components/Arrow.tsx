import type { SVGProps } from 'react'

type ArrowProps = SVGProps<SVGSVGElement> & {
  direction?: 'left' | 'right'
  className?: string
}

/**
 * Чёткая, оптически выровненная стрелка для ссылок и кнопок.
 * Толщина штриха и пропорции подобраны под жирное начертание шрифта заголовков.
 */
export function Arrow({
  direction = 'right',
  className = 'h-4 w-4',
  ...props
}: ArrowProps) {
  const isRight = direction === 'right'

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 transition-transform ${
        isRight ? 'group-hover:translate-x-0.5' : 'group-hover:-translate-x-0.5'
      } ${className}`}
      {...props}
    >
      {isRight ? (
        <path d="M3.5 10h13M10.5 4l6 6-6 6" />
      ) : (
        <path d="M16.5 10h-13M9.5 16l-6-6 6-6" />
      )}
    </svg>
  )
}
