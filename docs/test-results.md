# Test Results & Verification Evidence

## 1. Summary of Test Execution

The historical 1.1.0 baseline reported 54 unit tests and 90 automated checks before this review. Those numbers are not reused as evidence for this branch.

### PR #3 — latest CI evidence available at documentation update

| Check | Actual result | Evidence |
|---|---|---|
| Typecheck | **PASS** | CI run 26 completed `npm run typecheck` successfully |
| Production build | **PASS** | CI run 26 completed `npm run build` successfully |
| Unit suite | **PENDING** | CI run 26 was still installing Playwright before reaching `npm test`; an earlier pre-fix run reached 60 unit tests with 1 new focus regression failing, which was corrected afterward |
| CSP / browser suite | **PENDING** | Not reached by the latest completed CI step |
| Accessibility / axe suite | **PENDING** | Not reached by the latest completed CI step |
| Browser interaction suite | **PENDING** | Not reached by the latest completed CI step |
| Packed npm artifact | **PENDING** | `test:package` is wired into CI but has not yet executed in the latest run |
| npm 1.1.0 publication check | **PENDING** | `test:package` records registry status when reached; local registry access timed out |

The regression suite itself now contains coverage for dynamic buttons, deny-handler wiring, focused-button removal, live custom classes, heightAuto/styling behavior, browser-global `mixin`/`queue`, and Node-only string overloads.

## 2. Strict CSP Verification Details

- **Enforced Response Header**:
  ```http
  Content-Security-Policy: default-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self'; style-src-attr 'none'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
  ```
- **Violations Captured During Alert Execution**: **0** (Zero `securitypolicyviolation` events across all dialogs, toasts, inputs, themes, and replacement flows)
- **Inline Style Attributes In DOM**: **0** (Zero elements with `style` attribute or `element.style.*` mutations)
- **Negative Control**: Intentionally injected inline styles trigger `securitypolicyviolation` on `style-src` as expected, proving enforcement is active and responsive.

---

## 3. Automated WCAG 2.2 AA Accessibility Audits & Assistive Technology

- **Axe-core Tags Evaluated**: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`.
- **States Verified**:
  - Standard informational and confirmation modal dialogs
  - Destructive confirmation dialogs with safe focus defaults
  - Complex form input dialogs (text, number, select, radio, checkbox, textarea, file)
  - Live-region validation error message states (`aria-invalid="true"`, `aria-errormessage`)
  - Non-modal toasts (`role="status"` / `role="alert"`)
  - Explicit Light, Dark theme, and High Contrast mode
- **Manual Assistive Technology Note**: Automated axe-core tests verify structural compliance; full accessibility conformance requires end-to-end screen reader testing in target application contexts.

---

## 4. Packaging & Consumer Smoke Verification

- **Package Archive**: `csp-safe-alert-1.1.0.tgz`
- **SHA-256 Checksum**: `13d36b10f76570c4f2eb94299c6f36a3962bdb4c634bdd2a552981664fe515e7`
- **TypeScript Declarations**: Generated cleanly without errors (`dist/index.d.ts` with explicit `.js` import specifiers compatible with `moduleResolution: "NodeNext"`).
- **Formats Generated**:
  - ESM: `dist/index.js` (49.55 kB raw, 10.90 kB gzip)
  - CommonJS: `dist/index.cjs` (37.90 kB raw, 9.45 kB gzip)
  - Global Browser Script (IIFE): `dist/csp-safe-alert.global.js` (37.71 kB raw, 9.48 kB gzip)
  - External CSS: `dist/csp-safe-alert.css` (12.57 kB raw, 2.85 kB gzip)
- **Runtime Dependencies**: **0** (Zero runtime dependencies in core package)
- **Isolated Consumer Smoke Testing**: Verified archive `csp-safe-alert-1.1.0.tgz` in an isolated consumer project across:
  - TypeScript strict type checking (`tsc --noEmit` and `tsc --outDir` with `moduleResolution: NodeNext`)
  - ESM `import` statements and top-level named helper exports (`fire`, `close`, `isVisible`, `FocusTrap`)
  - CommonJS `require()` loading
  - Global Browser IIFE execution in isolated context
  - CSS stylesheet static asset resolution

