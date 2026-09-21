import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CspAlert } from '../../src/core/CspAlert';

describe('Concurrency & Operation Locking', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    CspAlert.close();
  });

  it('invokes beforeConfirm only once during rapid repeated confirmations with async inputValidator', async () => {
    let validatorCalls = 0;
    let beforeConfirmCalls = 0;

    const alertPromise = CspAlert.fire({
      title: 'Async validation & confirmation',
      input: 'text',
      inputValue: 'test',
      inputValidator: async () => {
        validatorCalls++;
        await new Promise((r) => setTimeout(r, 60));
        return null; // valid
      },
      beforeConfirm: async () => {
        beforeConfirmCalls++;
        await new Promise((r) => setTimeout(r, 60));
        return 'success_val';
      },
    });

    // Rapidly trigger confirm 5 times while validator is running
    CspAlert.clickConfirm();
    CspAlert.clickConfirm();
    CspAlert.clickConfirm();
    CspAlert.clickConfirm();
    CspAlert.clickConfirm();

    const result = await alertPromise;
    expect(result.isConfirmed).toBe(true);
    expect(result.value).toBe('success_val');
    expect(validatorCalls).toBe(1);
    expect(beforeConfirmCalls).toBe(1);
  });

  it('releases operation lock after validation failure allowing subsequent successful retry', async () => {
    let attempts = 0;

    const alertPromise = CspAlert.fire({
      title: 'Retry test',
      input: 'text',
      inputValue: 'invalid',
      inputValidator: async (val) => {
        attempts++;
        if (val === 'invalid') {
          return 'Please enter a valid value';
        }
        return null;
      },
    });

    // 1st attempt: fails validation
    CspAlert.clickConfirm();
    await new Promise((r) => setTimeout(r, 30));

    const valMsg = CspAlert.getValidationMessage();
    expect(valMsg?.textContent).toBe('Please enter a valid value');
    expect(valMsg?.classList.contains('cspa-validation-message-visible')).toBe(true);
    expect(attempts).toBe(1);

    // Update input value
    const input = CspAlert.getInput() as HTMLInputElement;
    input.value = 'valid';

    // 2nd attempt: succeeds
    CspAlert.clickConfirm();
    const result = await alertPromise;
    expect(result.isConfirmed).toBe(true);
    expect(result.value).toBe('valid');
    expect(attempts).toBe(2);
  });

  it('releases lock after beforeConfirm returns false or throws, allowing user retry', async () => {
    let beforeConfirmAttempts = 0;

    const alertPromise = CspAlert.fire({
      title: 'Server Error & Retry',
      beforeConfirm: async () => {
        beforeConfirmAttempts++;
        if (beforeConfirmAttempts === 1) {
          throw new Error('Network error 500');
        }
        return 'transaction_ok';
      },
    });

    // 1st attempt: throws error
    CspAlert.clickConfirm();
    await new Promise((r) => setTimeout(r, 30));

    expect(CspAlert.isLoading()).toBe(false);
    const valMsg = CspAlert.getValidationMessage();
    expect(valMsg?.textContent).toBe('Network error 500');
    expect(valMsg?.classList.contains('cspa-validation-message-visible')).toBe(true);

    // 2nd attempt: succeeds
    CspAlert.clickConfirm();
    const result = await alertPromise;
    expect(result.isConfirmed).toBe(true);
    expect(result.value).toBe('transaction_ok');
    expect(beforeConfirmAttempts).toBe(2);
  });

  it('blocks competing deny action while confirm action is pending in-flight', async () => {
    let confirmRan = false;
    let denyRan = false;

    const alertPromise = CspAlert.fire({
      title: 'Competing Actions',
      showDenyButton: true,
      beforeConfirm: async () => {
        confirmRan = true;
        await new Promise((r) => setTimeout(r, 80));
        return 'confirmed';
      },
      beforeDeny: async () => {
        denyRan = true;
        return 'denied';
      },
    });

    CspAlert.clickConfirm();
    // Immediately attempt to deny while confirm is in flight
    CspAlert.clickDeny();

    const result = await alertPromise;
    expect(result.isConfirmed).toBe(true);
    expect(result.isDenied).toBe(false);
    expect(confirmRan).toBe(true);
    expect(denyRan).toBe(false);
  });

  it('ignores stale async results when dialog is dismissed during pending async operation', async () => {
    let beforeConfirmFinished = false;

    const alertPromise = CspAlert.fire({
      title: 'Dismiss during async',
      beforeConfirm: async () => {
        await new Promise((r) => setTimeout(r, 100));
        beforeConfirmFinished = true;
        return 'late_result';
      },
    });

    CspAlert.clickConfirm();
    await new Promise((r) => setTimeout(r, 20));

    // User dismisses dialog while beforeConfirm is pending
    CspAlert.close();

    const result = await alertPromise;
    expect(result.isDismissed).toBe(true);
    expect(result.isConfirmed).toBe(false);
    expect(result.dismiss).toBe('close');

    // Wait for the background timer
    await new Promise((r) => setTimeout(r, 120));
    expect(beforeConfirmFinished).toBe(true);
  });
});
