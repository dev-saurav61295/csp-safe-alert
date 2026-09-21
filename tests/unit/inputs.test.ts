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
