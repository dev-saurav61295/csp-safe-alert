# Security Model & Threat Assessment

## 1. Threat Model & Boundaries

| Asset / Boundary | Threat | Mitigation Strategy |
|---|---|---|
| User-Supplied Titles & Text | XSS via malicious string interpolation | Enforce DOM `textContent` / `createTextNode` exclusively. No `innerHTML`. |
| User-Supplied HTML | Script execution, CSS exfiltration, CSRF | Only pre-constructed `HTMLElement` / `DocumentFragment` instances or sanitized via registered sanitizer adapter (e.g. DOMPurify). Raw strings in `html` are escaped by default unless trusted. |
| Input Attributes | Inline event handler injection (`onclick`, `onerror`), `style` attribute injection | Strict attribute allowlist (`placeholder`, `min`, `max`, `step`, `maxlength`, `minlength`, `pattern`, `autocomplete`, `spellcheck`, `autocapitalize`, `accept`, `multiple`, `rows`, `cols`). `on*` and `style` attributes are explicitly rejected and filtered out. |
| Image & Media URLs | `javascript:` URI execution | Protocols restricted to `http:`, `https:`, `data:image/` or relative path URLs. `javascript:` and `vbscript:` schemes are blocked. |
| Prototype Pollution | Object merge modifying `Object.prototype` | Safe shallow/deep copy utils ignoring `__proto__`, `constructor`, `prototype`. |
| Memory / State Leaks | Dangling event listeners or retained background DOM | Complete cleanup on dismissal: event listeners removed, observers disconnected, DOM elements removed, previous focus restored. |

## 2. Content Sanitizer Adapter
For consumers wishing to pass raw HTML strings while keeping strict sanitization:
```typescript
CspAlert.setSanitizer((htmlString: string) => {
  // e.g. DOMPurify.sanitize(htmlString, { SAFE_FOR_TEMPLATES: true })
  return sanitizedHtml;
});
```
Without a registered sanitizer, any string provided to `html` or `text` is treated safely as plain text.

## 3. Host Application Responsibilities
1. Deliver `csp-safe-alert.css` via `<link rel="stylesheet">` with appropriate CSP hashes/origin authorization.
2. Deliver the JavaScript bundle via authorized script tags.
3. Validate and sanitize any untrusted user data before passing DOM nodes to `html` if not using the sanitizer adapter.
