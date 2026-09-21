# Release Readiness Checklist: CSP Safe Alert

## 1. Package Review & Hygiene

- [x] **Package Name Checked**: No exact `csp-safe-alert` package was found in npm search at the time of the release audit.
- [x] **Zero Runtime Dependencies**: Core library has 0 third-party runtime dependencies.
- [x] **Bundle Formats Built**:
  - `dist/index.js` (ESM module)
  - `dist/index.cjs` (CommonJS module)
  - `dist/csp-safe-alert.global.js` (IIFE / Browser script)
  - `dist/csp-safe-alert.css` (Static external stylesheet)
  - `dist/index.d.ts` (TypeScript definitions)
- [x] **Package Files Whitelist**: Only `dist`, `README.md`, `LICENSE` included in published tarball.
- [x] **Zero Forbidden Tokens in Bundles**: Production bundles verified to contain no `eval`, `new Function`, or style property injections.

## 2. Test Verification Summary

- [ ] **Unit Tests**: Final PR CI result pending; includes new release-gap regressions and a Node-only browser-free overload suite.
- [ ] **Strict CSP HTTP Enforcement**: Final PR CI result pending in Chromium, Firefox, and WebKit.
- [ ] **Zero CSP Violation Events**: Final PR CI result pending.
- [ ] **Negative Control CSP Verification**: Final PR CI result pending.
- [ ] **Automated Accessibility (Axe-core)**: Final PR CI result pending.
- [ ] **Browser Focus, Theme Preferences & Interactions**: Final PR CI result pending.
- [ ] **Total Automated Checks**: Final PR CI result pending.

## 3. Documentation Deliverables Checklist

- [x] `README.md` (Quickstart, CSS loading, strict CSP guide, examples, trust boundaries)
- [x] `CHANGELOG.md` (Version 1.1.0 release notes)
- [x] `docs/reference-baseline.md` (Pinned SweetAlert2 11.17.2 baseline)
- [x] `docs/requirements.md` (Stable traceable requirements REQ-SEC, REQ-MOD, REQ-INP, REQ-ASY, REQ-TIM, REQ-A11Y, REQ-PKG)
- [x] `docs/feature-parity.md` (SweetAlert2 mapping matrix & CSP architectural notes)
- [x] `docs/architecture.md` (Module boundaries, focus trap, lifecycle, state machine)
- [x] `docs/csp-design-decisions.md` (Zero-inline-style strategy, native progress controls, preset sizing)
- [x] `docs/security.md` (Threat model, sanitization boundary, allowlists)
- [x] `docs/accessibility-matrix.md` (WCAG 2.2 Level A/AA full criteria matrix)
- [x] `docs/api.md` (Complete public API reference)
- [x] `docs/migration-from-sweetalert2.md` (Step-by-step migration guide with code diffs)
- [x] `docs/testing.md` (Testing architecture and execution commands)
- [x] `docs/test-results.md` (Test execution outcomes and evidence)
- [x] `docs/implementation-status.md` (Readiness status)
- [x] `docs/release-checklist.md` (This document)
- [x] `examples/index.html` & `examples/examples-app.js` (Strict CSP interactive showcase)
- [x] `LICENSE` (MIT License)

## 4. Release Build & Publication Process

The repository does not commit generated `dist/` artifacts. The package is built automatically by npm immediately before publication through the `prepublishOnly` script.

Before publishing:

1. Complete the manual accessibility gates below and record the actual results in `docs/test-results.md`.
2. Run the full verification suite locally:
   ```bash
   npm ci
   npm run typecheck
   npm run build
   npx playwright install --with-deps
   npm test
   ```
3. Inspect the package contents without publishing:
   ```bash
   npm pack --dry-run
   ```
   Confirm the tarball contains `dist/`, `README.md`, `CHANGELOG.md`, and `LICENSE`, and does not contain development/test files.
4. Publish only after all release gates are complete:
   ```bash
   npm publish
   ```
   `npm publish` invokes `prepublishOnly`, which runs the production build first.

## 5. Release Authorization Status

- **Current package version**: `1.1.0` (unchanged in this branch).
- Publication status is checked by the packed-artifact verification script; no release/tag/publication action is performed here.
- Automated and manual release gates must be updated from actual evidence before release.

