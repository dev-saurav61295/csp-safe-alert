# Testing Guide: CSP Safe Alert

This document describes the test strategy, execution commands, and negative control verification for `csp-safe-alert`.

## 1. Test Architecture

The test matrix consists of four dedicated verification layers:
1. **Unit Tests (`tests/unit/`)**: Runs in Vitest with Happy-DOM, testing option normalization, prototype pollution safety, URL allowlist parsing, input factory states, timer clock mechanics, and lifecycle hooks.
2. **Strict CSP Tests (`tests/csp/`)**: Serves real HTTP pages with enforced strict CSP response headers:
   ```http
   Content-Security-Policy: default-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self'; style-src-attr 'none'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
   ```
   Captures `securitypolicyviolation` events to assert 0 violations and scans DOM to assert 0 inline `style` attributes.
3. **Accessibility Audits (`tests/accessibility/`)**: Runs automated WCAG 2.2 AA audits using `@axe-core/playwright` across modal dialogs, alertdialogs, form inputs, validation error live-region states, dark theme, and high-contrast modes.
4. **Browser Interaction Tests (`tests/browser/`)**: Verifies Tab/Shift+Tab focus trapping within modal boundaries, initial focus targeting, Escape key dismissal, backdrop dismissal, async `beforeConfirm` loading state, and sequential queues across Chromium, Firefox, and WebKit.

## 2. Test Commands

```bash
# Run all unit tests
npm run test:unit

# Run strict CSP tests in real browsers
npm run test:csp

# Run automated Axe-core accessibility checks
npm run test:a11y

# Run end-to-end browser interaction tests
npm run test:browser

# Run full comprehensive test suite
npm test
```

## 3. Negative Control Verification
The test harness includes an isolated negative control page (`tests/fixtures/negative-control.html`) that attempts forbidden inline style mutations. The test asserts that `securitypolicyviolation` events are triggered as expected, proving that the HTTP server and browser are actively enforcing the CSP policy.
