# Feature Parity Matrix: SweetAlert2 vs CSP Safe Alert

This document provides a comprehensive mapping of every SweetAlert2 (v11.17.2) feature, option, method, and lifecycle hook to `CspAlert`.

## 1. Public Options Mapping

| Requirement ID | Upstream Option | Baseline Behavior | CSP Safe Alert API | Implementation Approach | Security / A11y Notes | Status |
|---|---|---|---|---|---|---|
| PAR-OPT-01 | `title` | Sets dialog heading | `title: string` | Text node insertion via `textContent` | XSS-safe | Implemented |
| PAR-OPT-02 | `titleText` | Plain text title | `titleText: string` | Alias for `title` | XSS-safe | Implemented |
| PAR-OPT-03 | `text` | Body text | `text: string` | Safe DOM text node | XSS-safe | Implemented |
| PAR-OPT-04 | `html` | HTML content | `html: string \| HTMLElement \| DocumentFragment` | Safe adoption for Elements; optional sanitizer adapter for strings | Script execution prevented | Safe equivalent |
| PAR-OPT-05 | `icon` | Icon type | `icon: 'success' \| 'error' \| 'warning' \| 'info' \| 'question'` | Pure SVG/CSS external markup | No remote downloads | Implemented |
| PAR-OPT-06 | `iconColor` | Inline color for icon | `iconColor: string` (deprecated/ignored) / `customClass.icon` | External class or theme token; arbitrary runtime value is intentionally not applied | No inline styles | Safe equivalent |
| PAR-OPT-07 | `iconHtml` | Custom icon markup | `iconHtml: HTMLElement \| string` | DOM element adoption or safe text | No unescaped injection | Safe equivalent |
| PAR-OPT-08 | `showConfirmButton` | Toggles confirm button | `showConfirmButton: boolean` | Conditional DOM rendering | Fully accessible | Implemented |
| PAR-OPT-09 | `showDenyButton` | Toggles deny button | `showDenyButton: boolean` | Conditional DOM rendering | Fully accessible | Implemented |
| PAR-OPT-10 | `showCancelButton` | Toggles cancel button | `showCancelButton: boolean` | Conditional DOM rendering | Fully accessible | Implemented |
| PAR-OPT-11 | `confirmButtonText` | Confirm button label | `confirmButtonText: string` | Text node insertion | Matches accessible name | Implemented |
| PAR-OPT-12 | `denyButtonText` | Deny button label | `denyButtonText: string` | Text node insertion | Matches accessible name | Implemented |
| PAR-OPT-13 | `cancelButtonText` | Cancel button label | `cancelButtonText: string` | Text node insertion | Matches accessible name | Implemented |
| PAR-OPT-14 | `confirmButtonColor` | Inline color for confirm | `confirmButtonVariant` / `customClass` | Predefined variant classes (`primary`, `danger`, etc.) | CSP-safe | Safe equivalent |
| PAR-OPT-15 | `denyButtonColor` | Inline color for deny | `denyButtonVariant` / `customClass` | Predefined variant classes | CSP-safe | Safe equivalent |
| PAR-OPT-16 | `cancelButtonColor` | Inline color for cancel | `cancelButtonVariant` / `customClass` | Predefined variant classes | CSP-safe | Safe equivalent |
| PAR-OPT-17 | `confirmButtonAriaLabel` | ARIA label for confirm | `confirmButtonAriaLabel: string` | Sets `aria-label` attribute | Screen reader support | Implemented |
| PAR-OPT-18 | `denyButtonAriaLabel` | ARIA label for deny | `denyButtonAriaLabel: string` | Sets `aria-label` attribute | Screen reader support | Implemented |
| PAR-OPT-19 | `cancelButtonAriaLabel` | ARIA label for cancel | `cancelButtonAriaLabel: string` | Sets `aria-label` attribute | Screen reader support | Implemented |
| PAR-OPT-20 | `focusConfirm` | Autofocus confirm button | `focusConfirm: boolean` | Focus manager on open | Standard dialog pattern | Implemented |
| PAR-OPT-21 | `focusDeny` | Autofocus deny button | `focusDeny: boolean` | Focus manager on open | Standard dialog pattern | Implemented |
| PAR-OPT-22 | `focusCancel` | Autofocus cancel button | `focusCancel: boolean` | Focus manager on open | Crucial for destructive confirmations | Implemented |
| PAR-OPT-23 | `input` | Input type | `input: CspAlertInput` | Full input suite (text, email, password, select, radio, checkbox, file, etc.) | Standard labels & error IDs | Implemented |
| PAR-OPT-24 | `inputLabel` | Accessible label for input | `inputLabel: string` | Label element linked via `for` and `id` | WCAG 1.3.1 / 4.1.2 | Implemented |
| PAR-OPT-25 | `inputPlaceholder` | Input placeholder | `inputPlaceholder: string` | Sets `placeholder` attribute | Safe attribute | Implemented |
| PAR-OPT-26 | `inputValue` | Initial input value | `inputValue: any \| Promise<any>` | Resolves initial value safely | Value sanitized | Implemented |
| PAR-OPT-27 | `inputOptions` | Options for select/radio | `inputOptions: Record<string, string> \| Map<string, string>` | Builds option elements cleanly | Sanitized keys/values | Implemented |
| PAR-OPT-28 | `inputAutoTrim` | Trims string input | `inputAutoTrim: boolean` | Safe JS trimming on extract | Default: `true` | Implemented |
| PAR-OPT-29 | `inputAttributes` | Custom attributes on input | `inputAttributes: Record<string, string>` | Allowlisted attribute setters (no `style`, no `on*`) | Injection protection | Implemented |
| PAR-OPT-30 | `inputValidator` | Sync/async validation | `inputValidator: (val) => string \| null \| Promise<string \| null>` | Error container + `aria-errormessage` | Live region announcement | Implemented |
| PAR-OPT-31 | `timer` | Auto close timeout in ms | `timer: number` | Real elapsed-time engine | Resilient to background tab pause | Implemented |
| PAR-OPT-32 | `timerProgressBar` | Visual progress bar for timer | `timerProgressBar: boolean` | Native `<progress>` element | Native attribute updates | Implemented |
| PAR-OPT-33 | `toast` | Non-modal toast mode | `toast: boolean` | Toast container class & positioning | `role="status"` / `role="alert"` | Implemented |
| PAR-OPT-34 | `position` | Dialog / toast alignment | `position: CspAlertPosition` | External positioning classes (`cspa-pos-*`) | CSS grid/flex | Implemented |
| PAR-OPT-35 | `width` | Dialog width | `width: string` / `sizePreset` | Preset classes (`cspa-width-*`) or custom external CSS | Zero inline styling | Safe equivalent |
| PAR-OPT-36 | `padding` | Dialog padding | `padding: string` (deprecated/ignored) / `customClass` | Consumer-authored external CSS class | Zero inline styling | Safe equivalent |
| PAR-OPT-37 | `background` | Dialog background | `background: string` (deprecated/ignored) / `theme` / `customClass` | Theme tokens or consumer-authored external CSS class | Zero inline styling | Safe equivalent |
| PAR-OPT-38 | `backdrop` | Backdrop visibility / style | `backdrop: boolean \| string` | Static backdrop element + class | Fully accessible | Implemented |
| PAR-OPT-39 | `allowOutsideClick` | Dismiss on backdrop click | `allowOutsideClick: boolean \| (() => boolean)` | Event listener on container | Safe dismissal | Implemented |
| PAR-OPT-40 | `allowEscapeKey` | Dismiss on Escape key | `allowEscapeKey: boolean \| (() => boolean)` | Keydown handler (with IME check) | Safe dismissal | Implemented |
| PAR-OPT-41 | `showCloseButton` | Shows top-right 'X' button | `showCloseButton: boolean` | Accessible button with SVG icon | `aria-label="Close dialog"` | Implemented |
| PAR-OPT-42 | `customClass` | Custom class overrides | `customClass: Record<string, string>` | Live target replacement; empty string clears; required `cspa-*` classes are preserved | External CSS only | Verified |
| PAR-OPT-43 | `beforeConfirm` | Async pre-confirm action | `beforeConfirm: (val) => any \| Promise<any>` | Loading spinner + abort handling | Duplicate submission locked | Implemented |
| PAR-OPT-48 | `heightAuto` | Applies `height:auto !important` to document root/body | `heightAuto?: boolean` | External `.cspa-height-auto` classes with ownership-aware cleanup | No inline styles; host classes are restored | Verified |
| PAR-OPT-44 | `beforeDeny` | Async pre-deny action | `beforeDeny: (val) => any \| Promise<any>` | Loading spinner + abort handling | Duplicate submission locked | Implemented |
| PAR-OPT-45 | `returnFocus` | Restore focus on close | `returnFocus: boolean` | Focus manager stores & restores `activeElement` | Safe focus fallback | Implemented |
| PAR-OPT-46 | `didOpen` / `willOpen` | Open lifecycle hooks | `didOpen`, `willOpen` | Invoked cleanly during transition | Safe callback boundary | Implemented |
| PAR-OPT-47 | `didClose` / `willClose` | Close lifecycle hooks | `didClose`, `willClose` | Invoked cleanly during transition | Safe callback boundary | Implemented |

## 2. Public Methods Mapping

| Method | SweetAlert2 Signature | CspAlert Implementation | Status |
|---|---|---|---|
| `fire()` | `Swal.fire(options)` | `CspAlert.fire(options)` | Implemented |
| `close()` | `Swal.close()` | `CspAlert.close()` | Implemented |
| `isVisible()` | `Swal.isVisible()` | `CspAlert.isVisible()` | Implemented |
| `getPopup()` | `Swal.getPopup()` | `CspAlert.getPopup()` | Implemented |
| `getTitle()` | `Swal.getTitle()` | `CspAlert.getTitle()` | Implemented |
| `getHtmlContainer()` | `Swal.getHtmlContainer()` | `CspAlert.getHtmlContainer()` | Implemented |
| `getInput()` | `Swal.getInput()` | `CspAlert.getInput()` | Implemented |
| `getConfirmButton()` | `Swal.getConfirmButton()` | `CspAlert.getConfirmButton()` | Implemented |
| `getDenyButton()` | `Swal.getDenyButton()` | `CspAlert.getDenyButton()` | Implemented |
| `getCancelButton()` | `Swal.getCancelButton()` | `CspAlert.getCancelButton()` | Implemented |
| `getCloseButton()` | `Swal.getCloseButton()` | `CspAlert.getCloseButton()` | Implemented |
| `getFooter()` | `Swal.getFooter()` | `CspAlert.getFooter()` | Implemented |
| `getTimerProgressBar()` | `Swal.getTimerProgressBar()` | `CspAlert.getTimerProgressBar()` | Implemented |
| `showLoading()` | `Swal.showLoading()` | `CspAlert.showLoading()` | Implemented |
| `hideLoading()` | `Swal.hideLoading()` | `CspAlert.hideLoading()` | Implemented |
| `isLoading()` | `Swal.isLoading()` | `CspAlert.isLoading()` | Implemented |
| `clickConfirm()` | `Swal.clickConfirm()` | `CspAlert.clickConfirm()` | Implemented |
| `clickDeny()` | `Swal.clickDeny()` | `CspAlert.clickDeny()` | Implemented |
| `clickCancel()` | `Swal.clickCancel()` | `CspAlert.clickCancel()` | Implemented |
| `showValidationMessage()` | `Swal.showValidationMessage(msg)` | `CspAlert.showValidationMessage(msg)` | Implemented |
| `resetValidationMessage()` | `Swal.resetValidationMessage()` | `CspAlert.resetValidationMessage()` | Implemented |
| `getValidationMessage()` | `Swal.getValidationMessage()` | `CspAlert.getValidationMessage()` | Implemented |
| `getTimerLeft()` | `Swal.getTimerLeft()` | `CspAlert.getTimerLeft()` | Implemented |
| `stopTimer()` | `Swal.stopTimer()` | `CspAlert.stopTimer()` | Implemented |
| `resumeTimer()` | `Swal.resumeTimer()` | `CspAlert.resumeTimer()` | Implemented |
| `toggleTimer()` | `Swal.toggleTimer()` | `CspAlert.toggleTimer()` | Implemented |
| `isTimerRunning()` | `Swal.isTimerRunning()` | `CspAlert.isTimerRunning()` | Implemented |
| `increaseTimer()` | `Swal.increaseTimer(n)` | `CspAlert.increaseTimer(n)` | Implemented |
| `update()` | `Swal.update(options)` | `CspAlert.update(options)` | Implemented |
| `mixin()` | `Swal.mixin(options)` | `CspAlert.mixin(options)` | Implemented |
| `queue()` | `Swal.queue(steps)` | `CspAlert.queue(steps)` | Implemented |
