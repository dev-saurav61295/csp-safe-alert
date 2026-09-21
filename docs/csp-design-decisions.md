# CSP Design Decisions & Dynamic Styling Architecture

## 1. Core Threat Model & CSP Constraints

In strict CSP environments (`style-src 'self'`, `style-src-attr 'none'`, `script-src 'self'`, `script-src-attr 'none'`), the browser forbids:
1. `<style>` elements injected at runtime (unless nonced or hashed).
2. `element.setAttribute('style', ...)` or inline `style="..."` attributes.
3. Direct CSSOM mutations like `element.style.color = '...'` or `element.style.cssText = '...'`.
4. String execution via `eval()`, `new Function()`, or `setTimeout("...", n)`.
5. Inline event handlers like `onclick="..."`.

## 2. Dynamic Styling Tradeoffs & Safe Equivalents

SweetAlert2 permits arbitrary inline CSS strings/values for options such as `width: '500px'`, `background: '#fff'`, `confirmButtonColor: '#3085d6'`, `padding: '1em'`, `imageWidth: 100`, etc. Under strict CSP, writing these to inline style properties directly violates policy or breaks when `style-src-attr 'none'` is enforced.

To achieve complete visual customization and functional parity without violating CSP:

### 2.1 Presets & Predefined Utility Classes
`csp-safe-alert` ships an external stylesheet (`csp-safe-alert.css`) with standard size, positioning, and theme utility classes:
- **Widths**: `cspa-width-sm` (320px), `cspa-width-md` (480px), `cspa-width-lg` (640px), `cspa-width-xl` (800px), `cspa-width-full` (100%).
- **Grow Modes**: `cspa-grow-row`, `cspa-grow-column`, `cspa-grow-fullscreen`.
- **Themes**: `cspa-theme-light`, `cspa-theme-dark`, `cspa-theme-high-contrast`, `cspa-theme-borderless`.
- **Button Variants**: `cspa-btn-primary`, `cspa-btn-danger`, `cspa-btn-secondary`, `cspa-btn-success`, `cspa-btn-warning`, `cspa-btn-info`.

### 2.2 Semantic HTML Controls for Progress
- Instead of calculating a width percentage and writing `progress.style.width = 'x%'` on each animation frame, `csp-safe-alert` uses semantic HTML `<progress max="100" value="...">` elements and data-attributes (`data-progress="50"`). Native `<progress>` elements reflect value updates natively through attributes (`value` property/attribute), allowing the browser rendering engine and external CSS pseudo-elements (`progress::-webkit-progress-value`, `progress::-moz-progress-bar`) to render progress safely.

### 2.3 Scrollbar Locking Strategy
- Traditional libraries measure `window.innerWidth - document.body.clientWidth` and write inline `padding-right` and `overflow: hidden` onto `document.body.style`.
- `csp-safe-alert` uses a static CSS class `cspa-body-scroll-lock` with `overflow: hidden; scrollbar-gutter: stable both-edges;` to prevent layout shifts without touching `style.paddingRight`.

### 2.4 Custom Classes (`customClass`)
- Supported rendered targets use caller-authored external CSS classes.
- Live `update({ customClass })` replaces the caller-supplied class for a target and preserves required `cspa-*` classes. An empty string clears that target.

### 2.5 Styling options that cannot be represented safely at runtime
- `heightAuto` is implemented with external `.cspa-height-auto` classes on `html` and `body`; no inline style mutation is required.
- Arbitrary `padding`, `background`, and `iconColor` values are retained only for source compatibility and are deprecated/ignored. Exact runtime values would require inline CSS or generated runtime styles, which are outside the default CSP architecture. Migrate these to `customClass`, external CSS, themes, or semantic variants.

## 3. Strict CSP Policy Test Fixture

The test harness enforces the following response header:

```http
Content-Security-Policy: default-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self'; style-src-attr 'none'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

Every browser test suite registers a `securitypolicyviolation` event listener. Any unexpected violation event immediately fails the test.
