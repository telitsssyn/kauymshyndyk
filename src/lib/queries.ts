import { cache } from 'react'

import { getPayloadClient } from './payload'

export const getSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'settings', depth: 1 })
})

export const getSchedule = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'schedule' })
})

export const getHomePage = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'home-page', depth: 1 })
})

export const getFirstVisit = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'first-visit' })
})

export const getAboutPage = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'about-page', depth: 1 })
})

export const getMinistriesPage = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'ministries-page' })
})

export const getDonatePage = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'donate-page', depth: 1 })
})

export const getNewsList = cache(async (limit = 12, page = 1) => {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'news',
    sort: '-publishedDate',
    limit,
    page,
    depth: 1,
  })
})

export const getNewsBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return result.docs[0] ?? null
})

export const getSermonsList = cache(async (limit = 12, page = 1) => {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'sermons',
    sort: '-date',
    limit,
    page,
  })
})

export const getSermonBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'sermons',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] ?? null
})

export const getMinisters = cache(async () => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'ministers',
    sort: '_order',
    limit: 100,
    depth: 1,
  })
  return result.docs
})

export const getGallery = cache(async () => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'gallery',
    sort: '_order',
    limit: 100,
    depth: 1,
  })
  return result.docs
})
