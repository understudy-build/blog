import { expect, test } from '@playwright/test'

test('cards prefetch and support back and forward navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('searchbox')).toBeVisible()
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  const prefetched = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/blog/2022/the-tree' &&
      response.request().resourceType() !== 'document',
  )
  await page.getByRole('link', { name: 'The Tree', exact: true }).hover()
  expect((await prefetched).ok()).toBe(true)
  await page.getByRole('link', { name: 'The Tree', exact: true }).click()
  await expect(page).toHaveURL(/\/blog\/2022\/the-tree$/)
  await expect(page).toHaveTitle('The Tree | Nicolas Toulemont')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://blog.understudy.build/blog/2022/the-tree',
  )
  await expect(page.locator('html')).toHaveClass(/dark/)

  await page.getByRole('link', { name: 'Get method', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Get method', exact: true })).toHaveClass(
    /is-active/,
  )
  await page.getByRole('link', { name: 'Nicolas Toulemont', exact: true }).click()
  await page.getByRole('searchbox').fill('graphql')
  await expect(
    page.getByRole('link', { name: 'GraphQL Typeguards', exact: true }),
  ).toBeVisible()

  await page.goBack()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('The Tree')
  await page.goForward()
  await expect(page.getByRole('searchbox')).toBeVisible()
})

test('legacy locale URLs redirect permanently', async ({ request }) => {
  for (const [legacy, current] of [
    ['/blog/en/2022/the-tree', '/blog/2022/the-tree'],
    [
      '/blog/fr/2021/retraining-web-development-online',
      '/fr/blog/2021/retraining-web-development-online',
    ],
  ]) {
    const response = await request.get(legacy, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(new URL(response.headers().location, 'http://x').pathname).toBe(current)
  }
})
