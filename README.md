# CSP Safe Alert (`csp-safe-alert`)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![WCAG 2.2](https://img.shields.io/badge/WCAG-2.2%20AA%20oriented-blue.svg)](https://www.w3.org/TR/WCAG22/)
[![Strict CSP](https://img.shields.io/badge/CSP-Strict%20Compatible-brightgreen.svg)](https://www.w3.org/TR/CSP3/)

**Accessible alerts and dialogs for strict Content Security Policy environments.**

A production-quality, framework-independent JavaScript / TypeScript popup and toast notification library designed from the ground up for strict Content Security Policy (`style-src 'self'`, `script-src 'self'`, `unsafe-inline`-free) and a WCAG 2.2 Level AA-oriented accessibility implementation. Automated accessibility checks are provided; complete WCAG conformance remains dependent on host integration and required manual assistive-technology testing.

---

## Features

- 🛡️ **Strict Content Security Policy (CSP)**: Zero runtime inline styles (`element.style.*`), zero `<style>` tag injections, zero `unsafe-inline`, zero `unsafe-eval`.
- ♿ **WCAG 2.2 Level AA-oriented accessibility**: Focus trapping, automated initial focus routing, focus restoration upon closing, `aria-modal`, `role="dialog"` vs `role="alertdialog"`, and `aria-live` error announcements. Complete conformance remains dependent on host integration and manual assistive-technology testing.
- ⚡ **Zero Runtime Dependencies**: Ultra-lightweight core with 0 external dependencies.
- 🎨 **Rich Modern Styling**: External CSS design tokens for Light, Dark, High-Contrast, and Borderless themes, sizing presets, toast layouts, and built-in SVGs without network downloads.
- 🔄 **SweetAlert2-Inspired Developer Experience**: Familiar, declarative API with support for confirmations, destructive prompts, input controls (13 types), async pre-confirm loaders, validation pipelines, queues, mixins, and wall-clock timers, designed natively without inline styles.
- 📦 **Multi-Format Distribution**: Ships ESM, CommonJS, IIFE browser script, static CSS stylesheet, and full TypeScript declarations.
- 🔧 **Live Updates**: `CspAlert.update()` can add/remove confirm, deny, and cancel buttons, replace supported caller classes, and preserve loading/focus state.

---

## Installation

```bash
npm install csp-safe-alert
```

### 1. Load the External Stylesheet

Because `csp-safe-alert` strictly prohibits runtime inline style injection, the external stylesheet must be linked in your HTML `<head>`:

```html
<link rel="stylesheet" href="/node_modules/csp-safe-alert/dist/csp-safe-alert.css">
```

Or imported in your application bundler:
```typescript
import 'csp-safe-alert/styles.css';
```

---

## Quick Start

### Basic Alert
```typescript
import { CspAlert } from 'csp-safe-alert';

await CspAlert.fire({
  title: 'Success!',
  text: 'Your settings have been saved.',
  icon: 'success',
});
```

### Confirmation Dialog
```typescript
const result = await CspAlert.fire({
  title: 'Delete this project?',
  text: 'This action cannot be undone.',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Delete project',
  confirmButtonVariant: 'danger',
  cancelButtonText: 'Keep project',
  focusCancel: true, // Safe default for destructive actions
});

if (result.isConfirmed) {
  // Proceed with deletion
}
```

### Interactive Input with Validation
```typescript
const result = await CspAlert.fire({
  title: 'Enter your email',
  input: 'email',
  inputPlaceholder: 'name@example.com',
  showCancelButton: true,
  inputValidator: (value) => {
    if (!value || !value.includes('@')) {
      return 'Please provide a valid email address.';
    }
    return null;
  },
});

if (result.isConfirmed) {
  console.log('User email:', result.value);
}
```

### Async Operations with Loading Spinner
> **Note:** Performing network requests inside `beforeConfirm` requires an appropriate CSP `connect-src` policy allowing your target API endpoint (e.g., `connect-src 'self' https://api.example.com`). It cannot run under `connect-src 'none'`.

```typescript
const result = await CspAlert.fire({
  title: 'Process Transaction',
  showCancelButton: true,
  confirmButtonText: 'Pay $49.00',
  beforeConfirm: async () => {
    const response = await fetch('/api/pay', { method: 'POST' });
    if (!response.ok) {
      throw new Error('Payment processing failed. Please retry.');
    }
    return response.json();
  },
});

if (result.isConfirmed) {
  console.log('Payment result:', result.value);
}
```

### Non-Modal Toast Notifications
```typescript
const Toast = CspAlert.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

Toast.fire({
  icon: 'success',
  title: 'Changes copied to clipboard',
});
```

---

## Content Security Policy (CSP) & Trust Boundaries

`csp-safe-alert` is verified against the following strict HTTP response header:

```http
Content-Security-Policy: default-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self'; style-src-attr 'none'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

- **0 `securitypolicyviolation` events** generated during all modal, toast, and input operations.
- **0 inline style mutations** (`element.style.*` or `style="..."` attributes) across the entire DOM tree.
- Built-in SVGs and native `<progress>` elements ensure zero inline styling conflicts.
- **Trust Boundaries**: Caller-provided text strings are safely escaped via `textContent`. If passing raw HTML strings via `html` or `iconHtml`, register an external sanitizer via `CspAlert.setSanitizer(DOMPurify.sanitize)` to maintain security boundaries. Dynamic caller-supplied DOM nodes and callbacks are executed within the application context.


---

## CSP styling limitations

The default build never writes runtime inline CSS. `heightAuto` is implemented with external `.cspa-height-auto` classes on the document root/body and those classes are removed on teardown. The arbitrary SweetAlert2-style `padding`, `background`, and `iconColor` string options are retained only for source compatibility and are **deprecated/ignored** under the strict CSP contract. Use `customClass.popup`, `customClass.icon`, built-in themes, or consumer-authored external CSS instead.

`customClass` updates are live for supported rendered targets. Updating a target replaces the caller-supplied classes for that target; use an empty string such as `customClass: { popup: '' }` to clear a target. Required `cspa-*` library classes are preserved.

The browser IIFE exposes the same API namespace as the module build, including `CspAlert.fire`, `CspAlert.mixin`, and `CspAlert.queue`.

## Documentation Links

- [Reference Baseline (SweetAlert2 Audit)](docs/reference-baseline.md)
- [Requirements Specification](docs/requirements.md)
- [Feature Parity Matrix](docs/feature-parity.md)
- [Architecture & Design](docs/architecture.md)
- [CSP Design Decisions & Dynamic Styling](docs/csp-design-decisions.md)
- [Security Model & Threat Assessment](docs/security.md)
- [WCAG 2.2 Accessibility Matrix](docs/accessibility-matrix.md)
- [API Reference](docs/api.md)
- [Migration from SweetAlert2 Guide](docs/migration-from-sweetalert2.md)
- [Testing Architecture & Negative Controls](docs/testing.md)
- [Test Results & Verification Evidence](docs/test-results.md)
- [Implementation Status](docs/implementation-status.md)
- [Release Readiness Checklist](docs/release-checklist.md)

---

## License

MIT © 2026 CSP Safe Alert Contributors
