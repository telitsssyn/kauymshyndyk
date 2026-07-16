import type { Setting } from '@/payload-types'

type Props = {
  settings: Setting | null | undefined
  className?: string
}

export function SocialLinks({ settings, className = '' }: Props) {
  const links = [
    settings?.instagram
      ? {
          href: settings.instagram,
          label: 'Instagram',
          icon: (
            <path
              d="M12 8.4A3.6 3.6 0 1 0 12 15.6 3.6 3.6 0 0 0 12 8.4zm0-3.9c2.5 0 2.8 0 3.8.06 2.4.1 3.55 1.26 3.65 3.65.05 1 .06 1.3.06 3.79s-.01 2.8-.06 3.79c-.1 2.39-1.24 3.55-3.65 3.65-1 .05-1.3.06-3.8.06s-2.8-.01-3.79-.06c-2.4-.1-3.55-1.27-3.65-3.65-.05-1-.06-1.3-.06-3.8s.01-2.79.06-3.78c.1-2.4 1.24-3.55 3.65-3.65 1-.05 1.3-.06 3.8-.06zM12 2.5c-2.58 0-2.9.01-3.91.06-3.45.16-5.37 2.07-5.53 5.53-.05 1-.06 1.33-.06 3.91s.01 2.9.06 3.91c.16 3.45 2.07 5.37 5.53 5.53 1 .05 1.33.06 3.91.06s2.9-.01 3.91-.06c3.45-.16 5.37-2.08 5.53-5.53.05-1 .06-1.33.06-3.91s-.01-2.9-.06-3.91c-.16-3.45-2.08-5.37-5.53-5.53-1-.05-1.33-.06-3.91-.06zm7.85 5.03a1.35 1.35 0 1 1-2.7 0 1.35 1.35 0 0 1 2.7 0z"
              fill="currentColor"
            />
          ),
        }
      : null,
    settings?.youtube
      ? {
          href: settings.youtube,
          label: 'YouTube',
          icon: (
            <path
              d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42A2.5 2.5 0 0 0 2.42 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.42-4.81zM10 15.2V8.8l5.2 3.2-5.2 3.2z"
              fill="currentColor"
            />
          ),
        }
      : null,
  ].filter((l) => l !== null)

  if (links.length === 0) return null

  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-ice text-blue-dark transition-colors hover:bg-blue-dark hover:text-white"
            aria-label={link.label}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" focusable="false">
              {link.icon}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
