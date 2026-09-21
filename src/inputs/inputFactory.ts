/**
 * Input Factory Module
 * Handles all 13 standard input types with accessible labelling and validation error management.
 */

import { CspAlertInput, CspAlertOptions } from '../types';
import { createElement, addClasses, setAttributes, clearChildren } from '../utils/dom';

export interface RenderedInput {
  container: HTMLElement;
  inputElement: HTMLElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  getValue: () => any;
  setValue: (val: any) => void;
  focus: () => void;
  validationMessageEl: HTMLElement;
  showValidationMessage: (msg: string) => void;
  resetValidationMessage: () => void;
}

export function renderInput(options: CspAlertOptions, inputId: string, errorId: string): RenderedInput | null {
  const inputType: CspAlertInput | undefined = options.input;
  if (!inputType) return null;

  const container = createElement('div', 'cspa-input-container');
  const validationMessageEl = createElement('div', 'cspa-validation-message');
  validationMessageEl.id = errorId;
  validationMessageEl.setAttribute('aria-live', 'polite');

  if (options.customClass?.validationMessage) {
    addClasses(validationMessageEl, options.customClass.validationMessage);
  }

  // Optional Label
  let labelEl: HTMLElement | null = null;
  if (options.inputLabel) {
    labelEl = createElement('label', 'cspa-input-label', options.inputLabel);
    labelEl.setAttribute('for', inputId);
    if (options.customClass?.inputLabel) {
      addClasses(labelEl, options.customClass.inputLabel);
    }
    container.appendChild(labelEl);
  }

  let inputElement: HTMLElement;
  let getValue: () => any;
  let setValue: (val: any) => void;
  let focusInput: () => void;

  switch (inputType) {
    case 'textarea': {
      const textarea = createElement('textarea', 'cspa-textarea') as HTMLTextAreaElement;
      textarea.id = inputId;
      if (options.inputPlaceholder) textarea.placeholder = options.inputPlaceholder;
      if (options.inputAttributes) setAttributes(textarea, options.inputAttributes);
      if (options.customClass?.input) addClasses(textarea, options.customClass.input);

      inputElement = textarea;
      getValue = () => (options.inputAutoTrim !== false ? textarea.value.trim() : textarea.value);
      setValue = (v) => {
        textarea.value = v !== undefined && v !== null ? String(v) : '';
      };
      focusInput = () => textarea.focus();
      container.appendChild(textarea);
      break;
    }

    case 'select': {
      const select = createElement('select', 'cspa-select') as HTMLSelectElement;
      select.id = inputId;
      if (options.inputPlaceholder) {
        const placeholderOption = createElement('option', '', options.inputPlaceholder) as HTMLOptionElement;
        placeholderOption.value = '';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        select.appendChild(placeholderOption);
      }

      if (options.inputOptions) {
        if (options.inputOptions instanceof Map) {
          options.inputOptions.forEach((text, val) => {
            const opt = createElement('option', '', text) as HTMLOptionElement;
            opt.value = String(val);
            select.appendChild(opt);
          });
        } else if (Array.isArray(options.inputOptions)) {
          for (const item of options.inputOptions) {
            const opt = createElement('option', '', item.text) as HTMLOptionElement;
            opt.value = String(item.value);
            select.appendChild(opt);
          }
        } else if (typeof options.inputOptions === 'object') {
          for (const [val, text] of Object.entries(options.inputOptions)) {
            const opt = createElement('option', '', text) as HTMLOptionElement;
            opt.value = val;
            select.appendChild(opt);
          }
        }
      }

      if (options.inputAttributes) setAttributes(select, options.inputAttributes);
      if (options.customClass?.input) addClasses(select, options.customClass.input);

      inputElement = select;
      getValue = () => select.value;
      setValue = (v) => {
        select.value = String(v);
      };
      focusInput = () => select.focus();
      container.appendChild(select);
      break;
    }

    case 'radio': {
      const radioGroup = createElement('div', 'cspa-radio-group');
      radioGroup.id = inputId;
      radioGroup.setAttribute('role', 'radiogroup');
      if (options.inputLabel) {
        radioGroup.setAttribute('aria-label', options.inputLabel);
      }

      const radioOptions = options.inputOptions || {};
      const entries: Array<[string, string]> =
        radioOptions instanceof Map
          ? Array.from(radioOptions.entries())
          : Array.isArray(radioOptions)
            ? radioOptions.map((i) => [i.value, i.text])
            : Object.entries(radioOptions);

      for (const [val, text] of entries) {
        const itemWrap = createElement('label', 'cspa-radio-label');
        const radio = createElement('input', 'cspa-radio') as HTMLInputElement;
        radio.type = 'radio';
        radio.name = inputId;
        radio.value = val;
        if (options.inputAttributes) setAttributes(radio, options.inputAttributes);

        const span = createElement('span', 'cspa-radio-text', text);
        itemWrap.appendChild(radio);
        itemWrap.appendChild(span);
        radioGroup.appendChild(itemWrap);
      }

      inputElement = radioGroup;
      getValue = () => {
        const checked = radioGroup.querySelector<HTMLInputElement>('input[type="radio"]:checked');
        return checked ? checked.value : '';
      };
      setValue = (v) => {
        const radios = radioGroup.querySelectorAll<HTMLInputElement>('input[type="radio"]');
        radios.forEach((r) => {
          r.checked = r.value === String(v);
        });
      };
      focusInput = () => {
        const first = radioGroup.querySelector<HTMLInputElement>('input[type="radio"]');
        first?.focus();
      };
      container.appendChild(radioGroup);
      break;
    }

    case 'checkbox': {
      const checkWrap = createElement('label', 'cspa-checkbox-label');
      const checkbox = createElement('input', 'cspa-checkbox') as HTMLInputElement;
      checkbox.type = 'checkbox';
      checkbox.id = inputId;
      if (options.inputAttributes) setAttributes(checkbox, options.inputAttributes);
      if (options.customClass?.input) addClasses(checkbox, options.customClass.input);

      const span = createElement('span', 'cspa-checkbox-text', options.inputPlaceholder || '');
      checkWrap.appendChild(checkbox);
      checkWrap.appendChild(span);

      inputElement = checkbox;
      getValue = () => (checkbox.checked ? 1 : 0);
      setValue = (v) => {
        checkbox.checked = Boolean(v);
      };
      focusInput = () => checkbox.focus();
      container.appendChild(checkWrap);
      break;
    }

    case 'file': {
      const fileInput = createElement('input', 'cspa-file') as HTMLInputElement;
      fileInput.type = 'file';
      fileInput.id = inputId;
      if (options.inputAttributes) setAttributes(fileInput, options.inputAttributes);
      if (options.customClass?.input) addClasses(fileInput, options.customClass.input);

      inputElement = fileInput;
      getValue = () => (fileInput.multiple ? fileInput.files : fileInput.files?.[0] || null);
      setValue = () => {
        fileInput.value = '';
      };
      focusInput = () => fileInput.focus();
      container.appendChild(fileInput);
      break;
    }

    case 'range': {
      const range = createElement('input', 'cspa-range') as HTMLInputElement;
      range.type = 'range';
      range.id = inputId;
      if (options.inputAttributes) setAttributes(range, options.inputAttributes);
      if (options.customClass?.input) addClasses(range, options.customClass.input);

      inputElement = range;
      getValue = () => Number(range.value);
      setValue = (v) => {
        range.value = String(v);
      };
      focusInput = () => range.focus();
      container.appendChild(range);
      break;
    }

    default: {
      // text, email, password, number, tel, url, search
      const input = createElement('input', 'cspa-input') as HTMLInputElement;
      input.type = inputType;
      input.id = inputId;
      if (options.inputPlaceholder) input.placeholder = options.inputPlaceholder;
      if (options.inputAttributes) setAttributes(input, options.inputAttributes);
      if (options.customClass?.input) addClasses(input, options.customClass.input);

      inputElement = input;
      getValue = () => {
        let v: any = input.value;
        if (options.inputAutoTrim !== false) v = v.trim();
        if (inputType === 'number') v = v === '' ? NaN : Number(v);
        return v;
      };
      setValue = (v) => {
        input.value = v !== undefined && v !== null ? String(v) : '';
      };
      focusInput = () => input.focus();
      container.appendChild(input);
      break;
    }
  }

  // Append validation message container below input
  container.appendChild(validationMessageEl);

  // Initial Value handling
  if (options.inputValue !== undefined) {
    if (options.inputValue instanceof Promise) {
      options.inputValue.then((resolvedVal) => {
        setValue(resolvedVal);
      });
    } else {
      setValue(options.inputValue);
    }
  }

  const showValidationMessage = (msg: string) => {
    validationMessageEl.textContent = msg;
    addClasses(validationMessageEl, 'cspa-validation-message-visible');
    inputElement.setAttribute('aria-invalid', 'true');
    inputElement.setAttribute('aria-errormessage', errorId);
  };

  const resetValidationMessage = () => {
    validationMessageEl.textContent = '';
    validationMessageEl.classList.remove('cspa-validation-message-visible');
    inputElement.removeAttribute('aria-invalid');
    inputElement.removeAttribute('aria-errormessage');
  };

  return {
    container,
    inputElement,
    getValue,
    setValue,
    focus: focusInput,
    validationMessageEl,
    showValidationMessage,
    resetValidationMessage,
  };
}
