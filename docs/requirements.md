# CSP Safe Alert — Requirements Specification

This document defines the traceable functional, security, accessibility, and architectural requirements for `csp-safe-alert`.

## 1. Traceable Requirements Inventory

### 1.1 Security & CSP Architecture (SEC)
- **REQ-SEC-01 (Strict CSP Compliance)**: The library must function without requiring `unsafe-inline` or `unsafe-eval` in `script-src` and `style-src`. No `style-src-attr` permissions are required.
- **REQ-SEC-02 (Zero Inline Style Mutation)**: The library must not inject `<style>` tags, alter `style.cssText`, write to `element.style.*`, or set `style="..."` attributes on any element.
- **REQ-SEC-03 (Safe Content Construction)**: All string titles, text bodies, labels, and validation messages must be inserted via safe DOM APIs (`textContent`, `createElement`, `createTextNode`) to prevent XSS.
- **REQ-SEC-04 (Structured Rich Content / Safe DOM Adoption)**: When HTML/rich content is needed, consumer-provided DOM Elements (`HTMLElement` / `DocumentFragment`) are safely adopted or cleaned up; optional sanitizer adapter is supported for sanitized markup.
- **REQ-SEC-05 (Attribute & URL Whitelist)**: Input attributes and image URLs are strictly filtered. Remote JavaScript URLs (`javascript:`) and inline event handlers (`onclick`, etc.) are blocked.
- **REQ-SEC-06 (Zero Untrusted Network Activity)**: The core library has 0 external network requests, 0 remote font/icon loads, and 0 runtime telemetry.

### 1.2 Modal & Toast Capabilities (MOD)
- **REQ-MOD-01 (Dialog Roles & Types)**: Supports modal dialogs (`role="dialog"` or `role="alertdialog"`) and non-modal toasts (`role="alert"` / `role="status"`).
- **REQ-MOD-02 (Positions & Mounting)**: Supports standard modal placement (center, top, top-start, top-end, bottom, etc.) and custom container targets via external CSS layout classes.
- **REQ-MOD-03 (Icons)**: Built-in accessible icons for `success`, `error`, `warning`, `info`, and `question` rendered using pure external CSS/SVG without external network assets.
- **REQ-MOD-04 (Action Buttons)**: Customizable confirm, deny, cancel, and close buttons with custom text, accessible labels, aria-labels, visibility, and ordering.
- **REQ-MOD-05 (Backdrop & Scroll Lock)**: Modal backdrop prevents background clicking (unless `allowOutsideClick: true`); background scrolling is locked without inline style mutation (via static `body` class).

### 1.3 Inputs & Validation (INP)
- **REQ-INP-01 (Standard Input Types)**: Supports `text`, `email`, `password`, `number`, `tel`, `url`, `search`, `textarea`, `select`, `radio`, `checkbox`, `range`, `file`.
- **REQ-INP-02 (Validation Pipeline)**: Supports synchronous and asynchronous `inputValidator(value)`. When invalid, displays an accessible validation error linked via `aria-describedby` or `aria-errormessage`.
- **REQ-INP-03 (Auto Trim & Attributes)**: Supports `inputAutoTrim`, initial `inputValue`, `inputPlaceholder`, and safe HTML attributes via `inputAttributes`.

### 1.4 Asynchronous Operations & Lifecycle (ASY)
- **REQ-ASY-01 (Async Hooks)**: Supports `beforeConfirm(value)` and `beforeDeny(value)` promises.
- **REQ-ASY-02 (Loading State)**: `showLoading()` and `hideLoading()` show a spinner, disable action buttons, and prevent duplicate submissions.
- **REQ-ASY-03 (Cancellation & Race Safety)**: Lifecycle operations use `AbortController` and token IDs so late async resolutions cannot update or corrupt a closed dialog.
- **REQ-ASY-04 (Promise Settlement)**: Every `CspAlert.fire()` call resolves exactly once with a structured `CspAlertResult`.

### 1.5 Timing & Notifications (TIM)
- **REQ-TIM-01 (Elapsed-Time Timer)**: Timers track real elapsed wall-clock time rather than assuming regular `setInterval` ticks (resilient to tab throttling).
- **REQ-TIM-02 (Timer Inspection & Control)**: Supports `getTimerLeft()`, `stopTimer()`, `resumeTimer()`, `toggleTimer()`, `isTimerRunning()`, `increaseTimer()`.
- **REQ-TIM-03 (Timer Progress Bar)**: Built-in timer progress indicator rendered using semantic native `<progress>` element styled via external CSS.

### 1.6 Accessibility (A11Y)
- **REQ-A11Y-01 (WCAG 2.2 Level A/AA Conformance)**: Passes all automated axe-core rules with zero violations.
- **REQ-A11Y-02 (Focus Trapping & Containment)**: In modal mode, Tab and Shift+Tab wrap within the dialog; background content is marked `inert` or `aria-hidden`.
- **REQ-A11Y-03 (Focus Routing & Restoration)**: Focus is routed to the designated button (`focusConfirm`, `focusDeny`, `focusCancel`) or input on open, and restored to the previous active element upon close.
- **REQ-A11Y-04 (Accessible Names & Roles)**: `aria-labelledby` binds to the title; `aria-describedby` binds to the description/content; close button has accessible `aria-label`.
- **REQ-A11Y-05 (Screen Reader Announcements)**: Validation errors and toasts announce via appropriate `aria-live="polite"` / `aria-live="assertive"` regions.
- **REQ-A11Y-06 (Keyboard & IME Support)**: Escape key closes modal (when permitted); Enter submits input unless in IME composition or multiline textarea.
- **REQ-A11Y-07 (Reduced Motion & High Contrast)**: All animations respect `@media (prefers-reduced-motion: reduce)`; visible focus outlines (2px solid, high-contrast) are provided.

### 1.7 Packaging & API Parity (PKG)
- **REQ-PKG-01 (TypeScript Support)**: Fully typed options, results, and methods exported in `.d.ts`.
- **REQ-PKG-02 (Distribution Formats)**: Emits ESM (`dist/index.js`), Browser IIFE/global (`dist/csp-safe-alert.global.js`), and external stylesheet (`dist/csp-safe-alert.css`).
- **REQ-PKG-03 (Zero Runtime Dependencies)**: 0 third-party runtime npm dependencies in core.
