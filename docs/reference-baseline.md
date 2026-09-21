# Reference Baseline: SweetAlert2 & Standard Specifications

## 1. Pinned Reference Baseline

- **Upstream Package**: `sweetalert2`
- **Pinned Version**: `11.17.2` (frozen project comparison baseline)
- **Current Upstream Latest Checked**: `11.26.25` on 2026-09-21; the parity matrix intentionally remains pinned to `11.17.2` so this release-gap audit is reproducible rather than moving with upstream.
- **Reference Commit / Release**: `v11.17.2` (published 2025-02-16; verified against published package/version listings)
- **Audit Access Date**: 2026-09-21
- **Public API Declarations Source**: [sweetalert2.d.ts](https://github.com/sweetalert2/sweetalert2/blob/main/sweetalert2.d.ts)
- **License**: MIT (SweetAlert2 - Tristan Edwards & Limon Monte)

## 2. Standard Specifications & Guidelines

- **W3C Content Security Policy Level 3 (CSP3)**: [https://www.w3.org/TR/CSP3/](https://www.w3.org/TR/CSP3/)
- **W3C Trusted Types Level 1**: [https://www.w3.org/TR/trusted-types/](https://www.w3.org/TR/trusted-types/)
- **W3C Web Content Accessibility Guidelines (WCAG) 2.2**: [https://www.w3.org/TR/WCAG22/](https://www.w3.org/TR/WCAG22/)
- **WAI-ARIA 1.2 Authoring Practices Guide (APG)**:
  - Modal Dialog Pattern: [https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  - Alert Dialog Pattern: [https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)
  - Alert Pattern: [https://www.w3.org/WAI/ARIA/apg/patterns/alert/](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

## 3. SweetAlert2 Public API Inventory

### 3.1 Public Methods
| Method Name | Signature / Description |
|---|---|
| `fire(options)` / `fire(title, html, icon)` | Opens a modal popup or toast with given parameters, returns Promise resolving to `SweetAlertResult` |
| `close()` / `close(result)` | Closes the currently active popup |
| `isVisible()` | Returns `true` if a popup is currently mounted and visible |
| `getPopup()` | Returns the active `.swal2-popup` DOM element or `null` |
| `getTitle()` | Returns the title DOM element |
| `getHtmlContainer()` | Returns the content/HTML container DOM element |
| `getImage()` | Returns the custom image element |
| `getIcon()` | Returns the icon container element |
| `getIconContent()` | Returns the icon content element |
| `getInput()` | Returns the active input element |
| `getActions()` | Returns the button actions container |
| `getConfirmButton()` | Returns the confirm button element |
| `getDenyButton()` | Returns the deny button element |
| `getCancelButton()` | Returns the cancel button element |
| `getCloseButton()` | Returns the 'x' close button element |
| `getFooter()` | Returns the footer element |
| `getTimerProgressBar()` | Returns the timer progress bar element |
| `showLoading()` | Shows loading spinner on confirm button, disables buttons |
| `hideLoading()` | Restores buttons from loading state |
| `isLoading()` | Checks if the dialog is in loading state |
| `clickConfirm()` | Programmatically triggers confirm button click |
| `clickDeny()` | Programmatically triggers deny button click |
| `clickCancel()` | Programmatically triggers cancel button click |
| `showValidationMessage(msg)` | Displays a validation error message in the popup |
| `resetValidationMessage()` | Clears the validation error message |
| `getValidationMessage()` | Returns the validation message container |
| `getTimerLeft()` | Returns remaining milliseconds for timer |
| `stopTimer()` | Pauses the running timer |
| `resumeTimer()` | Resumes a paused timer |
| `toggleTimer()` | Toggles pause/resume on timer |
| `isTimerRunning()` | Returns whether timer is actively running |
| `increaseTimer(n)` | Adds `n` milliseconds to timer |
| `update(options)` | Updates current popup options dynamically |
| `mixin(options)` | Creates a new instance with default preset options |

### 3.2 Public Options (Summary)
- **Content**: `title`, `titleText`, `html`, `text`, `icon`, `iconColor`, `iconHtml`, `showClass`, `hideClass`, `footer`, `imageUrl`, `imageWidth`, `imageHeight`, `imageAlt`.
- **Inputs**: `input`, `inputLabel`, `inputPlaceholder`, `inputValue`, `inputOptions`, `inputAutoTrim`, `inputAttributes`, `inputValidator`.
- **Actions**: `showConfirmButton`, `showDenyButton`, `showCancelButton`, `confirmButtonText`, `denyButtonText`, `cancelButtonText`, `confirmButtonColor`, `denyButtonColor`, `cancelButtonColor`, `confirmButtonAriaLabel`, `denyButtonAriaLabel`, `cancelButtonAriaLabel`, `buttonsStyling`, `reverseButtons`, `focusConfirm`, `focusDeny`, `focusCancel`.
- **Behavior**: `timer`, `timerProgressBar`, `showCloseButton`, `closeButtonHtml`, `closeButtonAriaLabel`, `allowOutsideClick`, `allowEscapeKey`, `allowEnterKey`, `stopKeydownPropagation`, `keydownListenerCapture`.
- **Modality & Container**: `toast`, `target`, `position`, `grow`, `width`, `padding`, `background`, `backdrop`, `heightAuto`, `scrollbarPadding`.
- **Lifecycle & Async**: `didOpen`, `didRender`, `willOpen`, `willClose`, `didClose`, `didDestroy`, `beforeConfirm`, `beforeDeny`, `returnFocus`.
- **Custom Classes**: `customClass` (container, popup, header, title, closeButton, icon, image, htmlContainer, input, inputLabel, validationMessage, actions, confirmButton, denyButton, cancelButton, loader, footer, timerProgressBar).

### 3.3 Result Contract (`SweetAlertResult`)
- `isConfirmed: boolean`
- `isDenied: boolean`
- `isDismissed: boolean`
- `value?: any` (Value returned from input or `beforeConfirm`)
- `dismiss?: DismissReason` (`backdrop`, `cancel`, `close`, `esc`, `timer`)
