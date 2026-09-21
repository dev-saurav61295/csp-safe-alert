/**
 * Safe DOM Utilities - Zero inline styles, fully CSP compliant
 */

import { isAllowedAttribute } from './security';

/**
 * Creates an element with optional class names and text content (via textContent, never innerHTML).
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  classNames?: string | string[],
  text?: string
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tagName);
  if (classNames) {
    addClasses(el, classNames);
  }
  if (text !== undefined && text !== null) {
    el.textContent = text;
  }
  return el;
}

/**
 * Safely adds class names (supporting strings, space-separated classes, or arrays).
 */
export function addClasses(el: Element, classes: string | string[]): void {
  if (!classes) return;
  const list = Array.isArray(classes) ? classes : classes.split(/\s+/);
  for (const c of list) {
    const trimmed = c.trim();
    if (trimmed) {
      el.classList.add(trimmed);
    }
  }
}

/**
 * Safely removes class names.
 */
export function removeClasses(el: Element, classes: string | string[]): void {
  if (!classes) return;
  const list = Array.isArray(classes) ? classes : classes.split(/\s+/);
  for (const c of list) {
    const trimmed = c.trim();
    if (trimmed) {
      el.classList.remove(trimmed);
    }
  }
}

/**
 * Sets attributes with strict allowlist filtering.
 */
export function setAttributes(el: HTMLElement, attributes: Record<string, string>): void {
  for (const [key, val] of Object.entries(attributes)) {
    if (isAllowedAttribute(key)) {
      el.setAttribute(key, String(val));
    }
  }
}

/**
 * Removes element from its parent.
 */
export function removeElement(el: Element | null): void {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

/**
 * Clears all children of an element safely.
 */
export function clearChildren(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/**
 * Checks if target is an HTMLElement.
 */
export function isHTMLElement(obj: any): obj is HTMLElement {
  return obj instanceof HTMLElement;
}

/**
 * Checks if target is a Node or DocumentFragment.
 */
export function isNode(obj: any): obj is Node {
  return obj instanceof Node;
}
