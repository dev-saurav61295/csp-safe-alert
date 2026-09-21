/**
 * CSP Safe Alert
 * Accessible alerts and dialogs for strict CSP environments.
 */

import './styles/csp-safe-alert.css';

export { CspAlert } from './core/CspAlert';
export { CspAlertInstance } from './core/instance';
export { FocusTrap } from './accessibility/focusTrap';
export { announce } from './accessibility/announcer';
export { TimerEngine } from './utils/timer';
export { setSanitizer, getSanitizer, isSafeUrl } from './utils/security';

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
  DismissReason,
  InputValidator,
  PreConfirmCallback,
  PreDenyCallback,
  SanitizerFunction,
} from './types';

// Default export for convenience
import { CspAlert } from './core/CspAlert';

if (typeof window !== 'undefined') {
  (window as any).CspAlert = CspAlert;
}

export default CspAlert;
