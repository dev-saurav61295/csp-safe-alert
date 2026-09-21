import { describe, it, expect } from 'vitest';
import { safeMerge, isPlainObject, isSafeUrl, isAllowedAttribute } from '../../src/utils/security';
import { CspAlert } from '../../src/core/CspAlert';

describe('safeMerge and Object Utilities', () => {
  it('correctly identifies plain objects vs non-plain objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1, b: 'test' })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);

    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(42)).toBe(false);
    expect(isPlainObject('string')).toBe(false);
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(new Set())).toBe(false);
    expect(isPlainObject(Promise.resolve())).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(/abc/)).toBe(false);
    expect(isPlainObject(() => {})).toBe(false);
    if (typeof document !== 'undefined') {
      expect(isPlainObject(document.createElement('div'))).toBe(false);
      expect(isPlainObject(document.createDocumentFragment())).toBe(false);
    }
  });

  it('preserves Map instances during merge without converting to empty object', () => {
    const inputOptionsMap = new Map<string, string>([
      ['1', 'Option One'],
      ['2', 'Option Two'],
    ]);

    const source = {
      title: 'Select item',
      inputOptions: inputOptionsMap,
    };

    const target: any = {};
    safeMerge(target, source);

    expect(target.inputOptions).toBeInstanceOf(Map);
    expect(target.inputOptions).toBe(inputOptionsMap);
    expect(target.inputOptions.get('1')).toBe('Option One');
    expect(target.inputOptions.size).toBe(2);
  });

  it('preserves Promise instances during merge without converting to empty object', () => {
    const valuePromise = Promise.resolve('async_default_value');

    const source = {
      title: 'Enter text',
      inputValue: valuePromise,
    };

    const target: any = {};
    safeMerge(target, source);

    expect(target.inputValue).toBeInstanceOf(Promise);
    expect(target.inputValue).toBe(valuePromise);
  });

  it('preserves DOM Elements and DocumentFragments', () => {
    const div = document.createElement('div');
    div.textContent = 'Custom DOM content';
    const fragment = document.createDocumentFragment();

    const source = {
      html: div,
      footer: fragment,
    };

    const target: any = {};
    safeMerge(target, source);

    expect(target.html).toBe(div);
    expect(target.footer).toBe(fragment);
  });

  it('preserves callbacks and arrays', () => {
    const beforeConfirmFn = async () => 'result';
    const arr = [{ value: '1', text: 'One' }, { value: '2', text: 'Two' }];

    const source = {
      beforeConfirm: beforeConfirmFn,
      inputOptions: arr,
    };

    const target: any = {};
    safeMerge(target, source);

    expect(target.beforeConfirm).toBe(beforeConfirmFn);
    expect(target.inputOptions).toBe(arr);
    expect(target.inputOptions[0].text).toBe('One');
  });

  it('deep merges nested plain objects like customClass without mutating sources', () => {
    const preset = {
      customClass: {
        popup: 'preset-popup',
        confirmButton: 'preset-confirm',
      },
    };

    const userOptions = {
      customClass: {
        popup: 'user-popup',
        cancelButton: 'user-cancel',
      },
    };

    const target: any = {};
    safeMerge(target, preset, userOptions);

    expect(target.customClass.popup).toBe('user-popup');
    expect(target.customClass.confirmButton).toBe('preset-confirm');
    expect(target.customClass.cancelButton).toBe('user-cancel');

    // Verify preset was not mutated
    expect(preset.customClass.popup).toBe('preset-popup');
    expect((preset.customClass as any).cancelButton).toBeUndefined();
  });

  it('strictly protects against prototype pollution via __proto__, constructor, prototype', () => {
    const malicious = JSON.parse('{"__proto__": {"polluted": "yes"}, "constructor": {"polluted": "yes"}}');
    const target: any = {};
    safeMerge(target, malicious);

    expect(target.polluted).toBeUndefined();
    expect((Object.prototype as any).polluted).toBeUndefined();
    expect((target as any).__proto__.polluted).toBeUndefined();
  });

  it('supports independent mixin invocations without cross-contamination', () => {
    const ModalA = CspAlert.mixin({
      customClass: { popup: 'modal-a-popup' },
      showCancelButton: true,
    });

    const ModalB = CspAlert.mixin({
      customClass: { popup: 'modal-b-popup' },
      showDenyButton: true,
    });

    expect(ModalA).not.toBe(ModalB);
  });
});
