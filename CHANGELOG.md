# Changelog

All notable changes to `csp-safe-alert` are documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed
- Dynamic `CspAlert.update()` now creates/removes confirm, deny, and cancel buttons with real handlers, preserves loading state, clears removed references, and moves focus when a focused button is removed.
- Live `customClass` updates now replace caller-supplied classes on supported targets while preserving required `cspa-*` classes; empty strings clear a target.
- `heightAuto` now uses external document classes with ownership-aware cleanup. Arbitrary `padding`, `background`, and `iconColor` runtime styling is explicitly deprecated and ignored under strict CSP.
- The browser IIFE now exposes `CspAlert.mixin()` and `CspAlert.queue()` on the same namespace as `CspAlert.fire()`.
- String overloads now guard `HTMLElement` references so `fire('Test')` and `mixin().fire('Test')` work without DOM globals.

### Tests
- Added regression coverage for dynamic actions, focus during button removal, live custom classes, CSP styling contracts, browser-global mixin/queue bindings, and Node-only string overloads.

## [1.1.0] - 2026-09-21

### Added
- **Subtree Background Isolation**: Modal focus trap now walks up ancestor chains to isolate sibling subtrees when mounted into custom targets (`target: '#container'`), without making modal ancestors or containers inert.
- **Visible Errors for Non-Input Dialogs**: Rendered popup-level validation message container for confirmation dialogs without built-in form controls (e.g. `beforeConfirm` network failure retry scenario).
- **Explicit Light & Dark Theme Support**: Added `.cspa-theme-light` rules ensuring explicit light theme stays light under dark OS preferences and explicit dark theme stays dark under light OS preferences.
- **Promise & Map Preservation in Options**: `safeMerge` now recursively merges only plain objects, preserving `Map`, `Promise`, DOM `Node`, `DocumentFragment`, `Date`, and callbacks without corruption.
- **Concurrency Operation Locks**: Added operation lock guarding `handleConfirm` and `handleDeny` across asynchronous validation (`inputValidator`) and asynchronous confirmation (`beforeConfirm`/`beforeDeny`).
- **Idempotent Lifecycle Cancellation**: Pending `requestAnimationFrame` IDs and timeout handlers are tracked and cancelled on settlement, destruction, and rapid replacement.
- **Dynamic `CspAlert.update()`**: Full support for updating titles, text, HTML, and button labels (preserving loader spinner state), with dynamic `aria-labelledby` and `aria-describedby` linkage.

### Fixed
- Fixed bug where `safeMerge` converted `Map` and `Promise` option values into empty objects (`{}`).
- Fixed race condition where rapid double-confirmation invoked `beforeConfirm` twice before async validation completed.
- Fixed unhandled promise rejection and stale UI update when `inputValue` promise rejects or resolves after modal closure.
- Fixed issue where deferred `requestAnimationFrame` callbacks created focus traps or started timers after immediate `close()`.
- Fixed background isolation ignoring siblings of nested targets when mounted outside `document.body`.
- Fixed dark-mode media query overriding explicit `theme: 'light'`.

### Documentation
- Updated `README.md` and documentation with precise CSP compatibility details, trust boundaries, and network request `connect-src` requirements.
- Updated API reference, migration guide, feature parity matrix, and test results evidence (81 tests passing).

## [1.0.0] - 2026-09-21
- Initial public release of `csp-safe-alert`.
