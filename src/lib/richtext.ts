// Плоский текст из документа Lexical — для мета-тегов и превью в соцсетях
export const richTextToPlain = (
  data: { root?: unknown } | null | undefined,
  maxLength = 160,
): string | undefined => {
  if (!data?.root) return undefined

  const parts: string[] = []
  const walk = (node: unknown) => {
    if (typeof node !== 'object' || node === null) return
    const record = node as { text?: unknown; children?: unknown }
    if (typeof record.text === 'string') parts.push(record.text)
    if (Array.isArray(record.children)) record.children.forEach(walk)
  }
  walk(data.root)

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text
}
