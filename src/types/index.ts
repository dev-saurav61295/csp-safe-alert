/**
 * CSP Safe Alert - Public & Internal Type Declarations
 */

export type CspAlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question';

export type CspAlertPosition =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'top-left'
  | 'top-right'
  | 'center'
  | 'center-start'
  | 'center-end'
  | 'center-left'
  | 'center-right'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom-left'
  | 'bottom-right';

export type CspAlertGrow = 'row' | 'column' | 'fullscreen' | false;

export type CspAlertInput =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'range'
  | 'file';

export type CspAlertTheme = 'light' | 'dark' | 'high-contrast' | 'borderless' | 'auto';

export type CspAlertButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';

export type DismissReason = 'backdrop' | 'cancel' | 'close' | 'esc' | 'timer';

export interface CspAlertResult<T = any> {
  readonly isConfirmed: boolean;
  readonly isDenied: boolean;
  readonly isDismissed: boolean;
  readonly value?: T;
  readonly dismiss?: DismissReason;
}

export interface CspAlertCustomClass {
  container?: string;
  popup?: string;
  title?: string;
  closeButton?: string;
  icon?: string;
  image?: string;
  htmlContainer?: string;
  input?: string;
  inputLabel?: string;
  validationMessage?: string;
  actions?: string;
  confirmButton?: string;
  denyButton?: string;
  cancelButton?: string;
  loader?: string;
  footer?: string;
  timerProgressBar?: string;
}

export type InputValidator<T = any> = (
  value: T
) => string | null | undefined | false | Promise<string | null | undefined | false>;

export type PreConfirmCallback<T = any, R = any> = (inputValue: T) => R | Promise<R>;
export type PreDenyCallback<T = any, R = any> = (inputValue: T) => R | Promise<R>;

export interface CspAlertOptions<T = any> {
  // Content & Typography
  title?: string;
  titleText?: string;
  text?: string;
  html?: string | HTMLElement | DocumentFragment;
  icon?: CspAlertIcon;
  /**
   * Deprecated under the strict CSP contract. Arbitrary icon colors cannot be applied without runtime inline CSS.
   * Use an external stylesheet class via `customClass.icon` or the built-in theme tokens instead. This option is retained for source compatibility and is ignored.
   * @deprecated
   */
  iconColor?: string;
  iconHtml?: string | HTMLElement;
  footer?: string | HTMLElement;

  // Custom Image
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: number | string;
  imageHeight?: number | string;

  // Modality, Positioning & Sizing
  toast?: boolean;
  target?: HTMLElement | string;
  position?: CspAlertPosition;
  grow?: CspAlertGrow;
  width?: string;
  /**
   * Deprecated under the strict CSP contract. The arbitrary SweetAlert2 padding value cannot be applied without runtime inline CSS.
   * Use an external stylesheet class via `customClass.popup` instead. This option is retained for source compatibility and is ignored.
   * @deprecated
   */
  padding?: string;
  /**
   * Deprecated under the strict CSP contract. Arbitrary background values cannot be applied without runtime inline CSS.
   * Use an external stylesheet class via `customClass.popup` or a theme instead. This option is retained for source compatibility and is ignored.
   * @deprecated
   */
  background?: string;
  /**
   * Controls backdrop overlay. Set to `false` to render a transparent backdrop (`cspa-backdrop-none`), or provide a custom CSS class name string.
   */
  backdrop?: boolean | string;
  theme?: CspAlertTheme;
  /**
   * Applies CSP-safe height-auto classes to the document root and body while a modal is open.
   * Set to false to leave host document height rules untouched.
   */
  heightAuto?: boolean;

  // Input & Form Controls
  input?: CspAlertInput;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue?: any | Promise<any>;
  inputOptions?: Record<string, string> | Map<string, string> | Array<{ value: string; text: string }>;
  inputAutoTrim?: boolean;
  inputAttributes?: Record<string, string>;
  inputValidator?: InputValidator<T>;

  // Action Buttons
  showConfirmButton?: boolean;
  showDenyButton?: boolean;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  denyButtonText?: string;
  cancelButtonText?: string;
  confirmButtonAriaLabel?: string;
  denyButtonAriaLabel?: string;
  cancelButtonAriaLabel?: string;
  confirmButtonVariant?: CspAlertButtonVariant;
  denyButtonVariant?: CspAlertButtonVariant;
  cancelButtonVariant?: CspAlertButtonVariant;
  /**
   * Whether to apply default `cspa-btn` styling to action buttons. Set to `false` to fully control button appearance via custom classes.
   */
  buttonsStyling?: boolean;
  reverseButtons?: boolean;
  focusConfirm?: boolean;
  focusDeny?: boolean;
  focusCancel?: boolean;
  returnFocus?: boolean;


  // Close Button & Dismissal Policies
  showCloseButton?: boolean;
  closeButtonAriaLabel?: string;
  allowOutsideClick?: boolean | (() => boolean);
  allowEscapeKey?: boolean | (() => boolean);
  allowEnterKey?: boolean | (() => boolean);
  stopKeydownPropagation?: boolean;

  // Timing
  timer?: number;
  timerProgressBar?: boolean;

  // Custom Classes & Styling
  customClass?: CspAlertCustomClass;

  // Async & Lifecycle
  beforeConfirm?: PreConfirmCallback<T>;
  beforeDeny?: PreDenyCallback<T>;
  willOpen?: (popup: HTMLElement) => void;
  didOpen?: (popup: HTMLElement) => void;
  didRender?: (popup: HTMLElement) => void;
  willClose?: (popup: HTMLElement) => void;
  didClose?: () => void;
  didDestroy?: () => void;
}

export interface CspAlertUpdateOptions {
  title?: string;
  titleText?: string;
  text?: string;
  html?: string | HTMLElement | DocumentFragment;
  showConfirmButton?: boolean;
  showDenyButton?: boolean;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  denyButtonText?: string;
  cancelButtonText?: string;
  customClass?: CspAlertCustomClass;
  didRender?: (popup: HTMLElement) => void;
}

export type SanitizerFunction = (dirtyHtml: string) => string;
