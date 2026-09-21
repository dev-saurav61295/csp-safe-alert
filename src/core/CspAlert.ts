/**
 * CSP Safe Alert - Main Public API Class
 */

import {
  CspAlertOptions,
  CspAlertUpdateOptions,
  CspAlertResult,
  CspAlertIcon,
  SanitizerFunction,
  DismissReason,
} from '../types/index.js';
import { safeMerge, setSanitizer as setGlobalSanitizer, getSanitizer } from '../utils/security.js';
import { CspAlertInstance } from './instance.js';

export class CspAlert {
  private static currentInstance: CspAlertInstance | null = null;
  private static defaultOptions: CspAlertOptions = {};

  /**
   * Main entrypoint to trigger a modal or toast alert.
   */
  public static fire<T = any>(
    titleOrOptions?: string | CspAlertOptions<T>,
    textOrHtml?: string | HTMLElement,
    icon?: CspAlertIcon
  ): Promise<CspAlertResult<T>> {
    let options: CspAlertOptions<T> = {};

    if (typeof titleOrOptions === 'string') {
      options.title = titleOrOptions;
      if (typeof textOrHtml === 'string') {
        options.text = textOrHtml;
      } else if (typeof HTMLElement !== 'undefined' && typeof HTMLElement !== 'undefined' && textOrHtml instanceof HTMLElement) {
        options.html = textOrHtml;
      }
      if (icon) {
        options.icon = icon;
      }
    } else if (titleOrOptions && typeof titleOrOptions === 'object') {
      options = { ...titleOrOptions };
    }

    // Merge defaults
    const mergedOptions: CspAlertOptions<T> = safeMerge({}, CspAlert.defaultOptions, options);

    // If an instance is already active, close and destroy it cleanly so it cannot interfere with the new modal
    if (CspAlert.currentInstance) {
      const previous = CspAlert.currentInstance;
      previous.dismissWith('close');
      previous.destroy();
    }

    const instance = new CspAlertInstance(mergedOptions);
    CspAlert.currentInstance = instance;
    instance.open();


    return instance.promise.finally(() => {
      if (CspAlert.currentInstance === instance) {
        CspAlert.currentInstance = null;
      }
    });
  }

  /**
   * Closes the active alert popup.
   */
  public static close(result?: CspAlertResult): void {
    if (CspAlert.currentInstance) {
      if (result) {
        CspAlert.currentInstance.settle(result);
      } else {
        CspAlert.currentInstance.dismissWith('close');
      }
    }
  }

  /**
   * Returns true if a dialog or toast is currently open and visible.
   */
  public static isVisible(): boolean {
    return Boolean(CspAlert.currentInstance && CspAlert.currentInstance.getPopup());
  }

  /**
   * Returns the active popup element.
   */
  public static getPopup(): HTMLElement | null {
    return CspAlert.currentInstance?.getPopup() || null;
  }

  /**
   * Returns the active title element.
   */
  public static getTitle(): HTMLElement | null {
    return CspAlert.currentInstance?.getTitle() || null;
  }

  /**
   * Returns the active body/content element.
   */
  public static getHtmlContainer(): HTMLElement | null {
    return CspAlert.currentInstance?.getHtmlContainer() || null;
  }

  /**
   * Returns the active icon element.
   */
  public static getIcon(): HTMLElement | null {
    return CspAlert.currentInstance?.getIcon() || null;
  }

  /**
   * Returns the active custom image element.
   */
  public static getImage(): HTMLImageElement | null {
    return CspAlert.currentInstance?.getImage() || null;
  }

  /**
   * Returns the active input element.
   */
  public static getInput(): HTMLElement | null {
    return CspAlert.currentInstance?.getInput() || null;
  }

  /**
   * Returns the confirm button.
   */
  public static getConfirmButton(): HTMLButtonElement | null {
    return CspAlert.currentInstance?.getConfirmButton() || null;
  }

  /**
   * Returns the deny button.
   */
  public static getDenyButton(): HTMLButtonElement | null {
    return CspAlert.currentInstance?.getDenyButton() || null;
  }

  /**
   * Returns the cancel button.
   */
  public static getCancelButton(): HTMLButtonElement | null {
    return CspAlert.currentInstance?.getCancelButton() || null;
  }

  /**
   * Returns the close button.
   */
  public static getCloseButton(): HTMLButtonElement | null {
    return CspAlert.currentInstance?.getCloseButton() || null;
  }

  /**
   * Returns the footer element.
   */
  public static getFooter(): HTMLElement | null {
    return CspAlert.currentInstance?.getFooter() || null;
  }

  /**
   * Returns the timer progress bar element.
   */
  public static getTimerProgressBar(): HTMLProgressElement | null {
    return CspAlert.currentInstance?.getTimerProgressBar() || null;
  }

  /**
   * Returns the validation message container element.
   */
  public static getValidationMessage(): HTMLElement | null {
    return CspAlert.currentInstance?.getValidationMessage() || null;
  }

  /**
   * Shows a loading spinner and disables buttons.
   */
  public static showLoading(): void {
    CspAlert.currentInstance?.showLoading();
  }

  /**
   * Hides the loading spinner and re-enables buttons.
   */
  public static hideLoading(): void {
    CspAlert.currentInstance?.hideLoading();
  }

  /**
   * Returns whether dialog is in loading state.
   */
  public static isLoading(): boolean {
    return Boolean(CspAlert.currentInstance?.isLoading());
  }

  /**
   * Triggers confirm button click programmatically.
   */
  public static clickConfirm(): void {
    CspAlert.currentInstance?.handleConfirm();
  }

  /**
   * Triggers deny button click programmatically.
   */
  public static clickDeny(): void {
    CspAlert.currentInstance?.handleDeny();
  }

  /**
   * Triggers cancel button click programmatically.
   */
  public static clickCancel(): void {
    CspAlert.currentInstance?.dismissWith('cancel');
  }

  /**
   * Displays validation error message.
   */
  public static showValidationMessage(message: string): void {
    CspAlert.currentInstance?.showValidationMessage(message);
  }

  /**
   * Resets validation error message.
   */
  public static resetValidationMessage(): void {
    CspAlert.currentInstance?.resetValidationMessage();
  }

  /**
   * Returns remaining timer in milliseconds.
   */
  public static getTimerLeft(): number | undefined {
    return CspAlert.currentInstance?.getTimerLeft();
  }

  /**
   * Pauses the timer.
   */
  public static stopTimer(): number | undefined {
    return CspAlert.currentInstance?.stopTimer();
  }

  /**
   * Resumes the timer.
   */
  public static resumeTimer(): void {
    CspAlert.currentInstance?.resumeTimer();
  }

  /**
   * Toggles pause/resume on the timer.
   */
  public static toggleTimer(): boolean | undefined {
    return CspAlert.currentInstance?.toggleTimer();
  }

  /**
   * Returns whether timer is running.
   */
  public static isTimerRunning(): boolean | undefined {
    return CspAlert.currentInstance?.isTimerRunning();
  }

  /**
   * Adds milliseconds to the running timer.
   */
  public static increaseTimer(n: number): number | undefined {
    return CspAlert.currentInstance?.increaseTimer(n);
  }

  /**
   * Updates options of active dialog dynamically.
   */
  public static update(options: CspAlertUpdateOptions): void {
    CspAlert.currentInstance?.update(options);
  }

  /**
   * Registers a sanitizer function for safe HTML string processing.
   */
  public static setSanitizer(sanitizer: SanitizerFunction | null): void {
    setGlobalSanitizer(sanitizer);
  }

  /**
   * Creates a reusable mixin preset.
   */
  public static mixin(presetOptions: CspAlertOptions): typeof CspAlert {
    class CustomCspAlert extends CspAlert {
      public static override fire<T = any>(
        titleOrOptions?: string | CspAlertOptions<T>,
        textOrHtml?: string | HTMLElement,
        icon?: CspAlertIcon
      ): Promise<CspAlertResult<T>> {
        let options: CspAlertOptions<T> = {};
        if (typeof titleOrOptions === 'string') {
          options.title = titleOrOptions;
          if (typeof textOrHtml === 'string') options.text = textOrHtml;
          else if (typeof HTMLElement !== 'undefined' && textOrHtml instanceof HTMLElement) options.html = textOrHtml;
          if (icon) options.icon = icon;
        } else if (titleOrOptions) {
          options = { ...titleOrOptions };
        }
        const merged = safeMerge({}, presetOptions, options);
        return CspAlert.fire<T>(merged);
      }
    }
    return CustomCspAlert as any;
  }

  /**
   * Sequential modal queue execution.
   */
  public static async queue<T = any>(
    steps: Array<CspAlertOptions | string>
  ): Promise<Array<CspAlertResult<T>>> {
    const results: Array<CspAlertResult<T>> = [];
    for (const step of steps) {
      const opts = typeof step === 'string' ? { title: step } : step;
      const res = await CspAlert.fire<T>(opts);
      results.push(res);
      if (res.isDismissed) {
        break; // Stop queue if user dismissed or cancelled
      }
    }
    return results;
  }
}
