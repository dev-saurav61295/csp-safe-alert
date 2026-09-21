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
  header?: string;
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
   * Custom CSS class name for icon color.
   * @deprecated Direct inline CSS color strings (e.g. '#ff0000') cannot be set directly under strict CSP. Use CSS custom properties (e.g. `--cspa-icon-error`, `--cspa-primary`) or `customClass.icon`.
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
   * Custom CSS class name for popup padding.
   * @deprecated Inline style strings (e.g. '20px') cannot be set directly under strict CSP. Use `customClass.popup` or external CSS rules.
   */
  padding?: string;
  /**
   * Custom CSS class name for popup background.
   * @deprecated Inline color/image strings cannot be set directly under strict CSP. Use `theme`, CSS custom property `--cspa-bg`, or `customClass.popup`.
   */
  background?: string;
  /**
   * Controls backdrop overlay. Set to `false` to render a transparent backdrop (`cspa-backdrop-none`), or provide a custom CSS class name string.
   */
  backdrop?: boolean | string;
  theme?: CspAlertTheme;
  /**
   * Sets whether popup height is automatically calculated based on content. Set `false` to apply `cspa-no-height-auto`.
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
