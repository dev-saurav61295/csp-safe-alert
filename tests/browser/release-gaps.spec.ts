import { test, expect } from '@playwright/test';

test.describe('Release 1.1.0 gap regressions', () => {
  test('browser IIFE exposes mixin and queue on the same CspAlert namespace', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');

    const namespace = await page.evaluate(() => {
      const api = (window as any).CspAlert;
      const mixin = api.mixin({ toast: true, showConfirmButton: true });
      (window as any).__mixinPromise = mixin.fire({ title: 'Mixin works' });
      return {
        hasFire: typeof api.fire === 'function',
        hasMixin: typeof api.mixin === 'function',
        hasQueue: typeof api.queue === 'function',
      };
    });

    expect(namespace).toEqual({ hasFire: true, hasMixin: true, hasQueue: true });

    await page.locator('.cspa-btn-primary').click();
    const mixinResult = await page.evaluate(() => (window as any).__mixinPromise);
    expect(mixinResult.isConfirmed).toBe(true);

    await page.evaluate(() => {
      (window as any).__queuePromise = (window as any).CspAlert.queue([
        { title: 'Queue one' },
        { title: 'Queue two' },
      ]);
    });

    await page.waitForFunction(() => document.querySelector('.cspa-title')?.textContent === 'Queue one');
    await page.locator('.cspa-btn-primary').click();
    await page.waitForFunction(() => document.querySelector('.cspa-title')?.textContent === 'Queue two');
    await page.locator('.cspa-btn-primary').click();

    const queueResult = await page.evaluate(() => (window as any).__queuePromise);
    expect(queueResult.every((item: any) => item.isConfirmed)).toBe(true);
    expect(await page.evaluate(() => (window as any).CspAlert.isVisible())).toBe(false);
  });

  test('heightAuto is enforced through external CSS while deprecated arbitrary styling values are ignored', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');

    const result = await page.evaluate(async () => {
      const api = (window as any).CspAlert;
      const promise = api.fire({
        title: 'Styling contract',
        heightAuto: true,
        padding: '99px',
        background: 'rgb(1, 2, 3)',
        icon: 'info',
        iconColor: 'rgb(4, 5, 6)',
      });

      const popup = api.getPopup();
      const icon = api.getIcon();
      const popupStyle = popup?.getAttribute('style');
      const popupPadding = popup ? getComputedStyle(popup).padding : '';
      const popupBackground = popup ? getComputedStyle(popup).backgroundColor : '';
      const iconColor = icon ? getComputedStyle(icon).color : '';
      const htmlClass = document.documentElement.classList.contains('cspa-height-auto');
      const bodyClass = document.body.classList.contains('cspa-height-auto');

      api.clickConfirm();
      await promise;

      return {
        popupStyle,
        popupPadding,
        popupBackground,
        iconColor,
        htmlClass,
        bodyClass,
        cleanedUp: !document.documentElement.classList.contains('cspa-height-auto') &&
          !document.body.classList.contains('cspa-height-auto'),
      };
    });

    expect(result.popupStyle).toBeNull();
    expect(result.popupPadding).not.toBe('99px');
    expect(result.popupBackground).not.toBe('rgb(1, 2, 3)');
    expect(result.iconColor).not.toBe('rgb(4, 5, 6)');
    expect(result.htmlClass).toBe(true);
    expect(result.bodyClass).toBe(true);
    expect(result.cleanedUp).toBe(true);
  });
});
