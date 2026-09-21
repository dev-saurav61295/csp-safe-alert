import { test, expect } from '@playwright/test';

test.describe('Release 1.1.0 gap regressions', () => {
  test('browser IIFE exposes mixin and queue on the same CspAlert namespace', async ({ page }) => {
    await page.goto('/tests/fixtures/index.html');

    const result = await page.evaluate(async () => {
      const api = (window as any).CspAlert;
      const mixin = api.mixin({ toast: true, showConfirmButton: true });
      const mixinPromise = mixin.fire({ title: 'Mixin works' });
      api.getConfirmButton().click();
      const mixinResult = await mixinPromise;

      const queuePromise = api.queue([
        { title: 'Queue one' },
        { title: 'Queue two' },
      ]);
      api.getConfirmButton().click();
      await new Promise((resolve) => setTimeout(resolve, 250));
      api.getConfirmButton().click();
      const queueResult = await queuePromise;

      return {
        hasFire: typeof api.fire === 'function',
        hasMixin: typeof api.mixin === 'function',
        hasQueue: typeof api.queue === 'function',
        mixinConfirmed: mixinResult.isConfirmed,
        queueConfirmed: queueResult.every((item: any) => item.isConfirmed),
        sharedState: api.isVisible(),
      };
    });

    expect(result).toEqual({
      hasFire: true,
      hasMixin: true,
      hasQueue: true,
      mixinConfirmed: true,
      queueConfirmed: true,
      sharedState: false,
    });
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
    expect(result.popupPadding).toBe('24px');
    expect(result.popupBackground).toBe('rgb(255, 255, 255)');
    expect(result.iconColor).not.toBe('rgb(4, 5, 6)');
    expect(result.htmlClass).toBe(true);
    expect(result.bodyClass).toBe(true);
    expect(result.cleanedUp).toBe(true);
  });
});
