import { readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()
vi.mock('next/cache.js', () => ({ revalidatePath }))

const { CONTENT_TARGETS, revalidateContent, revalidateSite } = await import('@/lib/revalidate')

const APP_DIR = path.resolve(__dirname, '../../src/app')

/** Маршруты всех страниц сайта в том виде, в каком Next помечает их в кэше */
function pageRoutes(dir = path.join(APP_DIR, '(frontend)')): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return pageRoutes(full)
    if (entry.name !== 'page.tsx') return []
    return ['/' + path.relative(APP_DIR, dir).split(path.sep).join('/')]
  })
}

const isCovered = (route: string) =>
  CONTENT_TARGETS.some(({ path: target, type }) =>
    type === 'layout' ? route === target || route.startsWith(`${target}/`) : route === target,
  )

describe('сброс кэша после сохранения в админке', () => {
  it('каждая страница сайта, кроме Библии, сбрасывается при изменении контента', () => {
    const routes = pageRoutes()
    expect(routes.length).toBeGreaterThan(10)

    const forgotten = routes.filter((route) => !route.includes('/bible') && !isCovered(route))
    expect(forgotten).toEqual([])
  })

  it('главы Библии при изменении контента не трогаются', () => {
    const bible = pageRoutes().filter((route) => route.includes('/bible'))
    expect(bible.length).toBe(2)
    expect(bible.filter(isCovered)).toEqual([])
  })

  it('каждая цель сброса указывает на существующий маршрут', () => {
    const routes = pageRoutes()
    for (const { path: target, type } of CONTENT_TARGETS) {
      if (!type) continue
      expect(
        routes.some((route) => route === target || route.startsWith(`${target}/`)),
        target,
      ).toBe(true)
    }
  })

  it('контент сбрасывает только свои разделы, настройки — весь сайт', () => {
    revalidateContent()
    expect(revalidatePath).toHaveBeenCalledTimes(CONTENT_TARGETS.length)
    expect(revalidatePath).not.toHaveBeenCalledWith('/', 'layout')

    revalidatePath.mockClear()
    revalidateSite()
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith('/', 'layout')
  })

  it('вне Next (seed-скрипт) сброс не роняет сохранение', () => {
    revalidatePath.mockImplementation(() => {
      throw new Error('static generation store missing')
    })
    expect(() => revalidateContent()).not.toThrow()
    expect(() => revalidateSite()).not.toThrow()
  })
})
