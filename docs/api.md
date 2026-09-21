# CSP Safe Alert — API Reference

## 1. Importing

### ESM (Bundlers / Modern Browsers)
```typescript
import { CspAlert } from 'csp-safe-alert';
// Ensure 'csp-safe-alert/styles.css' or 'csp-safe-alert/dist/csp-safe-alert.css' is included in your external stylesheet link
```

### Browser Script Tag (IIFE)
```html
<link rel="stylesheet" href="/path/to/csp-safe-alert.css">
<script src="/path/to/csp-safe-alert.global.js"></script>
```

---

## 2. Public Static Methods

### `CspAlert.fire(options)` / `CspAlert.fire(title, textOrHtml, icon)`
Fires an alert modal or toast with the given options.
- **Returns**: `Promise<CspAlertResult<T>>`

```typescript
const result = await CspAlert.fire({
  title: 'Delete Item?',
  text: 'This action is irreversible.',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Delete',
  confirmButtonVariant: 'danger',
  cancelButtonText: 'Cancel',
});

if (result.isConfirmed) {
  // Action confirmed
} else if (result.isDenied) {
  // Action denied
} else if (result.isDismissed) {
  console.log('Dismissed because:', result.dismiss); // 'cancel' | 'backdrop' | 'close' | 'esc' | 'timer'
}
```

### `CspAlert.close(result?)`
Closes the active dialog or toast immediately, optionally settling with a specific `CspAlertResult`.

### `CspAlert.isVisible()`
Returns `true` if a popup is currently open and visible in the DOM.

### `CspAlert.showLoading()` / `CspAlert.hideLoading()` / `CspAlert.isLoading()`
Toggles loading spinner inside the confirm button and disables all action buttons to prevent duplicate submission.

### `CspAlert.getPopup()`, `CspAlert.getTitle()`, `CspAlert.getHtmlContainer()`, `CspAlert.getInput()`, `CspAlert.getConfirmButton()`, `CspAlert.getDenyButton()`, `CspAlert.getCancelButton()`, `CspAlert.getCloseButton()`, `CspAlert.getFooter()`, `CspAlert.getTimerProgressBar()`, `CspAlert.getValidationMessage()`
Direct DOM element getters for active dialog nodes.

### `CspAlert.showValidationMessage(message)` / `CspAlert.resetValidationMessage()`
Displays or clears an accessible validation error on the active form input and announces it to screen readers.

### `CspAlert.getTimerLeft()`, `CspAlert.stopTimer()`, `CspAlert.resumeTimer()`, `CspAlert.toggleTimer()`, `CspAlert.isTimerRunning()`, `CspAlert.increaseTimer(ms)`
Controls the active wall-clock timer engine.

### `CspAlert.update(options)`
Updates supported options on the currently open dialog.

Dynamic `showConfirmButton`, `showDenyButton`, and `showCancelButton` changes add/remove real buttons and attach their normal handlers. If the removed button owns focus, focus moves to another available action/input or the popup. Loading state is preserved, and newly created buttons are disabled while loading.

Supported `customClass` targets are updated in the live DOM. For a target that is present, a new class replaces the caller-supplied class from the previous update while required `cspa-*` classes remain. Clear a target explicitly with an empty string, for example `CspAlert.update({ customClass: { popup: '' } })`.

The strict CSP contract intentionally does not apply arbitrary runtime CSS values. `padding`, `background`, and `iconColor` are deprecated and ignored; use external CSS through `customClass` or built-in theme/variant options. `heightAuto` is supported through external `.cspa-height-auto` classes rather than inline styles.

### `CspAlert.mixin(presetOptions)`

The generated browser IIFE exposes this method on the `CspAlert` namespace as well as the ESM/CommonJS class. Mixin calls share the same active-instance lifecycle as `CspAlert`.

The generated browser IIFE exposes this method on the `CspAlert` namespace as well as the ESM/CommonJS class. Mixin calls share the same active-instance lifecycle as `CspAlert`.
Creates a customized, reusable subclass with preset options.

```typescript
const Toast = CspAlert.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

Toast.fire({ icon: 'success', title: 'Signed in successfully' });
```

### `CspAlert.queue(steps)`

The generated browser IIFE exposes this method on the same `CspAlert` namespace. Queue steps execute through the same underlying active-instance state.

The generated browser IIFE exposes this method on the same `CspAlert` namespace. Queue steps execute through the same underlying active-instance state.
Runs a sequence of dialogs in succession, halting if the user cancels or dismisses.

### `CspAlert.setSanitizer(sanitizerFunction)`
Registers an optional HTML sanitizer (such as DOMPurify) for parsing string HTML content safely.

---

## 3. Options (`CspAlertOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `undefined` | Dialog title heading (inserted safely via `textContent`) |
| `titleText` | `string` | `undefined` | Alias for `title` |
| `text` | `string` | `undefined` | Dialog description body |
| `html` | `string \| HTMLElement \| DocumentFragment` | `undefined` | Rich content or adopted DOM node |
| `icon` | `'success' \| 'error' \| 'warning' \| 'info' \| 'question'` | `undefined` | Built-in accessible SVG icon |
| `iconHtml` | `string \| HTMLElement` | `undefined` | Custom icon content |
| `footer` | `string \| HTMLElement` | `undefined` | Supplementary footer text or node |
| `imageUrl` | `string` | `undefined` | Custom image URL (validated for safe schemes) |
| `imageAlt` | `string` | `''` | Accessible alt text for custom image |
| `imageWidth` / `imageHeight` | `number \| string` | `undefined` | Image dimension attributes |
| `toast` | `boolean` | `false` | When `true`, renders as non-modal toast |
| `target` | `HTMLElement \| string` | `document.body` | DOM container to mount popup into |
| `position` | `CspAlertPosition` | `'center'` (or `'top-end'` for toasts) | Placement alignment |
| `grow` | `'row' \| 'column' \| 'fullscreen' \| false` | `false` | Sizing expansion mode |
| `theme` | `'light' \| 'dark' \| 'high-contrast' \| 'borderless' \| 'auto'` | `'auto'` | Visual theme |
| `input` | `CspAlertInput` | `undefined` | Input type (`text`, `email`, `password`, `number`, `tel`, `url`, `search`, `textarea`, `select`, `radio`, `checkbox`, `range`, `file`) |
| `inputLabel` | `string` | `undefined` | Accessible label for the input control |
| `inputPlaceholder` | `string` | `undefined` | Placeholder text |
| `inputValue` | `any \| Promise<any>` | `undefined` | Initial input value (sync or async) |
| `inputOptions` | `Record<string, string> \| Map<string, string>` | `undefined` | Key-value options for `select` and `radio` |
| `inputAutoTrim` | `boolean` | `true` | Automatically trims whitespace on text inputs |
| `inputAttributes` | `Record<string, string>` | `undefined` | Safe allowlisted HTML attributes |
| `inputValidator` | `(value) => string \| null \| Promise<string \| null>` | `undefined` | Synchronous or asynchronous validator |
| `showConfirmButton` | `boolean` | `true` | Toggles confirm button |
| `showDenyButton` | `boolean` | `false` | Toggles deny button |
| `showCancelButton` | `boolean` | `false` | Toggles cancel button |
| `confirmButtonText` | `string` | `'OK'` | Label for confirm button |
| `denyButtonText` | `string` | `'No'` | Label for deny button |
| `cancelButtonText` | `string` | `'Cancel'` | Label for cancel button |
| `confirmButtonVariant` | `CspAlertButtonVariant` | `'primary'` | Semantic button variant (`primary`, `danger`, `secondary`, `success`, `warning`, `info`) |
| `denyButtonVariant` | `CspAlertButtonVariant` | `'danger'` | Semantic button variant |
| `cancelButtonVariant` | `CspAlertButtonVariant` | `'secondary'` | Semantic button variant |
| `confirmButtonAriaLabel` / `denyButtonAriaLabel` / `cancelButtonAriaLabel` | `string` | `undefined` | Accessible ARIA labels |
| `focusConfirm` / `focusDeny` / `focusCancel` | `boolean` | `true` for confirm | Determines initial keyboard focus |
| `returnFocus` | `boolean` | `true` | Restores focus to trigger element upon closing |
| `showCloseButton` | `boolean` | `false` | Displays top-right '×' close button |
| `closeButtonAriaLabel` | `string` | `'Close dialog'` | Accessible label for close button |
| `allowOutsideClick` | `boolean \| (() => boolean)` | `true` | Dismisses on backdrop click |
| `allowEscapeKey` | `boolean \| (() => boolean)` | `true` | Dismisses on Escape key |
| `allowEnterKey` | `boolean \| (() => boolean)` | `true` | Submits on Enter key in single-line inputs |
| `stopKeydownPropagation` | `boolean` | `false` | Stops keydown event bubbling |
| `timer` | `number` | `undefined` | Auto-dismiss timeout in milliseconds |
| `timerProgressBar` | `boolean` | `false` | Displays native `<progress>` timer indicator |
| `customClass` | `CspAlertCustomClass` | `undefined` | External CSS class hooks |
| `beforeConfirm` | `(inputValue) => any \| Promise<any>` | `undefined` | Pre-confirm async hook |
| `beforeDeny` | `(inputValue) => any \| Promise<any>` | `undefined` | Pre-deny async hook |
| `willOpen` / `didOpen` / `didRender` / `willClose` / `didClose` / `didDestroy` | `(popup) => void` | `undefined` | Lifecycle hooks |
