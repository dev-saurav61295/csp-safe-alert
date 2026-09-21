import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CspAlert } from '../../src/core/CspAlert';

describe('Accessibility & Background Isolation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app-root">
        <header id="app-header">
          <button id="header-btn">Nav</button>
        </header>
        <main id="app-main">
          <button id="main-btn">Main action</button>
          <div id="nested-modal-target"></div>
        </main>
      </div>
    `;
  });

  afterEach(() => {
    CspAlert.close();
  });

  it('isolates background across ancestor chains without making modal container or ancestors inert', async () => {
    const header = document.getElementById('app-header')!;
    const mainBtn = document.getElementById('main-btn')!;
    const appRoot = document.getElementById('app-root')!;
    const target = document.getElementById('nested-modal-target')!;

    const promise = CspAlert.fire({
      title: 'Nested Modal',
      target: '#nested-modal-target',
    });

    await new Promise((r) => setTimeout(r, 20));

    // Modal container & ancestors should NOT be inert or aria-hidden
    expect((appRoot as any).inert).toBeFalsy();
    expect(appRoot.getAttribute('aria-hidden')).toBeNull();

    const container = document.querySelector('.cspa-container') as HTMLElement;
    expect(container).not.toBeNull();
    expect((container as any).inert).toBeFalsy();

    // Background sibling elements SHOULD be isolated
    expect((header as any).inert).toBe(true);
    expect(header.getAttribute('aria-hidden')).toBe('true');
    expect((mainBtn as any).inert).toBe(true);
    expect(mainBtn.getAttribute('aria-hidden')).toBe('true');

    // Close and verify complete restoration
    CspAlert.clickConfirm();
    await promise;

    expect((header as any).inert).toBe(false);
    expect(header.getAttribute('aria-hidden')).toBeNull();
    expect((mainBtn as any).inert).toBe(false);
    expect(mainBtn.getAttribute('aria-hidden')).toBeNull();
  });

  it('preserves pre-existing inert and aria-hidden states on background elements', async () => {
    const header = document.getElementById('app-header')!;
    header.setAttribute('aria-hidden', 'true');
    (header as any).inert = true;

    const promise = CspAlert.fire({
      title: 'Modal check',
      target: '#nested-modal-target',
    });

    await new Promise((r) => setTimeout(r, 20));

    CspAlert.clickConfirm();
    await promise;

    // header should retain its pre-existing aria-hidden and inert state
    expect((header as any).inert).toBe(true);
    expect(header.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps non-modal toasts non-modal without isolating background elements', async () => {
    const header = document.getElementById('app-header')!;
    const mainBtn = document.getElementById('main-btn')!;

    const promise = CspAlert.fire({
      toast: true,
      position: 'top-end',
      title: 'Saved',
      timer: 1000,
    });

    await new Promise((r) => setTimeout(r, 20));

    // Toast container should not isolate background
    expect((header as any).inert).toBeFalsy();
    expect(header.getAttribute('aria-hidden')).toBeNull();
    expect((mainBtn as any).inert).toBeFalsy();
    expect(mainBtn.getAttribute('aria-hidden')).toBeNull();

    CspAlert.close();
    await promise;
  });
});
