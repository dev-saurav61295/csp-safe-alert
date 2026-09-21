# Migration from SweetAlert2 to CSP Safe Alert

This guide details how to migrate existing SweetAlert2 codebases to `csp-safe-alert`, explaining safe equivalents for dynamic inline styles and other CSP-specific architectural differences.

---

## 1. Quick Replacement

### Installation
```bash
npm install csp-safe-alert
```

### Loading External Stylesheet
In your HTML `<head>` (or main external stylesheet):
```html
<link rel="stylesheet" href="/node_modules/csp-safe-alert/dist/csp-safe-alert.css">
```

### API Import Change
```diff
- import Swal from 'sweetalert2';
+ import { CspAlert } from 'csp-safe-alert';

- const result = await Swal.fire({
+ const result = await CspAlert.fire({
    title: 'Hello World',
    icon: 'success',
  });
```

---

## 2. Option Equivalents & Differences

| SweetAlert2 Option | CSP Safe Alert Equivalent | Migration Notes |
|---|---|---|
| `title`, `titleText` | `title`, `titleText` | Direct match. Escaped via `textContent` for safety. |
| `text` | `text` | Direct match. Escaped via `textContent`. |
| `html` | `html` (HTMLElement / sanitized string) | If passing an `HTMLElement`, it is adopted cleanly. If passing a raw HTML string, register a sanitizer via `CspAlert.setSanitizer(DOMPurify.sanitize)` or pass plain text. |
| `icon` | `icon` | Direct match (`success`, `error`, `warning`, `info`, `question`). Built with pure inline SVGs, 0 external network requests. |
| `width: '600px'` | `width: 'cspa-width-lg'` or `customClass.popup` | **CSP Difference**: Arbitrary inline pixel strings are replaced by preset sizing classes (`cspa-width-sm`, `cspa-width-md`, `cspa-width-lg`, `cspa-width-xl`, `cspa-width-full`) or custom external CSS classes. |
| `background: '#1e293b'` | `theme: 'dark'` or `customClass.popup` | Arbitrary `background` is retained only for source compatibility and ignored. Use standard themes or external CSS classes. |
| `confirmButtonColor` | `confirmButtonVariant: 'primary'` | Use semantic variants (`primary`, `danger`, `secondary`, `success`, `warning`, `info`) or `customClass.confirmButton`. |
| `denyButtonColor` | `denyButtonVariant: 'danger'` | Use semantic variants or `customClass.denyButton`. |
| `cancelButtonColor` | `cancelButtonVariant: 'secondary'` | Use semantic variants or `customClass.cancelButton`. |
| `timer` | `timer` | Direct match. Managed by real elapsed-time clock engine. |
| `timerProgressBar` | `timerProgressBar` | Direct match. Built with native semantic `<progress>` element. |
| `input` | `input` | Direct match (`text`, `email`, `password`, `number`, `tel`, `url`, `search`, `textarea`, `select`, `radio`, `checkbox`, `range`, `file`). |
| `inputValidator` | `inputValidator` | Direct match (supports sync or async functions). |
| `beforeConfirm` | `beforeConfirm` | Direct match (supports sync or async promises, with loading spinner and duplicate click prevention). |
| `customClass` | `customClass` | Live updates replace the caller-supplied class for each updated target; clear with an empty string. Required `cspa-*` classes are preserved. |
| `mixin` | `mixin` | Direct match. |
| `queue` | `queue` | Direct match; browser IIFE exposes it on `CspAlert.queue`. |

---

## 3. CSP Styling Migration Notes

SweetAlert2's arbitrary runtime `padding`, `background`, and `iconColor` values are not accepted as runtime styles by CSP Safe Alert. These options are deprecated and ignored. Move those values into an external stylesheet and reference the stylesheet through `customClass.popup` or `customClass.icon`. `heightAuto` remains supported through CSP-safe document classes.

## 4. Code Migration Examples

### Example A: Confirmation Modal
#### SweetAlert2
```javascript
Swal.fire({
  title: 'Are you sure?',
  text: 'You will not be able to recover this file!',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes, delete it!',
  confirmButtonColor: '#d33',
  cancelButtonText: 'No, keep it',
}).then((result) => {
  if (result.isConfirmed) {
    // Delete file
  }
});
```

#### CSP Safe Alert
```javascript
const result = await CspAlert.fire({
  title: 'Are you sure?',
  text: 'You will not be able to recover this file!',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes, delete it!',
  confirmButtonVariant: 'danger',
  cancelButtonText: 'No, keep it',
  focusCancel: true,
});

if (result.isConfirmed) {
  // Delete file
}
```

---

### Example B: Asynchronous Action with Input & Validation
#### SweetAlert2
```javascript
Swal.fire({
  title: 'Enter your IP address',
  input: 'text',
  inputLabel: 'Your IP address',
  showCancelButton: true,
  inputValidator: (value) => {
    if (!value) return 'You need to write something!';
  },
  preConfirm: async (ip) => {
    const res = await fetch(`https://api.example.com/ip/${ip}`);
    return res.json();
  }
});
```

#### CSP Safe Alert
```javascript
const result = await CspAlert.fire({
  title: 'Enter your IP address',
  input: 'text',
  inputLabel: 'Your IP address',
  showCancelButton: true,
  inputValidator: (value) => {
    if (!value) return 'You need to write something!';
  },
  beforeConfirm: async (ip) => {
    const res = await fetch(`https://api.example.com/ip/${ip}`);
    return res.json();
  }
});

if (result.isConfirmed) {
  console.log('API response:', result.value);
}
```
