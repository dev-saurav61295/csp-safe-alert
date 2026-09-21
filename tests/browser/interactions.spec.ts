import { test, expect } from '@playwright/test';

test.describe('Browser User Interactions & Focus Management', () => {
  test('traps focus within modal dialog and navigates with Tab', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');
    await page.click('#btn-confirm-dialog');
    await expect(page.locator('.cspa-popup')).toBeVisible();

    // focusCancel: true was set, so Cancel button should have initial focus
    await expect(page.locator('.cspa-btn-secondary')).toBeFocused();

    // Press Tab to cycle through focusables
    await page.keyboard.press('Tab');
    await expect(page.locator('.cspa-btn-primary')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('.cspa-btn-danger')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('.cspa-btn-secondary')).toBeFocused(); // Wrapped back to Cancel

    // Press Shift+Tab to cycle backwards
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('.cspa-btn-danger')).toBeFocused();

    // Dismiss with Escape key
    await page.keyboard.press('Escape');
    await expect(page.locator('.cspa-popup')).not.toBeVisible();
    await expect(page.locator('#result-output')).toContainText('dismissed=true');
  });

  test('dismisses modal on backdrop click when allowOutsideClick is enabled', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');
    await page.click('#btn-basic-alert');
    await expect(page.locator('.cspa-popup')).toBeVisible();

    // Click outside popup (on container backdrop at position 10, 10)
    await page.mouse.click(10, 10);
    await expect(page.locator('.cspa-popup')).not.toBeVisible();
    await expect(page.locator('#result-output')).toHaveText('Basic Alert: dismissed');
  });

  test('handles async beforeConfirm action with loading state', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');
    await page.click('#btn-async-loader');
    await expect(page.locator('.cspa-popup')).toBeVisible();

    await page.click('.cspa-btn-primary');
    // Verify loader is displayed and confirm button is disabled during async work
    await expect(page.locator('.cspa-loader')).toBeVisible();
    await expect(page.locator('.cspa-btn-primary')).toBeDisabled();

    // Wait for completion
    await expect(page.locator('.cspa-popup')).not.toBeVisible();
    await expect(page.locator('#result-output')).toContainText('TX-12345');
  });
});
