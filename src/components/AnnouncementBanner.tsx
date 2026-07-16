export function AnnouncementBanner({ title, text }: { title: string; text: string }) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-2xl bg-ink p-5 text-paper sm:flex-row sm:items-center sm:gap-4"
    >
      <span className="chip shrink-0 self-start bg-blue text-ink">{title}</span>
      <p className="whitespace-pre-line text-lg">{text}</p>
    </div>
  )
}
