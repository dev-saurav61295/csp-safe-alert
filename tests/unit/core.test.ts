import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CspAlert } from '../../src/core/CspAlert';
import { safeMerge, isSafeUrl, isAllowedAttribute } from '../../src/utils/security';

describe('Security & Options Merge', () => {
  it('protects against prototype pollution in safeMerge', () => {
    const maliciousPayload = JSON.parse('{"__proto__": {"polluted": true}}');
    const target = {};
    safeMerge(target, maliciousPayload);
    expect((target as any).polluted).toBeUndefined();
    expect((Object.prototype as any).polluted).toBeUndefined();
  });

  it('validates safe URLs correctly', () => {
    expect(isSafeUrl('https://example.com/pic.png')).toBe(true);
    expect(isSafeUrl('http://example.com/pic.png')).toBe(true);
    expect(isSafeUrl('/images/pic.png')).toBe(true);
    expect(isSafeUrl('./pic.png')).toBe(true);
    expect(isSafeUrl('data:image/png;base64,abc')).toBe(true);

    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isSafeUrl('data:text/html;base64,abc')).toBe(false);
  });

  it('enforces input attribute allowlist', () => {
    expect(isAllowedAttribute('placeholder')).toBe(true);
    expect(isAllowedAttribute('maxlength')).toBe(true);
    expect(isAllowedAttribute('required')).toBe(true);
    expect(isAllowedAttribute('data-test-id')).toBe(true);
    expect(isAllowedAttribute('aria-label')).toBe(true);

    expect(isAllowedAttribute('onclick')).toBe(false);
    expect(isAllowedAttribute('onerror')).toBe(false);
    expect(isAllowedAttribute('style')).toBe(false);
    expect(isAllowedAttribute('srcdoc')).toBe(false);
  });
});

describe('CspAlert Core Lifecycle & Results', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    CspAlert.close();
  });

  it('opens dialog with title and text safely', async () => {
    const promise = CspAlert.fire({
      title: 'Hello World',
      text: 'This is a test message',
    });

    expect(CspAlert.isVisible()).toBe(true);
    const popup = CspAlert.getPopup();
    expect(popup).not.toBeNull();

    const title = CspAlert.getTitle();
    expect(title?.textContent).toBe('Hello World');

    const content = CspAlert.getHtmlContainer();
    expect(content?.textContent).toBe('This is a test message');

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.isConfirmed).toBe(true);
    expect(result.isDismissed).toBe(false);
  });

  it('handles deny action', async () => {
    const promise = CspAlert.fire({
      title: 'Confirm deletion?',
      showDenyButton: true,
      denyButtonText: 'Do not delete',
    });

    CspAlert.clickDeny();
    const result = await promise;
    expect(result.isConfirmed).toBe(false);
    expect(result.isDenied).toBe(true);
    expect(result.isDismissed).toBe(false);
  });

  it('handles cancel action', async () => {
    const promise = CspAlert.fire({
      title: 'Action prompt',
      showCancelButton: true,
    });

    CspAlert.clickCancel();
    const result = await promise;
    expect(result.isConfirmed).toBe(false);
    expect(result.isDenied).toBe(false);
    expect(result.isDismissed).toBe(true);
    expect(result.dismiss).toBe('cancel');
  });

  it('supports mixin presets', async () => {
    const ToastAlert = CspAlert.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
    });

    const promise = ToastAlert.fire({
      title: 'Saved successfully',
      icon: 'success',
    });

    expect(CspAlert.isVisible()).toBe(true);
    const popup = CspAlert.getPopup();
    expect(popup?.classList.contains('cspa-toast-popup')).toBe(true);

    CspAlert.close();
    await promise;
  });

  it('executes sequential queue', async () => {
    const steps = [
      { title: 'Step 1' },
      { title: 'Step 2' },
    ];

    const queuePromise = CspAlert.queue(steps);

    // Confirm step 1
    await new Promise((r) => setTimeout(r, 50));
    CspAlert.clickConfirm();

    // Confirm step 2
    await new Promise((r) => setTimeout(r, 250));
    CspAlert.clickConfirm();

    const results = await queuePromise;
    expect(results.length).toBe(2);
    expect(results[0]?.isConfirmed).toBe(true);
    expect(results[1]?.isConfirmed).toBe(true);
  });
});
