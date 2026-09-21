/**
 * CspAlert Instance & Lifecycle Implementation
 */

import {
  CspAlertOptions,
  CspAlertUpdateOptions,
  CspAlertResult,
  CspAlertCustomClass,
  DismissReason,
} from '../types/index.js';
import {
  createElement,
  addClasses,
  removeElement,
  clearChildren,
  isHTMLElement,
  isNode,
} from '../utils/dom.js';
import { safeMerge, getSanitizer } from '../utils/security.js';
import { TimerEngine } from '../utils/timer.js';
import { FocusTrap } from '../accessibility/focusTrap.js';
import { announce } from '../accessibility/announcer.js';
import {
  renderIcon,
  renderImage,
  renderTitle,
  renderHtmlContainer,
  renderFooter,
} from '../content/contentRenderer.js';
import { renderInput, RenderedInput } from '../inputs/inputFactory.js';

export class CspAlertInstance {
  private options: CspAlertOptions;
  private resolvePromise!: (result: CspAlertResult) => void;
  public readonly promise: Promise<CspAlertResult>;

  // DOM references
  private container: HTMLElement | null = null;
  private popup: HTMLElement | null = null;
  private renderedInput: RenderedInput | null = null;
  private validationMessageEl: HTMLElement | null = null;
  private confirmBtn: HTMLButtonElement | null = null;
  private denyBtn: HTMLButtonElement | null = null;
  private cancelBtn: HTMLButtonElement | null = null;
  private closeBtn: HTMLButtonElement | null = null;
  private timerProgressBar: HTMLProgressElement | null = null;

  // Helpers & State
  private focusTrap: FocusTrap | null = null;
  private timerEngine: TimerEngine | null = null;
  private isSettled: boolean = false;
  private isDestroyed: boolean = false;
  private loadingState: boolean = false;
  private isActionInProgress: boolean = false;
  private rafId: number | null = null;
  private closeTimerId: any = null;
  private currentToken: symbol = Symbol('instance-token');
  private appliedCustomClasses: Partial<CspAlertCustomClass> = {};

  constructor(options: CspAlertOptions) {
    this.options = { ...options };
    this.appliedCustomClasses = { ...(options.customClass || {}) };
    this.promise = new Promise<CspAlertResult>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  public open(): void {
    if (typeof document === 'undefined') {
      this.settle({ isConfirmed: false, isDenied: false, isDismissed: true });
      return;
    }

    this.buildDOM();
    this.attachEvents();

    if (this.options.willOpen && this.popup) {
      try {
        this.options.willOpen(this.popup);
      } catch (err) {
        console.error('Error in willOpen hook:', err);
      }
    }

    // Mount to DOM target
    const target = this.resolveTarget();
    if (this.container) {
      target.appendChild(this.container);
    }

    // Scroll lock for modal mode
    if (!this.options.toast) {
      document.body.classList.add('cspa-body-scroll-lock');
    }
    if (this.options.heightAuto !== false) {
      document.documentElement.classList.add('cspa-height-auto');
      document.body.classList.add('cspa-height-auto');
    }

    // Trigger animations and activate features
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      if (this.isSettled || this.isDestroyed) return;

      if (this.container && this.popup) {
        this.container.classList.add('cspa-backdrop-show');
        this.popup.classList.add('cspa-popup-show');
      }

      // Activate Focus Trap
      if (this.popup && !this.options.toast) {
        let initialFocus: HTMLElement | null = null;
        if (this.options.focusCancel && this.cancelBtn) {
          initialFocus = this.cancelBtn;
        } else if (this.options.focusDeny && this.denyBtn) {
          initialFocus = this.denyBtn;
        } else if (this.options.focusConfirm !== false && this.confirmBtn) {
          initialFocus = this.confirmBtn;
        } else if (this.renderedInput) {
          initialFocus = this.renderedInput.inputElement;
        }

        this.focusTrap = new FocusTrap({
          container: this.popup,
          initialFocusElement: initialFocus,
          returnFocus: this.options.returnFocus !== false,
        });
        this.focusTrap.activate();
      }

      // Start Timer
      if (this.options.timer && this.options.timer > 0) {
        this.timerEngine = new TimerEngine({
          duration: this.options.timer,
          onTick: (_rem, ratio) => {
            if (this.timerProgressBar) {
              this.timerProgressBar.value = Math.max(0, Math.min(100, ratio * 100));
            }
          },
          onExpire: () => {
            this.dismissWith('timer');
          },
        });
        this.timerEngine.start();
      }

      if (this.options.didOpen && this.popup) {
        try {
          this.options.didOpen(this.popup);
        } catch (err) {
          console.error('Error in didOpen hook:', err);
        }
      }

      if (this.options.didRender && this.popup) {
        try {
          this.options.didRender(this.popup);
        } catch (err) {
          console.error('Error in didRender hook:', err);
        }
      }
    });
  }

  private resolveTarget(): HTMLElement {
    if (this.options.target) {
      if (typeof this.options.target === 'string') {
        const found = document.querySelector<HTMLElement>(this.options.target);
        if (found) return found;
      } else if (this.options.target instanceof HTMLElement) {
        return this.options.target;
      }
    }
    return document.body;
  }

  private buildDOM(): void {
    const isToast = Boolean(this.options.toast);
    const position = this.options.position || (isToast ? 'top-end' : 'center');

    // Container
    this.container = createElement('div', [
      'cspa-container',
      `cspa-pos-${position}`,
      isToast ? 'cspa-toast-container' : 'cspa-backdrop',
    ]);

    // Backdrop configuration
    if (this.options.backdrop === false) {
      addClasses(this.container, 'cspa-backdrop-none');
    } else if (typeof this.options.backdrop === 'string') {
      addClasses(this.container, this.options.backdrop);
    }

    // Theme applied to container for backdrop styling
    if (this.options.theme && this.options.theme !== 'auto') {
      addClasses(this.container, `cspa-theme-${this.options.theme}`);
    }

    if (this.options.customClass?.container) {
      addClasses(this.container, this.options.customClass.container);
    }

    // Popup
    this.popup = createElement('div', ['cspa-popup', isToast ? 'cspa-toast-popup' : '']);
    this.popup.setAttribute('tabindex', '-1');

    // ARIA roles
    if (isToast) {
      this.popup.setAttribute('role', this.options.icon === 'error' ? 'alert' : 'status');
      this.popup.setAttribute('aria-live', 'polite');
    } else {
      this.popup.setAttribute(
        'role',
        this.options.icon === 'warning' || this.options.icon === 'error' ? 'alertdialog' : 'dialog'
      );
      this.popup.setAttribute('aria-modal', 'true');
    }

    // Sizing & Grow Presets
    if (this.options.width) {
      if (this.options.width.startsWith('cspa-width-')) {
        addClasses(this.popup, this.options.width);
      }
    }
    if (this.options.grow) {
      addClasses(this.popup, `cspa-grow-${this.options.grow}`);
    }

    // Theme applied to popup
    if (this.options.theme && this.options.theme !== 'auto') {
      addClasses(this.popup, `cspa-theme-${this.options.theme}`);
    }

    // Custom class for popup
    if (this.options.customClass?.popup) {
      addClasses(this.popup, this.options.customClass.popup);
    }

    // Unique IDs for accessibility linkage
    const titleId = `cspa-title-${Math.random().toString(36).substring(2, 9)}`;
    const htmlContainerId = `cspa-html-${Math.random().toString(36).substring(2, 9)}`;
    const inputId = `cspa-input-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `cspa-error-${Math.random().toString(36).substring(2, 9)}`;

    // Close button
    if (this.options.showCloseButton) {
      this.closeBtn = createElement('button', 'cspa-close-button', '×') as HTMLButtonElement;
      this.closeBtn.type = 'button';
      this.closeBtn.setAttribute('aria-label', this.options.closeButtonAriaLabel || 'Close dialog');
      if (this.options.customClass?.closeButton) {
        addClasses(this.closeBtn, this.options.customClass.closeButton);
      }
      this.popup.appendChild(this.closeBtn);
    }

    // Image
    const imgEl = renderImage(this.options);
    if (imgEl) this.popup.appendChild(imgEl);

    // Icon
    const iconEl = renderIcon(this.options);
    if (iconEl) this.popup.appendChild(iconEl);

    // Title
    const titleEl = renderTitle(this.options, titleId);
    if (titleEl) {
      this.popup.appendChild(titleEl);
      this.popup.setAttribute('aria-labelledby', titleId);
    }

    // HTML / Body Container
    const htmlEl = renderHtmlContainer(this.options, htmlContainerId);
    if (htmlEl) {
      this.popup.appendChild(htmlEl);
      this.popup.setAttribute('aria-describedby', htmlContainerId);
    }

    // Input Control
    if (this.options.input) {
      this.renderedInput = renderInput(this.options, inputId, errorId);
      if (this.renderedInput) {
        this.popup.appendChild(this.renderedInput.container);
      }
    } else {
      // Popup-level validation message element for dialogs without inputs
      this.validationMessageEl = createElement('div', 'cspa-validation-message');
      this.validationMessageEl.id = errorId;
      this.validationMessageEl.setAttribute('aria-live', 'polite');
      if (this.options.customClass?.validationMessage) {
        addClasses(this.validationMessageEl, this.options.customClass.validationMessage);
      }
      this.popup.appendChild(this.validationMessageEl);
    }

    // Action Buttons
    const actionsEl = this.buildActions();
    if (actionsEl) {
      this.popup.appendChild(actionsEl);
    }

    // Footer
    const footerEl = renderFooter(this.options);
    if (footerEl) {
      this.popup.appendChild(footerEl);
    }

    // Timer Progress Bar
    if (this.options.timerProgressBar && this.options.timer) {
      this.timerProgressBar = createElement('progress', 'cspa-timer-progress-bar') as HTMLProgressElement;
      this.timerProgressBar.max = 100;
      this.timerProgressBar.value = 100;
      if (this.options.customClass?.timerProgressBar) {
        addClasses(this.timerProgressBar, this.options.customClass.timerProgressBar);
      }
      this.popup.appendChild(this.timerProgressBar);
    }

    this.container.appendChild(this.popup);
  }

  private buildActions(): HTMLElement | null {
    const showConfirm = this.options.showConfirmButton !== false;
    const showDeny = Boolean(this.options.showDenyButton);
    const showCancel = Boolean(this.options.showCancelButton);

    if (!showConfirm && !showDeny && !showCancel) {
      return null;
    }

    const actionsContainer = createElement('div', 'cspa-actions');
    if (this.options.reverseButtons) {
      addClasses(actionsContainer, 'cspa-actions-reverse');
    }
    if (this.options.customClass?.actions) {
      addClasses(actionsContainer, this.options.customClass.actions);
    }

    const useButtonStyling = this.options.buttonsStyling !== false;

    // Confirm Button
    if (showConfirm) {
      const variant = this.options.confirmButtonVariant || 'primary';
      const classes = useButtonStyling ? ['cspa-btn', `cspa-btn-${variant}`] : [];
      this.confirmBtn = createElement(
        'button',
        classes,
        this.options.confirmButtonText || 'OK'
      ) as HTMLButtonElement;
      this.confirmBtn.type = 'button';
      if (this.options.confirmButtonAriaLabel) {
        this.confirmBtn.setAttribute('aria-label', this.options.confirmButtonAriaLabel);
      }
      if (this.options.customClass?.confirmButton) {
        addClasses(this.confirmBtn, this.options.customClass.confirmButton);
      }
      actionsContainer.appendChild(this.confirmBtn);
    }

    // Deny Button
    if (showDeny) {
      const variant = this.options.denyButtonVariant || 'danger';
      const classes = useButtonStyling ? ['cspa-btn', `cspa-btn-${variant}`] : [];
      this.denyBtn = createElement(
        'button',
        classes,
        this.options.denyButtonText || 'No'
      ) as HTMLButtonElement;
      this.denyBtn.type = 'button';
      if (this.options.denyButtonAriaLabel) {
        this.denyBtn.setAttribute('aria-label', this.options.denyButtonAriaLabel);
      }
      if (this.options.customClass?.denyButton) {
        addClasses(this.denyBtn, this.options.customClass.denyButton);
      }
      actionsContainer.appendChild(this.denyBtn);
    }

    // Cancel Button
    if (showCancel) {
      const variant = this.options.cancelButtonVariant || 'secondary';
      const classes = useButtonStyling ? ['cspa-btn', `cspa-btn-${variant}`] : [];
      this.cancelBtn = createElement(
        'button',
        classes,
        this.options.cancelButtonText || 'Cancel'
      ) as HTMLButtonElement;
      this.cancelBtn.type = 'button';
      if (this.options.cancelButtonAriaLabel) {
        this.cancelBtn.setAttribute('aria-label', this.options.cancelButtonAriaLabel);
      }
      if (this.options.customClass?.cancelButton) {
        addClasses(this.cancelBtn, this.options.customClass.cancelButton);
      }
      actionsContainer.appendChild(this.cancelBtn);
    }

    return actionsContainer;
  }

  private attachEvents(): void {
    // Confirm click
    if (this.confirmBtn) {
      this.confirmBtn.addEventListener('click', () => this.handleConfirm());
    }

    // Deny click
    if (this.denyBtn) {
      this.denyBtn.addEventListener('click', () => this.handleDeny());
    }

    // Cancel click
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', () => this.dismissWith('cancel'));
    }

    // Close click
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.dismissWith('close'));
    }

    // Outside click (Backdrop)
    if (this.container && !this.options.toast) {
      this.container.addEventListener('click', (e) => {
        if (e.target === this.container) {
          const allowOutside =
            typeof this.options.allowOutsideClick === 'function'
              ? this.options.allowOutsideClick()
              : this.options.allowOutsideClick !== false;

          if (allowOutside) {
            this.dismissWith('backdrop');
          }
        }
      });
    }

    // Escape and Enter key policies
    if (this.popup) {
      this.popup.addEventListener('keydown', (e: KeyboardEvent) => {
        if (this.options.stopKeydownPropagation) {
          e.stopPropagation();
        }

        // Handle Escape
        if (e.key === 'Escape') {
          const allowEsc =
            typeof this.options.allowEscapeKey === 'function'
              ? this.options.allowEscapeKey()
              : this.options.allowEscapeKey !== false;

          if (allowEsc) {
            e.preventDefault();
            this.dismissWith('esc');
          }
        }

        // Handle Enter in single-line inputs
        if (e.key === 'Enter' && !e.isComposing) {
          const active = document.activeElement;
          if (active && active.tagName === 'INPUT' && (active as HTMLInputElement).type !== 'checkbox') {
            const allowEnter =
              typeof this.options.allowEnterKey === 'function'
                ? this.options.allowEnterKey()
                : this.options.allowEnterKey !== false;

            if (allowEnter) {
              e.preventDefault();
              this.handleConfirm();
            }
          }
        }
      });
    }
  }

  public async handleConfirm(): Promise<void> {
    if (this.isSettled || this.isDestroyed || this.isActionInProgress || this.loadingState) {
      return;
    }
    this.isActionInProgress = true;
    const token = this.currentToken;

    let value: any = true;
    if (this.renderedInput) {
      value = this.renderedInput.getValue();
    }

    // Run Input Validator if present
    if (this.options.inputValidator) {
      try {
        const errorMsg = await this.options.inputValidator(value);
        if (token !== this.currentToken || this.isSettled || this.isDestroyed) {
          this.isActionInProgress = false;
          return;
        }

        if (errorMsg) {
          this.isActionInProgress = false;
          this.showValidationMessage(typeof errorMsg === 'string' ? errorMsg : 'Invalid input');
          return;
        } else {
          this.resetValidationMessage();
        }
      } catch (err: any) {
        if (token !== this.currentToken || this.isSettled || this.isDestroyed) {
          this.isActionInProgress = false;
          return;
        }
        this.isActionInProgress = false;
        this.showValidationMessage(err?.message || String(err) || 'Validation error');
        return;
      }
    }

    // Run beforeConfirm hook if present
    if (this.options.beforeConfirm) {
      try {
        this.showLoading();
        const beforeResult = await this.options.beforeConfirm(value);
        if (token !== this.currentToken || this.isSettled || this.isDestroyed) {
          this.isActionInProgress = false;
          return;
        }

        if (beforeResult === false) {
          this.hideLoading();
          this.isActionInProgress = false;
          return;
        }
        if (beforeResult !== undefined) {
          value = beforeResult;
        }
      } catch (err: any) {
        if (token !== this.currentToken || this.isSettled || this.isDestroyed) {
          this.isActionInProgress = false;
          return;
        }
        this.hideLoading();
        this.isActionInProgress = false;
        if (err) {
          this.showValidationMessage(err.message || String(err));
        }
        return;
      }
    }

    this.isActionInProgress = false;
    this.settle({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
      value,
    });
  }

  public async handleDeny(): Promise<void> {
    if (this.isSettled || this.isDestroyed || this.isActionInProgress || this.loadingState) {
      return;
    }
    this.isActionInProgress = true;
    const token = this.currentToken;

    let value: any = false;
    if (this.renderedInput) {
      value = this.renderedInput.getValue();
    }

    if (this.options.beforeDeny) {
      try {
        this.showLoading();
        const beforeResult = await this.options.beforeDeny(value);
        if (token !== this.currentToken || this.isSettled || this.isDestroyed) {
          this.isActionInProgress = false;
          return;
        }

        if (beforeResult === false) {
          this.hideLoading();
          this.isActionInProgress = false;
          return;
        }
        if (beforeResult !== undefined) {
          value = beforeResult;
        }
      } catch (err: any) {
        if (token !== this.currentToken || this.isSettled || this.isDestroyed) {
          this.isActionInProgress = false;
          return;
        }
        this.hideLoading();
        this.isActionInProgress = false;
        if (err) {
          this.showValidationMessage(err.message || String(err));
        }
        return;
      }
    }

    this.isActionInProgress = false;
    this.settle({
      isConfirmed: false,
      isDenied: true,
      isDismissed: false,
      value,
    });
  }

  public dismissWith(reason: DismissReason): void {
    this.currentToken = Symbol('invalidated');
    this.isActionInProgress = false;
    this.settle({
      isConfirmed: false,
      isDenied: false,
      isDismissed: true,
      dismiss: reason,
    });
  }

  public showValidationMessage(message: string): void {
    if (this.renderedInput) {
      this.renderedInput.showValidationMessage(message);
    }
    if (this.validationMessageEl) {
      this.validationMessageEl.textContent = message;
      this.validationMessageEl.classList.add('cspa-validation-message-visible');
    }
    announce(message, 'assertive');
  }

  public resetValidationMessage(): void {
    if (this.renderedInput) {
      this.renderedInput.resetValidationMessage();
    }
    if (this.validationMessageEl) {
      this.validationMessageEl.textContent = '';
      this.validationMessageEl.classList.remove('cspa-validation-message-visible');
    }
  }

  public showLoading(): void {
    this.loadingState = true;
    if (this.confirmBtn) {
      this.confirmBtn.disabled = true;
      if (!this.confirmBtn.querySelector('.cspa-loader')) {
        const loader = createElement('span', 'cspa-loader');
        if (this.options.customClass?.loader) addClasses(loader, this.options.customClass.loader);
        this.confirmBtn.insertBefore(loader, this.confirmBtn.firstChild);
      }
    }
    if (this.denyBtn) this.denyBtn.disabled = true;
    if (this.cancelBtn) this.cancelBtn.disabled = true;
  }

  public hideLoading(): void {
    this.loadingState = false;
    if (this.confirmBtn) {
      this.confirmBtn.disabled = false;
      const loader = this.confirmBtn.querySelector('.cspa-loader');
      if (loader) removeElement(loader);
    }
    if (this.denyBtn) this.denyBtn.disabled = false;
    if (this.cancelBtn) this.cancelBtn.disabled = false;
  }

  public isLoading(): boolean {
    return this.loadingState;
  }

  private createActionButton(kind: 'confirm' | 'deny' | 'cancel'): HTMLButtonElement {
    const text = kind === 'confirm'
      ? this.options.confirmButtonText || 'OK'
      : kind === 'deny'
        ? this.options.denyButtonText || 'No'
        : this.options.cancelButtonText || 'Cancel';
    const variant = kind === 'confirm'
      ? this.options.confirmButtonVariant || 'primary'
      : kind === 'deny'
        ? this.options.denyButtonVariant || 'danger'
        : this.options.cancelButtonVariant || 'secondary';
    const customClassKey = kind === 'confirm'
      ? 'confirmButton'
      : kind === 'deny'
        ? 'denyButton'
        : 'cancelButton';
    const ariaLabel = kind === 'confirm'
      ? this.options.confirmButtonAriaLabel
      : kind === 'deny'
        ? this.options.denyButtonAriaLabel
        : this.options.cancelButtonAriaLabel;

    const classes = this.options.buttonsStyling !== false ? ['cspa-btn', `cspa-btn-${variant}`] : [];
    const button = createElement('button', classes, text) as HTMLButtonElement;
    button.type = 'button';
    if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
    const customClass = this.options.customClass?.[customClassKey];
    if (customClass) addClasses(button, customClass);

    if (this.loadingState) {
      button.disabled = true;
    }

    if (kind === 'confirm') {
      this.confirmBtn = button;
      button.addEventListener('click', () => this.handleConfirm());
      if (this.loadingState) {
        const loader = createElement('span', 'cspa-loader');
        if (this.options.customClass?.loader) addClasses(loader, this.options.customClass.loader);
        button.insertBefore(loader, button.firstChild);
      }
    } else if (kind === 'deny') {
      this.denyBtn = button;
      button.addEventListener('click', () => this.handleDeny());
    } else {
      this.cancelBtn = button;
      button.addEventListener('click', () => this.dismissWith('cancel'));
    }

    return button;
  }

  private getActionsContainer(): HTMLElement | null {
    return this.popup?.querySelector<HTMLElement>('.cspa-actions') || null;
  }

  private ensureActionsContainer(): HTMLElement {
    let actions = this.getActionsContainer();
    if (actions) return actions;

    actions = createElement('div', 'cspa-actions');
    if (this.options.reverseButtons) addClasses(actions, 'cspa-actions-reverse');
    if (this.options.customClass?.actions) addClasses(actions, this.options.customClass.actions);
    this.popup!.appendChild(actions);
    return actions;
  }

  private focusAfterButtonRemoval(removed: HTMLButtonElement): void {
    if (typeof document === 'undefined' || document.activeElement !== removed || !this.popup) return;

    const candidate = this.confirmBtn || this.denyBtn || this.cancelBtn || this.renderedInput?.inputElement;
    if (candidate && candidate !== removed && !('disabled' in candidate && (candidate as HTMLButtonElement).disabled)) {
      (candidate as HTMLElement).focus();
      return;
    }
    this.popup.focus();
  }

  private removeActionButton(kind: 'confirm' | 'deny' | 'cancel'): void {
    const button = kind === 'confirm' ? this.confirmBtn : kind === 'deny' ? this.denyBtn : this.cancelBtn;
    if (!button) return;
    const wasFocused = typeof document !== 'undefined' && document.activeElement === button;

    if (kind === 'confirm') this.confirmBtn = null;
    else if (kind === 'deny') this.denyBtn = null;
    else this.cancelBtn = null;

    removeElement(button);
    if (wasFocused) this.focusAfterButtonRemoval(button);
  }

  private updateActionButtons(): void {
    const desired = {
      confirm: this.options.showConfirmButton !== false,
      deny: Boolean(this.options.showDenyButton),
      cancel: Boolean(this.options.showCancelButton),
    };

    for (const kind of ['confirm', 'deny', 'cancel'] as const) {
      const button = kind === 'confirm' ? this.confirmBtn : kind === 'deny' ? this.denyBtn : this.cancelBtn;
      if (desired[kind] && !button) {
        this.ensureActionsContainer().appendChild(this.createActionButton(kind));
      } else if (!desired[kind] && button) {
        this.removeActionButton(kind);
      }
    }

    const actions = this.getActionsContainer();
    if (actions && !this.confirmBtn && !this.denyBtn && !this.cancelBtn) {
      removeElement(actions);
    }
  }

  private getCustomClassTarget(key: keyof CspAlertCustomClass): Element | null {
    if (key === 'container') return this.container;
    if (key === 'popup') return this.popup;
    if (key === 'title') return this.getTitle();
    if (key === 'closeButton') return this.closeBtn;
    if (key === 'icon') return this.getIcon();
    if (key === 'image') return this.getImage();
    if (key === 'htmlContainer') return this.getHtmlContainer();
    if (key === 'input') return this.renderedInput?.inputElement || null;
    if (key === 'inputLabel') return this.popup?.querySelector('.cspa-input-label') || null;
    if (key === 'validationMessage') return this.renderedInput?.validationMessageEl || this.validationMessageEl;
    if (key === 'actions') return this.getActionsContainer();
    if (key === 'confirmButton') return this.confirmBtn;
    if (key === 'denyButton') return this.denyBtn;
    if (key === 'cancelButton') return this.cancelBtn;
    if (key === 'loader') return this.popup?.querySelector('.cspa-loader') || null;
    if (key === 'footer') return this.getFooter();
    if (key === 'timerProgressBar') return this.timerProgressBar;
    return null;
  }

  private updateCustomClasses(previous: Partial<CspAlertCustomClass>, next: Partial<CspAlertCustomClass>): void {
    const keys = Object.keys({ ...previous, ...next }) as Array<keyof CspAlertCustomClass>;
    for (const key of keys) {
      const target = this.getCustomClassTarget(key);
      if (!target) continue;
      if (previous[key] && previous[key] !== next[key]) {
        const removable = previous[key]!
          .split(/\s+/)
          .filter((token) => token && !token.startsWith('cspa-'));
        if (removable.length) removeClasses(target, removable);
      }
      if (next[key]) addClasses(target, next[key]!);
    }
    this.appliedCustomClasses = { ...next };
  }

  public update(options: CspAlertUpdateOptions): void {
    if (this.isSettled || this.isDestroyed || !this.popup) return;

    const previousCustomClasses = { ...(this.appliedCustomClasses || {}) };

    // Update supported DOM content first.
    if ('title' in options || 'titleText' in options) {
      const newTitle = options.titleText !== undefined ? options.titleText : options.title;
      let titleEl = this.getTitle();
      if (newTitle) {
        if (!titleEl) {
          const titleId = `cspa-title-${Math.random().toString(36).substring(2, 9)}`;
          titleEl = renderTitle({ ...this.options, titleText: newTitle }, titleId);
          if (titleEl) {
            const icon = this.popup.querySelector('.cspa-icon');
            const img = this.popup.querySelector('.cspa-image');
            const insertBeforeEl = icon?.nextSibling || img?.nextSibling || this.popup.firstChild;
            this.popup.insertBefore(titleEl, insertBeforeEl);
            this.popup.setAttribute('aria-labelledby', titleId);
          }
        } else {
          titleEl.textContent = newTitle;
        }
      } else if (titleEl) {
        removeElement(titleEl);
        this.popup.removeAttribute('aria-labelledby');
      }
    }

    if ('text' in options || 'html' in options) {
      const newHtml = options.html;
      const newText = options.text;
      let htmlEl = this.getHtmlContainer();
      if (newHtml || newText) {
        if (!htmlEl) {
          const htmlContainerId = `cspa-html-${Math.random().toString(36).substring(2, 9)}`;
          htmlEl = renderHtmlContainer({ ...this.options, html: newHtml, text: newText }, htmlContainerId);
          if (htmlEl) {
            const title = this.popup.querySelector('.cspa-title');
            const insertBeforeEl = title?.nextSibling || this.popup.firstChild;
            this.popup.insertBefore(htmlEl, insertBeforeEl);
            this.popup.setAttribute('aria-describedby', htmlContainerId);
          }
        } else {
          clearChildren(htmlEl);
          if (newHtml) {
            if (isHTMLElement(newHtml) || isNode(newHtml)) {
              htmlEl.appendChild(newHtml);
            } else if (typeof newHtml === 'string') {
              const sanitizer = getSanitizer();
              if (sanitizer) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(sanitizer(newHtml), 'text/html');
                while (doc.body.firstChild) htmlEl.appendChild(doc.body.firstChild);
              } else {
                htmlEl.textContent = newHtml;
              }
            }
          } else if (newText !== undefined) {
            htmlEl.textContent = newText;
          }
        }
      } else if (htmlEl) {
        removeElement(htmlEl);
        this.popup.removeAttribute('aria-describedby');
      }
    }

    const safeUpdates: Partial<CspAlertUpdateOptions> = {};
    const allowedKeys: Array<keyof CspAlertUpdateOptions> = [
      'title', 'titleText', 'text', 'html',
      'showConfirmButton', 'showDenyButton', 'showCancelButton',
      'confirmButtonText', 'denyButtonText', 'cancelButtonText',
      'didRender'
    ];
    for (const key of allowedKeys) {
      if (key in options && (options as any)[key] !== undefined) {
        (safeUpdates as any)[key] = (options as any)[key];
      }
    }

    this.options = safeMerge({}, this.options, safeUpdates);

    if ('customClass' in options && options.customClass) {
      const nextCustomClasses = { ...previousCustomClasses, ...options.customClass };
      this.options.customClass = nextCustomClasses;
      this.updateCustomClasses(previousCustomClasses, nextCustomClasses);
    }

    // Labels and dynamic visibility are applied after options are merged.
    if ('confirmButtonText' in options && this.confirmBtn) {
      const text = options.confirmButtonText || '';
      const loader = this.confirmBtn.querySelector('.cspa-loader');
      this.confirmBtn.textContent = text;
      if (loader) this.confirmBtn.insertBefore(loader, this.confirmBtn.firstChild);
    }
    if ('denyButtonText' in options && this.denyBtn) this.denyBtn.textContent = options.denyButtonText || '';
    if ('cancelButtonText' in options && this.cancelBtn) this.cancelBtn.textContent = options.cancelButtonText || '';

    this.updateActionButtons();

    // Re-apply caller classes after creating/removing dynamic elements.
    if ('customClass' in options) {
      this.updateCustomClasses(previousCustomClasses, this.options.customClass || {});
    }

    // A loader may have been created before a customClass update.
    const loader = this.popup.querySelector('.cspa-loader');
    if (loader && this.options.customClass?.loader) {
      addClasses(loader, this.options.customClass.loader);
    }

    if (this.options.didRender && this.popup) {
      try {
        this.options.didRender(this.popup);
      } catch (err) {
        console.error('Error in didRender hook:', err);
      }
    }
  }

  private pendingResult: CspAlertResult | null = null;

  public settle(result: CspAlertResult): void {
    if (this.isSettled) return;
    this.isSettled = true;
    this.pendingResult = result;
    this.currentToken = Symbol('invalidated');

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.renderedInput?.destroy) {
      this.renderedInput.destroy();
    }

    if (this.options.willClose && this.popup) {
      try {
        this.options.willClose(this.popup);
      } catch (err) {
        console.error('Error in willClose hook:', err);
      }
    }

    if (this.timerEngine) {
      this.timerEngine.destroy();
      this.timerEngine = null;
    }

    if (this.focusTrap) {
      this.focusTrap.deactivate();
      this.focusTrap = null;
    }

    if (this.popup && this.container) {
      this.container.classList.remove('cspa-backdrop-show');
      this.popup.classList.remove('cspa-popup-show');
      this.popup.classList.add('cspa-popup-hide');

      const isTestEnv = typeof process !== 'undefined' && process.env && (process.env.NODE_ENV === 'test' || process.env.VITEST);
      const delay = isTestEnv ? 0 : 200;

      this.closeTimerId = setTimeout(() => {
        this.closeTimerId = null;
        this.destroy();
      }, delay);
    } else {
      this.destroy();
    }
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (!this.isSettled) {
      this.isSettled = true;
      this.pendingResult = {
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
        dismiss: 'close',
      };
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.closeTimerId !== null) {
      clearTimeout(this.closeTimerId);
      this.closeTimerId = null;
    }

    if (this.renderedInput?.destroy) {
      this.renderedInput.destroy();
    }

    if (this.timerEngine) {
      this.timerEngine.destroy();
      this.timerEngine = null;
    }

    if (this.focusTrap) {
      this.focusTrap.deactivate();
      this.focusTrap = null;
    }

    if (this.container) {
      removeElement(this.container);
      this.container = null;
    }

    // Restore global classes only if no other modal popups remain.
    if (typeof document !== 'undefined') {
      const remainingPopups = document.querySelectorAll('.cspa-container:not(.cspa-toast-container)');
      if (remainingPopups.length === 0) {
        document.body.classList.remove('cspa-body-scroll-lock');
        document.documentElement.classList.remove('cspa-height-auto');
        document.body.classList.remove('cspa-height-auto');
      }
    }

    if (this.pendingResult) {
      this.resolvePromise(this.pendingResult);
    }

    if (this.options.didClose) {
      try {
        this.options.didClose();
      } catch (err) {
        console.error('Error in didClose hook:', err);
      }
    }

    if (this.options.didDestroy) {
      try {
        this.options.didDestroy();
      } catch (err) {
        console.error('Error in didDestroy hook:', err);
      }
    }
  }


  // Getters for public methods
  public getPopup(): HTMLElement | null {
    return this.popup;
  }
  public getTitle(): HTMLElement | null {
    return this.popup?.querySelector<HTMLElement>('.cspa-title') || null;
  }
  public getHtmlContainer(): HTMLElement | null {
    return this.popup?.querySelector<HTMLElement>('.cspa-html-container') || null;
  }
  public getIcon(): HTMLElement | null {
    return this.popup?.querySelector<HTMLElement>('.cspa-icon') || null;
  }
  public getImage(): HTMLImageElement | null {
    return this.popup?.querySelector<HTMLImageElement>('.cspa-image') || null;
  }
  public getInput(): HTMLElement | null {
    return this.renderedInput?.inputElement || null;
  }
  public getValidationMessage(): HTMLElement | null {
    return this.renderedInput?.validationMessageEl || this.validationMessageEl || null;
  }
  public getConfirmButton(): HTMLButtonElement | null {
    return this.confirmBtn;
  }
  public getDenyButton(): HTMLButtonElement | null {
    return this.denyBtn;
  }
  public getCancelButton(): HTMLButtonElement | null {
    return this.cancelBtn;
  }
  public getCloseButton(): HTMLButtonElement | null {
    return this.closeBtn;
  }
  public getFooter(): HTMLElement | null {
    return this.popup?.querySelector<HTMLElement>('.cspa-footer') || null;
  }
  public getTimerProgressBar(): HTMLProgressElement | null {
    return this.timerProgressBar;
  }
  public getTimerLeft(): number | undefined {
    return this.timerEngine?.getRemaining();
  }
  public stopTimer(): number | undefined {
    return this.timerEngine?.stop();
  }
  public resumeTimer(): void {
    this.timerEngine?.resume();
  }
  public toggleTimer(): boolean | undefined {
    return this.timerEngine?.toggle();
  }
  public isTimerRunning(): boolean | undefined {
    return this.timerEngine?.running();
  }
  public increaseTimer(n: number): number | undefined {
    return this.timerEngine?.increase(n);
  }
}

