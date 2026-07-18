---
name: verify
description: Как проверить изменения на сайте вживую — запуск базы и dev-сервера, проверка страниц и скриншоты.
---

# Проверка изменений вживую

## Запуск

1. Проверить, не запущено ли уже: `netstat -ano | grep -E ":(3000|5433)\s"` — 5433 это локальный PostgreSQL, 3000 — dev-сервер.
2. Если нет: `npm run dev:db` (фоном, оставить работающим), при пустой базе один раз `npm run seed`, затем `npm run dev`.
3. Dev-сервер подхватывает правки (включая `src/i18n/routing.ts`) без перезапуска.

## Проверка страниц

- Публичные адреса — локализованные слаги из `src/i18n/routing.ts` (например, `/ru/raspisanie`, а не `/ru/schedule`). Внутренние пути отвечают 307-редиректом на публичный слаг — это нормальное поведение next-intl.
- HTML для анализа: `curl -s http://localhost:3000/ru/<slug> -o /tmp/page.html`, ссылки: `grep -o 'href="/ru/[a-z-]*"'`.
- Sitemap: `curl -s http://localhost:3000/sitemap.xml`.

## Скриншоты

Playwright установлен в проекте, браузеры скачаны:

```bash
npx playwright screenshot --viewport-size=1280,900 --full-page http://localhost:3000/ru/<slug> out.png
npx playwright screenshot --viewport-size=375,700 --full-page ...   # мобильная ширина
```

Для сценариев с кликами (проверка навигации, позиции скролла) — node-скрипт с playwright; если скрипт лежит вне проекта, подключать модуль по абсолютному пути: `require('c:/Projects/kauymshyndyk/node_modules/playwright')`.

## Особенности

- `python` в этом окружении — заглушка Windows Store (exit 49); для скриптов использовать `node -e`.
- В seed почта и телефон пустые — проверяйте условные блоки (mailto и т.п.) с этим в уме.
