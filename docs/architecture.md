# Architecture: CSP Safe Alert

## 1. System Overview

`csp-safe-alert` is designed with clean modularity, strong encapsulation, zero runtime dependencies, zero inline styles, and strict TypeScript types.

```
                  ┌──────────────────────────────┐
                  │    Public API: CspAlert      │
                  │  (fire, close, update, etc.) │
                  └──────────────┬───────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Core Lifecycle  │   │  DOM & Structure │   │  Accessibility   │
│  - State Machine │   │  - Safe Builders │   │  - Focus Trap    │
│  - Promises      │   │  - Class Helpers │   │  - Live Regions  │
│  - Async Tokens  │   │  - No inline CSS │   │  - ARIA manager  │
│  - Timer Engine  │   │  - Icon SVG Gen  │   │  - Inert state   │
└──────────┬───────┘   └─────────┬────────┘   └────────┬─────────┘
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 ▼
           ┌───────────────────────────────────────────┐
           │      Input & Content Management           │
           │  - Safe Text Rendering                   │
           │  - Input Form Controls & Validation       │
           │  - Trusted DOM Node Adoption & Cleanup    │
           └───────────────────────────────────────────┘
```

## 2. Key Subsystems

### 2.1 Core Lifecycle & State Machine
- **States**: `IDLE` -> `OPENING` -> `OPEN` -> `VALIDATING` -> `LOADING` -> `CLOSING` -> `DESTROYED`.
- **Token Invalidation**: Each active instance is assigned a unique symbol/number generation ID. When a popup closes, any pending asynchronous operation (`beforeConfirm`, validation, initial value fetching) checking against the token aborts execution silently without touching DOM.
- **Promise Invariants**: Every `.fire()` call returns a Promise guaranteed to resolve exactly once with `CspAlertResult`.

### 2.2 DOM & Safe Construction
- Standard elements created via `document.createElement()`.
- Textual properties (`title`, `text`, `footer`, `confirmButtonText`, `cancelButtonText`, etc.) set exclusively via `textContent`.
- Custom CSS classes applied via `classList.add()`.
- Icons built with pure static SVG templates referencing external styles or classes.
- Zero `element.style.*` mutations, zero `element.setAttribute('style', ...)` mutations.

### 2.3 Timer Engine
- Uses wall-clock timestamp tracking:
  - `startTime`, `duration`, `remainingTime`, `pausedTime`.
- Periodic tick updates `remainingTime = targetTime - Date.now()` and updates the native `<progress>` element's `value` attribute.
- Resistant to tab backgrounding / `requestAnimationFrame` slowdowns.

### 2.4 Accessibility & Focus Containment
- Modal mode identifies all tabbable/focusable elements inside `.cspa-popup`.
- `keydown` handler traps `Tab` and `Shift+Tab` within the boundary.
- Supports `focusConfirm`, `focusCancel`, `focusDeny`, `focusInput`.
- Prior `document.activeElement` is captured before opening and restored on close (if `returnFocus: true`).
- Marks non-dialog background trees `inert` or `aria-hidden="true"`.
- Live regions (`aria-live="polite"` / `aria-live="assertive"`) announce validation errors and toast notifications.
