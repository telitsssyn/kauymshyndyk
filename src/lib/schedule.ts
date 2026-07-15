import type { Schedule } from '@/payload-types'

// Павлодар живёт по времени Астаны: UTC+5, перехода на летнее время нет.
const TZ = 'Asia/Almaty'
const TZ_OFFSET_HOURS = 5

const DAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

export type UpcomingService = {
  timestamp: number
  dayKey?: string
  dateLabel: string
  time: string
  title: string
  note?: string | null
  isSpecial: boolean
}

const localNowParts = () => {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  return {
    y: Number(get('year')),
    m: Number(get('month')),
    d: Number(get('day')),
    hh: Number(get('hour')) % 24,
    mm: Number(get('minute')),
    weekday: weekdayMap[get('weekday')] ?? 0,
  }
}

// Метка времени (UTC) для даты и времени по часам Павлодара
const almatyTimestamp = (y: number, m: number, d: number, hh: number, mm: number) =>
  Date.UTC(y, m - 1, d, hh - TZ_OFFSET_HOURS, mm)

const formatDateLabel = (timestamp: number, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(timestamp))

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat('ru', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp))

export const getUpcomingServices = (
  schedule: Schedule | null | undefined,
  locale: string,
  count = 4,
): UpcomingService[] => {
  if (!schedule) return []
  const now = localNowParts()
  const nowTs = almatyTimestamp(now.y, now.m, now.d, now.hh, now.mm)
  const upcoming: UpcomingService[] = []

  for (const service of schedule.regularServices ?? []) {
    const dayIdx = DAY_INDEX[service.day]
    if (dayIdx === undefined) continue
    const [hh, mm] = service.time.split(':').map(Number)
    let delta = (dayIdx - now.weekday + 7) % 7
    if (delta === 0 && (hh < now.hh || (hh === now.hh && mm <= now.mm))) delta = 7
    const ts = almatyTimestamp(now.y, now.m, now.d + delta, hh, mm)
    upcoming.push({
      timestamp: ts,
      dayKey: service.day,
      dateLabel: formatDateLabel(ts, locale),
      time: service.time,
      title: service.title,
      note: service.note,
      isSpecial: false,
    })
  }

  for (const special of schedule.specialServices ?? []) {
    const ts = new Date(special.date).getTime()
    if (Number.isNaN(ts) || ts < nowTs) continue
    upcoming.push({
      timestamp: ts,
      dateLabel: formatDateLabel(ts, locale),
      time: formatTime(ts),
      title: special.title,
      note: special.note,
      isSpecial: true,
    })
  }

  return upcoming.sort((a, b) => a.timestamp - b.timestamp).slice(0, count)
}

// Актуальные (не прошедшие) особые служения для страницы расписания
export const getActiveSpecialServices = (schedule: Schedule | null | undefined, locale: string) => {
  if (!schedule) return []
  const nowTs = Date.now()
  return (schedule.specialServices ?? [])
    .map((s) => ({ ...s, timestamp: new Date(s.date).getTime() }))
    .filter((s) => !Number.isNaN(s.timestamp) && s.timestamp >= nowTs)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((s) => ({
      dateLabel: formatDateLabel(s.timestamp, locale),
      time: formatTime(s.timestamp),
      title: s.title,
      note: s.note,
    }))
}
