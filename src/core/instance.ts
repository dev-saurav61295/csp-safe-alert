/**
 * CspAlert Instance & Lifecycle Implementation
 */

import {
  CspAlertOptions,
  CspAlertResult,
  DismissReason,
} from '../types';
import {
  createElement,
  addClasses,
  removeElement,
  clearChildren,
} from '../utils/dom';
import { TimerEngine } from '../utils/timer';
import { FocusTrap } from '../accessibility/focusTrap';
import { announce } from '../accessibility/announcer';
import {
  renderIcon,
  renderImage,
  renderTitle,
  renderHtmlContainer,
  renderFooter,
} from '../content/contentRenderer';
import { renderInput, RenderedInput } from '../inputs/inputFactory';

export class CspAlertInstance {
  private options: CspAlertOptions;
  private resolvePromise!: (result: CspAlertResult) => void;
  public readonly promise: Promise<CspAlertResult>;

  // DOM references
  private container: HTMLElement | null = null;
  private popup: HTMLElement | null = null;
  private renderedInput: RenderedInput | null = null;
  private confirmBtn: HTMLButtonElement | null = null;
  private denyBtn: HTMLButtonElement | null = null;
  private cancelBtn: HTMLButtonElement | null = null;
  private closeBtn: HTMLButtonElement | null = null;
  private timerProgressBar: HTMLProgressElement | null = null;

  // Helpers
  private focusTrap: FocusTrap | null = null;
  private timerEngine: TimerEngine | null = null;
  private isSettled: boolean = false;
  private isDestroyed: boolean = false;
  private loadingState: boolean = false;
  private currentToken: symbol = Symbol('instance-token');

  constructor(options: CspAlertOptions) {
    this.options = { ...options };
    this.promise = new Promise<CspAlertResult>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  public open(): void {
    if (typeof document === 'undefined') {
      this.settle({ isConfirmed: false, isDenied: false, isDismissed: true });
      return;
    }

    if (this.options.willOpen) {
      // Container will be constructed below
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

    // Trigger animations
    requestAnimationFrame(() => {
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

    // Themes
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

    // Confirm Button
    if (showConfirm) {
      const variant = this.options.confirmButtonVariant || 'primary';
      this.confirmBtn = createElement(
        'button',
        ['cspa-btn', `cspa-btn-${variant}`],
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
      this.denyBtn = createElement(
        'button',
        ['cspa-btn', `cspa-btn-${variant}`],
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
      this.cancelBtn = createElement(
        'button',
        ['cspa-btn', `cspa-btn-${variant}`],
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
    if (this.loadingState) return;
    const token = this.currentToken;

    let value: any = true;
    if (this.renderedInput) {
      value = this.renderedInput.getValue();
    }

    // Run Input Validator if present
    if (this.options.inputValidator && this.renderedInput) {
      try {
        const errorMsg = await this.options.inputValidator(value);
        if (token !== this.currentToken) return; // Stale async check

        if (errorMsg) {
          this.showValidationMessage(typeof errorMsg === 'string' ? errorMsg : 'Invalid input');
          return;
        } else {
          this.resetValidationMessage();
        }
      } catch (err: any) {
        if (token !== this.currentToken) return;
        this.showValidationMessage(err?.message || 'Validation error');
        return;
      }
    }

    // Run beforeConfirm hook if present
    if (this.options.beforeConfirm) {
      try {
        this.showLoading();
        const beforeResult = await this.options.beforeConfirm(value);
        if (token !== this.currentToken) return;

        if (beforeResult === false) {
          this.hideLoading();
          return;
        }
        if (beforeResult !== undefined) {
          value = beforeResult;
        }
      } catch (err: any) {
        if (token !== this.currentToken) return;
        this.hideLoading();
        if (err) {
          this.showValidationMessage(err.message || String(err));
        }
        return;
      }
    }

    this.settle({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
      value,
    });
  }

  public async handleDeny(): Promise<void> {
    if (this.loadingState) return;
    const token = this.currentToken;

    let value: any = false;
    if (this.renderedInput) {
      value = this.renderedInput.getValue();
    }

    if (this.options.beforeDeny) {
      try {
        this.showLoading();
        const beforeResult = await this.options.beforeDeny(value);
        if (token !== this.currentToken) return;

        if (beforeResult === false) {
          this.hideLoading();
          return;
        }
        if (beforeResult !== undefined) {
          value = beforeResult;
        }
      } catch (err: any) {
        if (token !== this.currentToken) return;
        this.hideLoading();
        if (err) {
          this.showValidationMessage(err.message || String(err));
        }
        return;
      }
    }

    this.settle({
      isConfirmed: false,
      isDenied: true,
      isDismissed: false,
      value,
    });
  }

  public dismissWith(reason: DismissReason): void {
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
    announce(message, 'assertive');
  }

  public resetValidationMessage(): void {
    if (this.renderedInput) {
      this.renderedInput.resetValidationMessage();
    }
  }

  public showLoading(): void {
    this.loadingState = true;
    if (this.confirmBtn) {
      this.confirmBtn.disabled = true;
      if (!this.confirmBtn.querySelector('.cspa-loader')) {
        const loader = createElement('span', 'cspa-loader');
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

  public update(options: Partial<CspAlertOptions>): void {
    this.options = { ...this.options, ...options };
    // Rerender title
    if (options.title || options.titleText) {
      const title = this.getTitle();
      if (title) title.textContent = options.titleText || options.title || '';
    }
    // Rerender body
    if (options.text) {
      const content = this.getHtmlContainer();
      if (content) content.textContent = options.text;
    }
    // Update buttons
    if (options.confirmButtonText && this.confirmBtn) {
      this.confirmBtn.textContent = options.confirmButtonText;
    }
    if (options.cancelButtonText && this.cancelBtn) {
      this.cancelBtn.textContent = options.cancelButtonText;
    }
    if (options.denyButtonText && this.denyBtn) {
      this.denyBtn.textContent = options.denyButtonText;
    }
  }

  public settle(result: CspAlertResult): void {
    if (this.isSettled) return;
    this.isSettled = true;
    this.currentToken = Symbol('invalidated');

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

      setTimeout(() => {
        this.destroy();
        this.resolvePromise(result);
      }, delay);
    } else {
      this.destroy();
      this.resolvePromise(result);
    }
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.container) {
      removeElement(this.container);
      this.container = null;
    }

    // Restore body scroll lock if no other popups exist
    if (typeof document !== 'undefined') {
      const remainingPopups = document.querySelectorAll('.cspa-container:not(.cspa-toast-container)');
      if (remainingPopups.length === 0) {
        document.body.classList.remove('cspa-body-scroll-lock');
      }
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
  public getInput(): HTMLElement | null {
    return this.renderedInput?.inputElement || null;
  }
  public getValidationMessage(): HTMLElement | null {
    return this.renderedInput?.validationMessageEl || null;
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
