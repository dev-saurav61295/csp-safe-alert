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

  test('traps focus inside custom nested target and restores focus upon dismissal', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');
    await page.focus('#btn-nested-target');
    await page.keyboard.press('Enter');

    const nestedPopup = page.locator('#nested-modal-container .cspa-popup');

    await expect(nestedPopup).toBeVisible();

    // Confirm button inside nested popup should receive focus
    await expect(nestedPopup.locator('.cspa-btn-primary')).toBeFocused();

    // Tab to Cancel button
    await page.keyboard.press('Tab');
    await expect(nestedPopup.locator('.cspa-btn-secondary')).toBeFocused();

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(nestedPopup).not.toBeVisible();

    // Focus restored to trigger button
    await expect(page.locator('#btn-nested-target')).toBeFocused();
  });

  test('handles transaction error retry scenario with visible message and re-enabling', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');
    await page.click('#btn-tx-error-retry');
    await expect(page.locator('.cspa-popup')).toBeVisible();

    // 1st attempt: fails
    await page.click('.cspa-btn-primary');
    await expect(page.locator('.cspa-validation-message-visible')).toBeVisible();
    await expect(page.locator('.cspa-validation-message-visible')).toHaveText('Connection timeout. Please retry.');
    await expect(page.locator('.cspa-btn-primary')).not.toBeDisabled();

    // 2nd attempt: succeeds
    await page.click('.cspa-btn-primary');
    await expect(page.locator('.cspa-popup')).not.toBeVisible();
    await expect(page.locator('#result-output')).toContainText('TXN-7788');
  });

  test('asserts explicit light, explicit dark, and automatic theme rendering under light and dark OS preferences', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');

    // 1. Explicit light theme under OS Dark preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.click('#btn-light-theme');
    const lightPopup = page.locator('.cspa-popup');
    await expect(lightPopup).toBeVisible();
    const lightBgUnderDarkOS = await lightPopup.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(lightBgUnderDarkOS).toBe('rgb(255, 255, 255)');
    await page.click('.cspa-btn-primary');
    await expect(lightPopup).not.toBeVisible();

    // 2. Explicit dark theme under OS Light preference
    await page.emulateMedia({ colorScheme: 'light' });
    await page.click('#btn-dark-theme');
    const darkPopup = page.locator('.cspa-popup');
    await expect(darkPopup).toBeVisible();
    const darkBgUnderLightOS = await darkPopup.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(darkBgUnderLightOS).toBe('rgb(30, 41, 59)');
    await page.click('.cspa-btn-primary');
    await expect(darkPopup).not.toBeVisible();

    // 3. Automatic theme under OS Light preference
    await page.emulateMedia({ colorScheme: 'light' });
    await page.click('#btn-basic-alert');
    const autoLightPopup = page.locator('.cspa-popup');
    await expect(autoLightPopup).toBeVisible();
    const autoLightBg = await autoLightPopup.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(autoLightBg).toBe('rgb(255, 255, 255)');
    await page.click('.cspa-btn-primary');
    await expect(autoLightPopup).not.toBeVisible();

    // 4. Automatic theme under OS Dark preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.click('#btn-basic-alert');
    const autoDarkPopup = page.locator('.cspa-popup');
    await expect(autoDarkPopup).toBeVisible();
    const autoDarkBg = await autoDarkPopup.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(autoDarkBg).toBe('rgb(30, 41, 59)');
    await page.click('.cspa-btn-primary');
    await expect(autoDarkPopup).not.toBeVisible();
  });
});

