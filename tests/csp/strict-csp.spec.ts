import { test, expect } from '@playwright/test';

test.describe('Strict Content Security Policy Verification', () => {
  test('executes alerts, toasts, inputs, and themes with ZERO CSP violations', async ({ page }) => {
    page.on('console', (msg) => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

    await page.goto('/tests/fixtures/index.html');

    // 1. Basic Alert
    await page.click('#btn-basic-alert');
    await expect(page.locator('.cspa-popup')).toBeVisible();
    await page.click('.cspa-btn-primary');
    await expect(page.locator('.cspa-popup')).not.toBeVisible();
    await expect(page.locator('#result-output')).toHaveText('Basic Alert: confirmed');

    // 2. Confirm Dialog with Deny and Cancel
    await page.click('#btn-confirm-dialog');
    await expect(page.locator('.cspa-popup')).toBeVisible();
    await page.click('.cspa-btn-danger'); // Deny button
    await expect(page.locator('.cspa-popup')).not.toBeVisible();
    await expect(page.locator('#result-output')).toContainText('denied=true');

    // 3. Input Prompt
    await page.click('#btn-input-prompt');
    await expect(page.locator('.cspa-input')).toBeVisible();
    await page.fill('.cspa-input', 'alice_smith');
    await page.click('.cspa-btn-primary');
    await expect(page.locator('.cspa-popup')).not.toBeVisible();
    await expect(page.locator('#result-output')).toHaveText('Input Prompt: value=alice_smith');

    // 4. Toast Notification
    await page.click('#btn-toast');
    await expect(page.locator('.cspa-toast-popup')).toBeVisible();
    await page.waitForTimeout(2200);
    await expect(page.locator('.cspa-toast-popup')).not.toBeVisible();

    // 5. Dark Theme
    await page.click('#btn-dark-theme');
    await expect(page.locator('.cspa-popup.cspa-theme-dark')).toBeVisible();
    await page.click('.cspa-btn-primary');
    await expect(page.locator('.cspa-popup')).not.toBeVisible();

    // 6. High Contrast Theme
    await page.click('#btn-high-contrast');
    await expect(page.locator('.cspa-popup.cspa-theme-high-contrast')).toBeVisible();
    await page.click('.cspa-btn-primary');
    await expect(page.locator('.cspa-popup')).not.toBeVisible();

    // Verify ZERO CSP violation events were captured
    const violations = await page.evaluate(() => (window as any).__cspViolations);
    expect(violations).toEqual([]);

    // Verify ZERO inline style attributes exist in the document
    const inlineStyleCount = await page.evaluate(() => {
      return document.querySelectorAll('[style]').length;
    });
    expect(inlineStyleCount).toBe(0);
  });

  test('negative control fixture detects and catches CSP violations', async ({ page }) => {
    await page.goto('/tests/fixtures/negative-control.html');
    await page.waitForTimeout(100);

    const violations = await page.evaluate(() => (window as any).__cspViolations);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].violatedDirective).toContain('style-src');
  });
});
