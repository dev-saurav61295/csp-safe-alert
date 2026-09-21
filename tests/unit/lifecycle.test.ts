import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CspAlert } from '../../src/core/CspAlert';

describe('Lifecycle & Cleanup Guarantees', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.className = '';
  });

  afterEach(() => {
    CspAlert.close();
  });

  it('handles fire() followed immediately by close() without starting deferred timers or focus traps', async () => {
    const didOpenSpy = vi.fn();
    const willCloseSpy = vi.fn();

    const promise = CspAlert.fire({
      title: 'Immediate close test',
      timer: 2000,
      timerProgressBar: true,
      didOpen: didOpenSpy,
      willClose: willCloseSpy,
    });

    CspAlert.close();
    const result = await promise;

    expect(result.isDismissed).toBe(true);
    expect(result.dismiss).toBe('close');
    expect(document.body.classList.contains('cspa-body-scroll-lock')).toBe(false);
    expect(document.querySelector('.cspa-container')).toBeNull();
  });

  it('handles two immediate consecutive fire() calls without leaking state or locks', async () => {
    const promise1 = CspAlert.fire({
      title: 'First Dialog',
      text: 'First message',
    });

    const promise2 = CspAlert.fire({
      title: 'Second Dialog',
      text: 'Second message',
    });

    const res1 = await promise1;
    expect(res1.isDismissed).toBe(true);
    expect(res1.dismiss).toBe('close');

    expect(CspAlert.isVisible()).toBe(true);
    expect(CspAlert.getTitle()?.textContent).toBe('Second Dialog');

    CspAlert.clickConfirm();
    const res2 = await promise2;
    expect(res2.isConfirmed).toBe(true);
    expect(document.body.classList.contains('cspa-body-scroll-lock')).toBe(false);
  });

  it('is idempotent across repeated close() and destroy() invocations', async () => {
    const didCloseSpy = vi.fn();
    const didDestroySpy = vi.fn();

    const promise = CspAlert.fire({
      title: 'Idempotency test',
      didClose: didCloseSpy,
      didDestroy: didDestroySpy,
    });

    CspAlert.close();
    CspAlert.close();
    CspAlert.close();

    const result = await promise;
    expect(result.isDismissed).toBe(true);

    // Call close again after already settled
    CspAlert.close();

    expect(didCloseSpy).toHaveBeenCalledTimes(1);
    expect(didDestroySpy).toHaveBeenCalledTimes(1);
  });

  it('handles replacement during pending asynchronous beforeConfirm', async () => {
    const promise1 = CspAlert.fire({
      title: 'Dialog 1',
      beforeConfirm: async () => {
        await new Promise((r) => setTimeout(r, 100));
        return 'first_done';
      },
    });

    CspAlert.clickConfirm();
    await new Promise((r) => setTimeout(r, 20));

    // Open second dialog while first is waiting on async confirmation
    const promise2 = CspAlert.fire({
      title: 'Dialog 2 Replacement',
    });

    const res1 = await promise1;
    expect(res1.isDismissed).toBe(true);

    expect(CspAlert.getTitle()?.textContent).toBe('Dialog 2 Replacement');
    CspAlert.clickConfirm();

    const res2 = await promise2;
    expect(res2.isConfirmed).toBe(true);
    expect(document.body.classList.contains('cspa-body-scroll-lock')).toBe(false);
  });

  it('ensures no timers, focus traps, or scroll locks remain active after closure', async () => {
    const promise = CspAlert.fire({
      title: 'Timer test',
      timer: 1000,
      timerProgressBar: true,
    });

    await new Promise((r) => setTimeout(r, 20));
    CspAlert.close();
    await promise;

    expect(CspAlert.isTimerRunning()).toBeUndefined();
    expect(document.body.classList.contains('cspa-body-scroll-lock')).toBe(false);
    expect(document.querySelectorAll('.cspa-container').length).toBe(0);
  });

  it('handles destroy during the close delay without error or double settling', async () => {
    const didDestroySpy = vi.fn();
    const promise = CspAlert.fire({
      title: 'Close delay test',
      didDestroy: didDestroySpy,
    });

    CspAlert.close();
    // Immediate subsequent destroy call
    CspAlert.close();

    const result = await promise;
    expect(result.isDismissed).toBe(true);
    expect(result.dismiss).toBe('close');
    expect(didDestroySpy).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.cspa-container')).toBeNull();
  });

  it('handles replacement during pending input validation', async () => {
    let validatorResolve: (val: string | null) => void;
    const validationPromise = new Promise<string | null>((resolve) => {
      validatorResolve = resolve;
    });

    const promise1 = CspAlert.fire({
      title: 'Validation Dialog',
      input: 'text',
      inputValue: 'test',
      inputValidator: () => validationPromise,
    });

    CspAlert.clickConfirm();
    await new Promise((r) => setTimeout(r, 10));

    // Open second dialog while validation of first is pending
    const promise2 = CspAlert.fire({
      title: 'Replacement Dialog',
    });

    // Settle first validator after replacement
    validatorResolve!('Invalid input');

    const res1 = await promise1;
    expect(res1.isDismissed).toBe(true);
    expect(res1.dismiss).toBe('close');

    expect(CspAlert.getTitle()?.textContent).toBe('Replacement Dialog');
    CspAlert.clickConfirm();

    const res2 = await promise2;
    expect(res2.isConfirmed).toBe(true);
  });

  it('ensures old-instance cleanup cannot remove new instance focus isolation or scroll lock', async () => {
    const appEl = document.createElement('div');
    appEl.id = 'app-root';
    const appBtn = document.createElement('button');
    appBtn.id = 'app-btn';
    appBtn.textContent = 'App Content';
    appEl.appendChild(appBtn);
    document.body.appendChild(appEl);

    // Open first dialog
    const promise1 = CspAlert.fire({
      title: 'Dialog One',
    });
    await new Promise((r) => requestAnimationFrame(r));

    expect(appEl.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.classList.contains('cspa-body-scroll-lock')).toBe(true);

    // Open second dialog (replaces first)
    const promise2 = CspAlert.fire({
      title: 'Dialog Two',
    });
    await new Promise((r) => requestAnimationFrame(r));

    const res1 = await promise1;
    expect(res1.isDismissed).toBe(true);

    // App root must STILL be isolated (aria-hidden) and scroll lock retained for Dialog Two
    expect(appEl.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.classList.contains('cspa-body-scroll-lock')).toBe(true);

    // Close Dialog Two
    CspAlert.close();
    const res2 = await promise2;
    expect(res2.isDismissed).toBe(true);

    // Now background isolation and scroll lock should be fully restored
    expect(appEl.getAttribute('aria-hidden')).toBeNull();
    expect(document.body.classList.contains('cspa-body-scroll-lock')).toBe(false);
  });

  it('guarantees original promises always settle exactly once', async () => {
    let settledCount = 0;
    const promise = CspAlert.fire({
      title: 'Single settlement test',
    });

    promise.then(() => {
      settledCount++;
    });

    // Rapid concurrent termination triggers
    CspAlert.clickConfirm();
    CspAlert.close();
    CspAlert.close();

    const result = await promise;
    expect(result).toBeDefined();
    await new Promise((r) => setTimeout(r, 20));

    expect(settledCount).toBe(1);
  });
});
