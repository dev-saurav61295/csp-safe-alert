/**
 * Screen Reader Live Region Announcer
 */

import { createElement } from '../utils/dom.js';

let politeLiveRegion: HTMLElement | null = null;
let assertiveLiveRegion: HTMLElement | null = null;

function ensureLiveRegions(): void {
  if (typeof document === 'undefined') return;

  if (!politeLiveRegion || !document.body.contains(politeLiveRegion)) {
    politeLiveRegion = createElement('div', 'cspa-sr-only');
    politeLiveRegion.setAttribute('aria-live', 'polite');
    politeLiveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(politeLiveRegion);
  }

  if (!assertiveLiveRegion || !document.body.contains(assertiveLiveRegion)) {
    assertiveLiveRegion = createElement('div', 'cspa-sr-only');
    assertiveLiveRegion.setAttribute('aria-live', 'assertive');
    assertiveLiveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(assertiveLiveRegion);
  }
}

export function announce(message: string, urgency: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined' || !message) return;
  ensureLiveRegions();

  const targetRegion = urgency === 'assertive' ? assertiveLiveRegion : politeLiveRegion;
  if (targetRegion) {
    targetRegion.textContent = '';
    const isTestEnv = typeof process !== 'undefined' && process.env && (process.env.NODE_ENV === 'test' || process.env.VITEST);
    const delay = isTestEnv ? 0 : 50;
    setTimeout(() => {
      if (targetRegion) targetRegion.textContent = message;
    }, delay);
  }
}
