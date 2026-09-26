'use client'

import { useEffect, useRef, useState } from 'react'

import { Arrow } from '@/components/Arrow'
import { BrushHeading } from '@/components/BrushHeading'

interface ReelItem {
  id: number
  videoSrc: string
  posterSrc?: string
}

const REELS: ReelItem[] = [
  { id: 1, videoSrc: '/reels/reel-1.mp4' },
  { id: 2, videoSrc: '/reels/reel-2.mp4' },
  { id: 3, videoSrc: '/reels/reel-3.mp4' },
  { id: 4, videoSrc: '/reels/reel-4.mp4' },
]

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

function ReelCard({ reel, isActive = true }: { reel: ReelItem; isActive?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)

  // Закрытие меню по клику снаружи
  useEffect(() => {
    if (!showMenu) return
    const handleClick = () => setShowMenu(false)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [showMenu])

  // Отслеживание полноэкранного режима
  useEffect(() => {
    const handleFsChange = () => {
      const isFs =
        document.fullscreenElement === cardRef.current ||
        // @ts-expect-error webkit prefix
        document.webkitFullscreenElement === cardRef.current
      setIsFullscreen(Boolean(isFs))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
    }
  }, [])

  // Отслеживание видимости карточки на экране (IntersectionObserver):
  // экономит трафик, процессор и батарею — не воспроизводит видео вне зоны видимости,
  // а на мобильных устройствах полностью игнорирует скрытые видео (hidden sm:block).
  useEffect(() => {
    const card = cardRef.current
    if (!card || typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold: 0.25 }
    )

    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  // Воспроизведение только когда видео находится в видимой области и активно
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isInView && isActive) {
      video.muted = true
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {})
      }
    } else {
      video.pause()
    }
  }, [isInView, isActive])

  // Надежная синхронизация длительности видео
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const syncDuration = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration)
      } else if (video.seekable && video.seekable.length > 0) {
        const end = video.seekable.end(video.seekable.length - 1)
        if (end && isFinite(end) && end > 0) {
          setDuration(end)
        }
      }
    }

    // Проверяем сразу (если метаданные уже были загружены)
    syncDuration()

    video.addEventListener('loadedmetadata', syncDuration)
    video.addEventListener('durationchange', syncDuration)
    video.addEventListener('loadeddata', syncDuration)
    video.addEventListener('canplay', syncDuration)
    video.addEventListener('timeupdate', syncDuration)

    return () => {
      video.removeEventListener('loadedmetadata', syncDuration)
      video.removeEventListener('durationchange', syncDuration)
      video.removeEventListener('loadeddata', syncDuration)
      video.removeEventListener('canplay', syncDuration)
      video.removeEventListener('timeupdate', syncDuration)
    }
  }, [])

  const handleCardClick = () => {
    if (isFullscreen) {
      togglePlay()
      return
    }
    // На мобильных переключаем видимость панели управления
    setShowControls((prev) => !prev)
  }

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return
    const nextMuted = !isMuted
    video.muted = nextMuted
    setIsMuted(nextMuted)
  }

  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const video = videoRef.current
    const card = cardRef.current
    if (!video && !card) return

    const isCurrentFs =
      document.fullscreenElement === card ||
      // @ts-expect-error webkit prefix
      document.webkitFullscreenElement === card

    if (isCurrentFs) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      // @ts-expect-error webkit prefix
      } else if (document.webkitExitFullscreen) {
        // @ts-expect-error webkit prefix
        document.webkitExitFullscreen()
      }
    } else {
      const videoWithWebkit = video as (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      if (card?.requestFullscreen) {
        card.requestFullscreen().catch(() => {
          videoWithWebkit?.webkitEnterFullscreen?.()
        })
      // @ts-expect-error webkit prefix
      } else if (card?.webkitRequestFullscreen) {
        // @ts-expect-error webkit prefix
        card.webkitRequestFullscreen()
      } else if (videoWithWebkit?.webkitEnterFullscreen) {
        videoWithWebkit.webkitEnterFullscreen()
      }
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = newProgress * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      className={`group relative w-full bg-black select-none overflow-hidden transition-all duration-300 [&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:fullscreen]:w-screen [&:fullscreen]:h-screen [&:fullscreen]:max-w-none [&:fullscreen]:rounded-none [&:fullscreen]:p-0 ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen flex items-center justify-center rounded-none cursor-default'
          : 'aspect-[9/16] rounded-2xl sm:rounded-3xl cursor-pointer shadow-md hover:shadow-xl'
      }`}
      aria-label="Видео проигрыватель"
    >
      {/* Кнопка закрытия в полноэкранном режиме */}
      {isFullscreen ? (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Выйти из полноэкранного режима"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      ) : null}

      {/* Внутренний контейнер: в полноэкранном режиме ограничивает ширину вертикального видео (9:16), чтобы оно полностью помещалось по высоте без зума и обрезки */}
      <div
        className={`relative h-full w-full flex items-center justify-center overflow-hidden ${
          isFullscreen ? 'max-w-[calc(100vh*9/16)] mx-auto' : ''
        }`}
      >
        {/* Видео элемент (без рамок) */}
        {!hasError ? (
          <video
            ref={videoRef}
            src={reel.videoSrc}
            poster={reel.posterSrc}
            preload="metadata"
            playsInline
            loop
            muted={isMuted}
            onTimeUpdate={(e) => {
              const current = e.currentTarget.currentTime
              setCurrentTime(current)
              const d = e.currentTarget.duration
              if ((!duration || duration === 0) && d && !isNaN(d) && isFinite(d) && d > 0) {
                setDuration(d)
              }
            }}
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration
              if (d && !isNaN(d) && isFinite(d) && d > 0) {
                setDuration(d)
              }
            }}
            onDurationChange={(e) => {
              const d = e.currentTarget.duration
              if (d && !isNaN(d) && isFinite(d) && d > 0) {
                setDuration(d)
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setHasError(true)}
            className={`h-full w-full ${isFullscreen ? 'object-contain' : 'object-cover'}`}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy via-blue-dark to-ink p-4 flex flex-col justify-center items-center text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 ml-0.5" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="mt-3 text-xs text-white/70">Видео #{reel.id}</span>
          </div>
        )}

        {/* Панель управления видео: появляется при hover на десктопе и при тапе на мобилке */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pt-8 pb-2.5 z-20 transition-opacity duration-200 cursor-default ${
            showControls
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Верхняя строка контролов: Play/Pause, Время, Громкость, Полноэкранный режим, 3 точки */}
          <div className="flex items-center justify-between gap-1.5 text-white">
            {/* Слева: Play/Pause и Время */}
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20 active:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-150 shrink-0 cursor-pointer"
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5 ml-0.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <span className="font-sans text-[11px] sm:text-xs font-medium text-white/90 select-none whitespace-nowrap px-1 py-0.5 cursor-default">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Справа: Звук, Полный экран, 3 точки с интерактивными ховерами и курсором pointer */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Громкость */}
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20 active:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                {isMuted ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>

              {/* Полноэкранный режим */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20 active:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                {isFullscreen ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                )}
              </button>

            {/* 3 точки */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                aria-label="Дополнительные параметры"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20 active:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {showMenu ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full right-0 mb-2 w-44 rounded-xl bg-ink/95 backdrop-blur border border-white/10 p-1 shadow-xl text-xs text-white z-30"
                >
                  <a
                    href={reel.videoSrc}
                    download
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span>Скачать видео</span>
                  </a>
                  <a
                    href={reel.videoSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span>В новой вкладке</span>
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Нижняя строка: прогресс-бар с ховером */}
        <div
          className="relative w-full cursor-pointer pt-2 pb-0.5 flex items-center group/track"
          onClick={handleSeek}
        >
          <div className="h-1 group-hover/track:h-1.5 w-full rounded-full bg-white/30 group-hover/track:bg-white/40 overflow-hidden relative transition-all duration-150 cursor-pointer">
            <div
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

interface ReelsSectionProps {
  instagramUrl?: string | null
  title?: string
  subtitle?: string
  ctaText?: string
}

export function ReelsSection({
  instagramUrl,
  title = 'Жизнь церкви в видео',
  subtitle = 'Короткие видео, моменты богослужений и вдохновляющие мысли из нашего Instagram',
  ctaText = 'Перейти в Instagram',
}: ReelsSectionProps) {
  const targetUrl = instagramUrl || 'https://www.instagram.com/kauymshyndyk'

  const [activeIndex, setActiveIndex] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)
  const sliderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 640)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const scrollToSlide = (index: number) => {
    const slider = sliderRef.current
    if (!slider) return
    const targetIndex = Math.max(0, Math.min(REELS.length - 1, index))
    const item = slider.children[targetIndex] as HTMLElement | undefined
    if (item) {
      const scrollLeft = item.offsetLeft - (slider.clientWidth - item.clientWidth) / 2
      slider.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth',
      })
      setActiveIndex(targetIndex)
    }
  }

  const prevSlide = () => {
    scrollToSlide(activeIndex - 1)
  }

  const nextSlide = () => {
    scrollToSlide(activeIndex + 1)
  }

  const handleScroll = () => {
    const slider = sliderRef.current
    if (!slider || isDesktop) return
    const scrollLeft = slider.scrollLeft
    const center = scrollLeft + slider.clientWidth / 2

    let closestIndex = 0
    let minDiff = Infinity

    Array.from(slider.children).forEach((child, idx) => {
      const el = child as HTMLElement
      const elCenter = el.offsetLeft + el.offsetWidth / 2
      const diff = Math.abs(elCenter - center)
      if (diff < minDiff) {
        minDiff = diff
        closestIndex = idx
      }
    })

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex)
    }
  }

  return (
    <section className="bg-white">
      <div className="container-site py-12 sm:py-16">
        {/* Заголовок и ссылка на Instagram */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <BrushHeading as="h2" className="text-3xl sm:text-4xl">
              {title}
            </BrushHeading>
            <p className="mt-2 max-w-xl text-base sm:text-lg text-ink-soft">
              {subtitle}
            </p>
          </div>

          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 font-heading font-semibold uppercase tracking-wider text-blue-dark hover:text-ink transition-colors"
          >
            <span>{ctaText}</span>
            <Arrow />
          </a>
        </div>

        {/* Контейнер: горизонтальный свайп-слайдер со стрелочками на мобилке, сетка 4 колонок на десктопе */}
        <div className="relative mt-8">
          {/* Боковая стрелочка назад (на карточке видео на мобилке) */}
          <button
            type="button"
            onClick={prevSlide}
            disabled={activeIndex === 0}
            aria-label="Предыдущее видео"
            className={`sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-ink/75 text-white backdrop-blur-md shadow-lg transition-all duration-200 active:scale-95 ${
              activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-ink'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 -ml-0.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Боковая стрелочка вперед (на карточке видео на мобилке) */}
          <button
            type="button"
            onClick={nextSlide}
            disabled={activeIndex === REELS.length - 1}
            aria-label="Следующее видео"
            className={`sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-ink/75 text-white backdrop-blur-md shadow-lg transition-all duration-200 active:scale-95 ${
              activeIndex === REELS.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-ink'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 -mr-0.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Список видео: горизонтальный свайп со snap на мобилке / 4 колонки на десктопе */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 pt-1 px-8 -mx-4 sm:mx-0 sm:px-0 sm:pb-0 sm:pt-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {REELS.map((reel, index) => (
              <div
                key={reel.id}
                className="w-[78vw] max-w-[300px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink"
              >
                <ReelCard reel={reel} isActive={isDesktop || index === activeIndex} />
              </div>
            ))}
          </div>

          {/* Нижняя панель навигации со стрелочками и индикаторами на мобилке (скрыта на sm+) */}
          <div className="mt-5 flex items-center justify-between sm:hidden px-2 max-w-[300px] mx-auto">
            {/* Кнопка назад */}
            <button
              type="button"
              onClick={prevSlide}
              disabled={activeIndex === 0}
              aria-label="Предыдущее видео"
              className={`flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white text-ink shadow-sm transition-all duration-150 active:scale-95 ${
                activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-ice hover:text-blue-dark active:bg-ice cursor-pointer'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Точки-индикаторы и счетчик видео */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                {REELS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToSlide(i)}
                    aria-label={`Перейти к видео ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                      i === activeIndex ? 'w-6 bg-blue-dark' : 'w-2 bg-ink/20 hover:bg-ink/40'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-ink-soft select-none">
                {activeIndex + 1} из {REELS.length}
              </span>
            </div>

            {/* Кнопка вперед */}
            <button
              type="button"
              onClick={nextSlide}
              disabled={activeIndex === REELS.length - 1}
              aria-label="Следующее видео"
              className={`flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white text-ink shadow-sm transition-all duration-150 active:scale-95 ${
                activeIndex === REELS.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-ice hover:text-blue-dark active:bg-ice cursor-pointer'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
