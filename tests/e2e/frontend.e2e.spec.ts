import { expect, test } from '@playwright/test'

test.describe('Frontend', () => {
  test('главная открывается и показывает название церкви', async ({ page }) => {
    await page.goto('http://localhost:3000/ru')

    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()

    await expect(page.locator('header')).toContainText('Пожертвовать', { ignoreCase: true })
  })

  test('страница расписания открывается', async ({ page }) => {
    await page.goto('http://localhost:3000/ru/raspisanie')

    await expect(page.locator('h1').first()).toContainText('Расписание', { ignoreCase: true })
  })

  test('корень редиректит на локаль', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await expect(page).toHaveURL(/\/ru$/)
  })
})
