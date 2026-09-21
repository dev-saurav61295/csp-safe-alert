import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CspAlert } from '../../src/core/CspAlert';

describe('Inputs & Validation Pipeline', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    CspAlert.close();
  });

  it('renders text input, respects autoTrim, and captures value on confirm', async () => {
    const promise = CspAlert.fire({
      title: 'Enter username',
      input: 'text',
      inputValue: '  john_doe  ',
      inputAutoTrim: true,
    });

    const input = CspAlert.getInput() as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.type).toBe('text');

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.isConfirmed).toBe(true);
    expect(result.value).toBe('john_doe');
  });

  it('handles number input type with numerical conversion', async () => {
    const promise = CspAlert.fire({
      title: 'Enter age',
      input: 'number',
      inputValue: 25,
    });

    const input = CspAlert.getInput() as HTMLInputElement;
    expect(input.value).toBe('25');

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.value).toBe(25);
  });

  it('handles select input with options map', async () => {
    const promise = CspAlert.fire({
      title: 'Select color',
      input: 'select',
      inputOptions: {
        red: 'Red Color',
        blue: 'Blue Color',
      },
      inputValue: 'blue',
    });

    const select = CspAlert.getInput() as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    expect(select.value).toBe('blue');

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.value).toBe('blue');
  });

  it('handles checkbox input', async () => {
    const promise = CspAlert.fire({
      title: 'Terms of service',
      input: 'checkbox',
      inputValue: 1,
    });

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.value).toBe(1);
  });

  it('executes synchronous input validator and halts confirmation on error', async () => {
    const promise = CspAlert.fire({
      title: 'Validation test',
      input: 'text',
      inputValue: '',
      inputValidator: (val) => {
        if (!val) return 'Field cannot be empty!';
        return null;
      },
    });

    CspAlert.clickConfirm();
    await new Promise((r) => setTimeout(r, 50));

    const validationMsg = CspAlert.getValidationMessage();
    expect(validationMsg?.textContent).toBe('Field cannot be empty!');
    expect(validationMsg?.classList.contains('cspa-validation-message-visible')).toBe(true);

    // Now type valid text and re-confirm
    const input = CspAlert.getInput() as HTMLInputElement;
    input.value = 'Valid text';

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.isConfirmed).toBe(true);
    expect(result.value).toBe('Valid text');
  });

  it('handles select input with options provided as a Map', async () => {
    const map = new Map<string, string>([
      ['opt1', 'First Option'],
      ['opt2', 'Second Option'],
    ]);

    const promise = CspAlert.fire({
      title: 'Select from Map',
      input: 'select',
      inputOptions: map,
      inputValue: 'opt2',
    });

    const select = CspAlert.getInput() as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    expect(select.options.length).toBe(2);
    expect(select.value).toBe('opt2');

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.value).toBe('opt2');
  });

  it('handles radio input with options provided as a Map', async () => {
    const map = new Map<string, string>([
      ['red', 'Red Color'],
      ['blue', 'Blue Color'],
    ]);

    const promise = CspAlert.fire({
      title: 'Radio from Map',
      input: 'radio',
      inputOptions: map,
      inputValue: 'blue',
    });

    const radioGroup = CspAlert.getInput() as HTMLElement;
    const checked = radioGroup.querySelector<HTMLInputElement>('input[value="blue"]');
    expect(checked?.checked).toBe(true);

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.value).toBe('blue');
  });

  it('resolves Promise-based inputValue cleanly', async () => {
    const asyncValPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('async_resolved_username'), 30);
    });

    const promise = CspAlert.fire({
      title: 'Async initial value',
      input: 'text',
      inputValue: asyncValPromise,
    });

    await new Promise((r) => setTimeout(r, 50));
    const input = CspAlert.getInput() as HTMLInputElement;
    expect(input.value).toBe('async_resolved_username');

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.value).toBe('async_resolved_username');
  });

  it('safely handles rejected Promise-based inputValue without unhandled rejection', async () => {
    const rejectedPromise = Promise.reject(new Error('Fetch failed'));

    const promise = CspAlert.fire({
      title: 'Rejected initial value',
      input: 'text',
      inputValue: rejectedPromise,
    });

    await new Promise((r) => setTimeout(r, 30));
    const input = CspAlert.getInput() as HTMLInputElement;
    expect(input.value).toBe('');

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.isConfirmed).toBe(true);
  });

  it('safely handles late resolution of Promise-based inputValue after closure', async () => {
    let resolveLater: (v: string) => void;
    const slowPromise = new Promise<string>((resolve) => {
      resolveLater = resolve;
    });

    const promise = CspAlert.fire({
      title: 'Late resolved initial value',
      input: 'text',
      inputValue: slowPromise,
    });

    // Close dialog before slow promise resolves
    CspAlert.close();
    await promise;

    // Resolve slow promise after dialog is destroyed
    expect(() => {
      resolveLater!('late_value');
    }).not.toThrow();

    await new Promise((r) => setTimeout(r, 20));
  });

  it('executes asynchronous beforeConfirm hook with loader and data transformation', async () => {
    const promise = CspAlert.fire({
      title: 'Async test',
      input: 'text',
      inputValue: 'abc',
      beforeConfirm: async (val) => {
        await new Promise((r) => setTimeout(r, 20));
        return `TRANSFORMED_${val}`;
      },
    });

    CspAlert.clickConfirm();
    expect(CspAlert.isLoading()).toBe(true);

    const result = await promise;
    expect(result.isConfirmed).toBe(true);
    expect(result.value).toBe('TRANSFORMED_abc');
  });
});

