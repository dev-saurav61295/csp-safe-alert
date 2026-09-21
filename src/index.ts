/**
 * CSP Safe Alert
 * Accessible alerts and dialogs for strict CSP environments.
 */

import './styles/csp-safe-alert.css';

export { CspAlert } from './core/CspAlert.js';
export { CspAlertInstance } from './core/instance.js';
export { FocusTrap } from './accessibility/focusTrap.js';
export { announce } from './accessibility/announcer.js';
export { TimerEngine } from './utils/timer.js';
export { setSanitizer, getSanitizer, isSafeUrl } from './utils/security.js';

export type {
  CspAlertOptions,
  CspAlertResult,
  CspAlertIcon,
  CspAlertPosition,
  CspAlertGrow,
  CspAlertInput,
  CspAlertTheme,
  CspAlertButtonVariant,
  CspAlertCustomClass,
  CspAlertUpdateOptions,
  DismissReason,
  InputValidator,
  PreConfirmCallback,
  PreDenyCallback,
  SanitizerFunction,
} from './types/index.js';

// Default export and top-level function bindings
import { CspAlert } from './core/CspAlert.js';

export const fire = CspAlert.fire.bind(CspAlert);
export const close = CspAlert.close.bind(CspAlert);
export const isVisible = CspAlert.isVisible.bind(CspAlert);
export const getPopup = CspAlert.getPopup.bind(CspAlert);
export const getTitle = CspAlert.getTitle.bind(CspAlert);
export const getHtmlContainer = CspAlert.getHtmlContainer.bind(CspAlert);
export const getImage = CspAlert.getImage.bind(CspAlert);
export const getIcon = CspAlert.getIcon.bind(CspAlert);
export const getInput = CspAlert.getInput.bind(CspAlert);
export const getConfirmButton = CspAlert.getConfirmButton.bind(CspAlert);
export const getDenyButton = CspAlert.getDenyButton.bind(CspAlert);
export const getCancelButton = CspAlert.getCancelButton.bind(CspAlert);
export const getCloseButton = CspAlert.getCloseButton.bind(CspAlert);
export const getFooter = CspAlert.getFooter.bind(CspAlert);
export const getTimerProgressBar = CspAlert.getTimerProgressBar.bind(CspAlert);
export const showLoading = CspAlert.showLoading.bind(CspAlert);
export const hideLoading = CspAlert.hideLoading.bind(CspAlert);
export const isLoading = CspAlert.isLoading.bind(CspAlert);
export const clickConfirm = CspAlert.clickConfirm.bind(CspAlert);
export const clickDeny = CspAlert.clickDeny.bind(CspAlert);
export const clickCancel = CspAlert.clickCancel.bind(CspAlert);
export const showValidationMessage = CspAlert.showValidationMessage.bind(CspAlert);
export const resetValidationMessage = CspAlert.resetValidationMessage.bind(CspAlert);
export const getValidationMessage = CspAlert.getValidationMessage.bind(CspAlert);
export const update = CspAlert.update.bind(CspAlert);
export const mixin = CspAlert.mixin.bind(CspAlert);
export const queue = CspAlert.queue.bind(CspAlert);
export const stopTimer = CspAlert.stopTimer.bind(CspAlert);
export const resumeTimer = CspAlert.resumeTimer.bind(CspAlert);
export const toggleTimer = CspAlert.toggleTimer.bind(CspAlert);
export const isTimerRunning = CspAlert.isTimerRunning.bind(CspAlert);
export const getTimerLeft = CspAlert.getTimerLeft.bind(CspAlert);
export const increaseTimer = CspAlert.increaseTimer.bind(CspAlert);

if (typeof window !== 'undefined') {
  (window as any).CspAlert = CspAlert;
}

export default CspAlert;
