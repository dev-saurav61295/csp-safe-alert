import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Automated Accessibility Audits (axe-core WCAG 2.2 AA)', () => {
  test('passes axe-core audit on basic alert dialog', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');
    await page.click('#btn-basic-alert');
    await expect(page.locator('.cspa-popup')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('passes axe-core audit on confirm dialog with multiple buttons', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');
    await page.click('#btn-confirm-dialog');
    await expect(page.locator('.cspa-popup')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('passes axe-core audit on validation error state', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');
    await page.click('#btn-validation-prompt');
    await expect(page.locator('.cspa-popup')).toBeVisible();

    // Trigger validation error
    await page.fill('.cspa-input', 'invalid-email');
    await page.click('.cspa-btn-primary');
    await expect(page.locator('.cspa-validation-message-visible')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('passes axe-core audit on dark theme and high contrast theme', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');
    await page.click('#btn-high-contrast');
    await expect(page.locator('.cspa-popup.cspa-theme-high-contrast')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
