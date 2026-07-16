import type { UpcomingService } from '@/lib/schedule'

export function UpcomingServices({ services }: { services: UpcomingService[] }) {
  if (services.length === 0) return null

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <li
          key={`${service.timestamp}-${service.title}`}
          className="card flex flex-col gap-2 p-5"
        >
          <span className="font-heading text-sm font-semibold uppercase tracking-wider text-blue-dark">
            {service.dateLabel}
          </span>
          <span className="font-heading text-4xl font-bold text-ink">{service.time}</span>
          <span className="text-lg font-semibold normal-case">{service.title}</span>
          {service.note ? <span className="text-base text-ink-soft">{service.note}</span> : null}
        </li>
      ))}
    </ul>
  )
}
