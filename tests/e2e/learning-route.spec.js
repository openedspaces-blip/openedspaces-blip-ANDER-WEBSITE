const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('home and learning route render without browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('body')).toContainText('ANDERGO');
  await page.locator('a[href="#learn"]:visible').first().click();
  await expect(page.locator('#pathStartLearningBtn')).toBeVisible();
  await page.locator('#pathStartLearningBtn').click();
  await expect(page).toHaveURL(/#learn/);
  await expect(page.locator('#learning-path')).toBeVisible();
  expect(errors).toEqual([]);
});

test('primary navigation has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/#learn');
  await expect(page.locator('#learning-path')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = results.violations.filter(({ impact }) =>
    ['serious', 'critical'].includes(impact)
  );
  expect(blocking).toEqual([]);
});

test('mobile route remains usable without horizontal overflow', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile-only layout assertion');
  await page.goto('/#learn');
  await expect(page.locator('#learning-path')).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('translator predictive dictionary is loaded only when needed', async ({ page }) => {
  const predictiveRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('translator-predictive.js')) predictiveRequests.push(request.url());
  });
  await page.goto('/');
  expect(predictiveRequests).toHaveLength(0);
  await page.goto('/#translator');
  await expect(page.locator('#translator')).toBeVisible();
  await expect.poll(() => predictiveRequests.length).toBe(1);
});
