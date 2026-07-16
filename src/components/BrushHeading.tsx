import type { ElementType, ReactNode } from 'react'

type Props = {
  as?: ElementType
  children: ReactNode
  className?: string
  /** Цвет мазка под текстом */
  tone?: 'ice' | 'blue'
}

// Заголовок с «мазком кисти» под текстом — фирменный мотив с обложек церкви.
export function BrushHeading({ as: Tag = 'h2', children, className = '', tone = 'ice' }: Props) {
  return (
    <Tag className={`relative ${className}`}>
      <span className="isolate relative inline decoration-clone px-1">
        <svg
          className={`absolute inset-x-0 bottom-[0.05em] -z-10 h-[0.45em] w-full ${
            tone === 'blue' ? 'text-blue/50' : 'text-ice'
          }`}
          viewBox="0 0 100 14"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M1.5 9.5C14 5.5 33 10.5 51 7.2c15-2.7 33-1.5 46.5-3.9l-.8 6.4C82 12.4 63 9.8 45.5 12.3 29 14.6 12 12.8 1.2 13.4z"
            fill="currentColor"
          />
        </svg>
        {children}
      </span>
    </Tag>
  )
}
