import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CspAlert } from '../../src/core/CspAlert';

describe('CspAlert.update() Behavior', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    CspAlert.close();
  });

  it('allows clearing title and text with empty strings', async () => {
    const promise = CspAlert.fire({
      title: 'Initial Title',
      text: 'Initial body text',
    });

    const popup = CspAlert.getPopup();
    expect(CspAlert.getTitle()?.textContent).toBe('Initial Title');
    expect(CspAlert.getHtmlContainer()?.textContent).toBe('Initial body text');
    expect(popup?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(popup?.getAttribute('aria-describedby')).toBeTruthy();

    // Clear title and text with empty string
    CspAlert.update({
      title: '',
      text: '',
    });

    expect(CspAlert.getTitle()).toBeNull();
    expect(CspAlert.getHtmlContainer()).toBeNull();
    expect(popup?.getAttribute('aria-labelledby')).toBeNull();
    expect(popup?.getAttribute('aria-describedby')).toBeNull();

    CspAlert.clickConfirm();
    await promise;
  });

  it('dynamically adds title and html elements when initially absent', async () => {
    const promise = CspAlert.fire({
      showConfirmButton: true,
    });

    const popup = CspAlert.getPopup();
    expect(CspAlert.getTitle()).toBeNull();
    expect(CspAlert.getHtmlContainer()).toBeNull();

    // Dynamically add title and text
    CspAlert.update({
      title: 'Dynamic Title Added',
      text: 'Dynamic body added',
    });

    expect(CspAlert.getTitle()?.textContent).toBe('Dynamic Title Added');
    expect(CspAlert.getHtmlContainer()?.textContent).toBe('Dynamic body added');
    expect(popup?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(popup?.getAttribute('aria-describedby')).toBeTruthy();

    CspAlert.clickConfirm();
    await promise;
  });

  it('preserves loading spinner and button disabled state during button label updates', async () => {
    let beforeConfirmResolve: () => void;
    const asyncAction = new Promise<void>((resolve) => {
      beforeConfirmResolve = resolve;
    });

    const promise = CspAlert.fire({
      title: 'Loading button update',
      confirmButtonText: 'Submit',
      beforeConfirm: async () => {
        await asyncAction;
        return 'done';
      },
    });

    CspAlert.clickConfirm();
    expect(CspAlert.isLoading()).toBe(true);

    const confirmBtn = CspAlert.getConfirmButton();
    expect(confirmBtn?.disabled).toBe(true);
    expect(confirmBtn?.querySelector('.cspa-loader')).not.toBeNull();

    // Update confirm button text while loading
    CspAlert.update({
      confirmButtonText: 'Processing transfer...',
    });

    expect(confirmBtn?.textContent).toContain('Processing transfer...');
    expect(confirmBtn?.querySelector('.cspa-loader')).not.toBeNull();
    expect(confirmBtn?.disabled).toBe(true);

    beforeConfirmResolve!();
    const result = await promise;
    expect(result.isConfirmed).toBe(true);
  });

  it('invokes didRender hook when update() is called', async () => {
    const didRenderSpy = vi.fn();

    const promise = CspAlert.fire({
      title: 'Initial',
      didRender: didRenderSpy,
    });

    CspAlert.update({
      title: 'Updated title',
    });

    expect(didRenderSpy).toHaveBeenCalled();

    CspAlert.clickConfirm();
    await promise;
  });

  it('safely handles unsupported dynamic updates (e.g. changing input type or target) without corrupting DOM', async () => {
    const promise = CspAlert.fire({
      title: 'Input Dialog',
      input: 'text',
      inputValue: 'original input',
    });

    const input = CspAlert.getInput() as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.type).toBe('text');
    expect(input.value).toBe('original input');

    // Attempt to dynamically pass unsupported structural changes
    CspAlert.update({
      title: 'Updated Dialog Title',
      // @ts-expect-error Testing runtime handling of immutable options
      input: 'textarea',
      // @ts-expect-error Testing runtime handling of immutable options
      target: '#non-existent-target',
    });

    expect(CspAlert.getTitle()?.textContent).toBe('Updated Dialog Title');
    // Mounted input element remains healthy and retains its input value/type
    expect(CspAlert.getInput()).toBe(input);
    expect((CspAlert.getInput() as HTMLInputElement).value).toBe('original input');

    // Verify immutable fields were NOT merged into instance options state
    const instanceOptions = (CspAlert as any).currentInstance.options;
    expect(instanceOptions.input).toBe('text');
    expect(instanceOptions.target).toBeUndefined();

    CspAlert.clickConfirm();
    const result = await promise;
    expect(result.value).toBe('original input');
  });
});


describe('Release 1.1.0 gap regressions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    CspAlert.close();
  });

  it('dynamically adds and removes action buttons, wires handlers, and preserves loading state', async () => {
    const promise = CspAlert.fire({
      title: 'Dynamic actions',
      showConfirmButton: true,
    });

    CspAlert.update({ showDenyButton: true, showCancelButton: true });
    expect(CspAlert.getDenyButton()).not.toBeNull();
    expect(CspAlert.getCancelButton()).not.toBeNull();

    CspAlert.showLoading();
    expect(CspAlert.getDenyButton()?.disabled).toBe(true);
    expect(CspAlert.getCancelButton()?.disabled).toBe(true);

    CspAlert.update({ showConfirmButton: false });
    expect(CspAlert.getConfirmButton()).toBeNull();
    expect(CspAlert.isLoading()).toBe(true);

    CspAlert.update({ showDenyButton: false });
    expect(CspAlert.getDenyButton()).toBeNull();

    CspAlert.hideLoading();
    CspAlert.clickCancel();
    const result = await promise;
    expect(result.isDismissed).toBe(true);
    expect(result.dismiss).toBe('cancel');
  });

  it('attaches the normal deny handler to a dynamically-created deny button', async () => {
    const promise = CspAlert.fire({
      title: 'Dynamic deny',
      showConfirmButton: true,
      showDenyButton: false,
    });

    CspAlert.update({ showDenyButton: true });
    CspAlert.clickDeny();

    const result = await promise;
    expect(result.isDenied).toBe(true);
    expect(result.isDismissed).toBe(false);
  });

  it('moves focus when the focused action button is removed', async () => {
    const promise = CspAlert.fire({
      title: 'Focus update',
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: true,
    });

    const deny = CspAlert.getDenyButton()!;
    deny.focus();
    expect(document.activeElement).toBe(deny);

    CspAlert.update({ showDenyButton: false });

    expect(CspAlert.getDenyButton()).toBeNull();
    expect(document.activeElement).toBe(CspAlert.getConfirmButton());

    CspAlert.clickConfirm();
    await promise;
  });

  it('replaces caller custom classes and supports explicit clearing without removing library classes', async () => {
    const promise = CspAlert.fire({
      title: 'Classes',
      showCancelButton: true,
      customClass: {
        popup: 'caller-popup-old',
        title: 'caller-title-old',
        confirmButton: 'caller-confirm-old',
        cancelButton: 'caller-cancel-old',
      },
    });

    const popup = CspAlert.getPopup()!;
    const title = CspAlert.getTitle()!;
    const confirm = CspAlert.getConfirmButton()!;
    const cancel = CspAlert.getCancelButton()!;

    expect(popup.classList.contains('caller-popup-old')).toBe(true);
    expect(title.classList.contains('caller-title-old')).toBe(true);
    expect(confirm.classList.contains('caller-confirm-old')).toBe(true);

    CspAlert.update({
      customClass: {
        popup: 'caller-popup-new',
        title: 'caller-title-new',
        confirmButton: 'caller-confirm-new',
        cancelButton: 'caller-cancel-new',
      },
    });

    expect(popup.classList.contains('caller-popup-old')).toBe(false);
    expect(popup.classList.contains('caller-popup-new')).toBe(true);
    expect(popup.classList.contains('cspa-popup')).toBe(true);
    expect(title.classList.contains('caller-title-old')).toBe(false);
    expect(title.classList.contains('caller-title-new')).toBe(true);
    expect(confirm.classList.contains('caller-confirm-old')).toBe(false);
    expect(confirm.classList.contains('caller-confirm-new')).toBe(true);
    expect(cancel.classList.contains('caller-cancel-old')).toBe(false);
    expect(cancel.classList.contains('caller-cancel-new')).toBe(true);

    CspAlert.update({ customClass: { popup: '' } });
    expect(popup.classList.contains('caller-popup-new')).toBe(false);
    expect(popup.classList.contains('cspa-popup')).toBe(true);

    CspAlert.clickConfirm();
    await promise;
  });

  it('applies heightAuto through document classes and leaves deprecated arbitrary styling options inert', async () => {
    const promise = CspAlert.fire({
      title: 'CSP styling contract',
      heightAuto: true,
      padding: '99px',
      background: 'rgb(1, 2, 3)',
      icon: 'info',
      iconColor: 'rgb(4, 5, 6)',
    });

    expect(document.documentElement.classList.contains('cspa-height-auto')).toBe(true);
    expect(document.body.classList.contains('cspa-height-auto')).toBe(true);

    const popup = CspAlert.getPopup()!;
    expect(popup.getAttribute('style')).toBeNull();
    expect(popup.classList.contains('cspa-popup')).toBe(true);

    CspAlert.clickConfirm();
    await promise;
    expect(document.documentElement.classList.contains('cspa-height-auto')).toBe(false);
    expect(document.body.classList.contains('cspa-height-auto')).toBe(false);
  });
});
