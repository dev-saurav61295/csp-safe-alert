import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CspAlert } from '../../src/core/CspAlert';

describe('Visible Errors for Dialogs without Inputs', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    CspAlert.close();
  });

  it('displays visible validation error message in confirmation dialogs without built-in inputs', async () => {
    const promise = CspAlert.fire({
      title: 'Confirm payment of $50',
      text: 'Are you sure you want to proceed?',
      showCancelButton: true,
      confirmButtonText: 'Pay Now',
      beforeConfirm: async () => {
        throw new Error('Insufficient funds in account');
      },
    });

    CspAlert.clickConfirm();
    await new Promise((r) => setTimeout(r, 20));

    const validationMsg = CspAlert.getValidationMessage();
    expect(validationMsg).not.toBeNull();
    expect(validationMsg?.textContent).toBe('Insufficient funds in account');
    expect(validationMsg?.classList.contains('cspa-validation-message-visible')).toBe(true);

    CspAlert.clickCancel();
    const result = await promise;
    expect(result.isDismissed).toBe(true);
  });

  it('implements transaction-confirmation scenario with initial failure and successful retry', async () => {
    let networkAttempts = 0;

    const promise = CspAlert.fire({
      title: 'Transfer $100',
      showCancelButton: true,
      confirmButtonText: 'Transfer',
      beforeConfirm: async () => {
        networkAttempts++;
        if (networkAttempts === 1) {
          throw new Error('Gateway Timeout 504. Please retry.');
        }
        return { transactionId: 'TX-998877', status: 'COMPLETED' };
      },
    });

    // 1st attempt: fails with error
    CspAlert.clickConfirm();
    await new Promise((r) => setTimeout(r, 20));

    let validationMsg = CspAlert.getValidationMessage();
    expect(validationMsg?.textContent).toBe('Gateway Timeout 504. Please retry.');
    expect(validationMsg?.classList.contains('cspa-validation-message-visible')).toBe(true);
    expect(CspAlert.isLoading()).toBe(false);

    // 2nd attempt: user retries and succeeds
    CspAlert.clickConfirm();
    const result = await promise;

    expect(result.isConfirmed).toBe(true);
    expect(result.value).toEqual({ transactionId: 'TX-998877', status: 'COMPLETED' });
    expect(networkAttempts).toBe(2);
  });
});
