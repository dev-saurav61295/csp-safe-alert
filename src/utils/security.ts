/**
 * Security & Sanitization Utilities
 */

import { SanitizerFunction } from '../types/index.js';

let globalSanitizer: SanitizerFunction | null = null;

export function setSanitizer(sanitizer: SanitizerFunction | null): void {
  globalSanitizer = sanitizer;
}

export function getSanitizer(): SanitizerFunction | null {
  return globalSanitizer;
}

/**
 * Validates URLs to prevent javascript:, vbscript:, data: (non-image) injection.
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();

  // Block dangerous schemes
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:') ||
    trimmed.startsWith('data:text/html') ||
    trimmed.startsWith('data:application/')
  ) {
    return false;
  }

  // Allow relative URLs, http, https, data:image/
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    !trimmed.includes(':') // relative path without leading slash
  ) {
    return true;
  }

  return false;
}

/**
 * Allowlist for input attributes to prevent on* handlers, style attributes, etc.
 */
const ALLOWED_INPUT_ATTRIBUTES = new Set([
  'accept',
  'alt',
  'autocomplete',
  'autocapitalize',
  'autocorrect',
  'checked',
  'cols',
  'disabled',
  'form',
  'list',
  'max',
  'maxlength',
  'min',
  'minlength',
  'multiple',
  'name',
  'pattern',
  'placeholder',
  'readonly',
  'required',
  'rows',
  'size',
  'spellcheck',
  'step',
  'type',
  'value',
  'wrap',
  'aria-label',
  'aria-describedby',
  'aria-labelledby',
  'aria-invalid',
  'aria-required',
  'data-*',
]);

export function isAllowedAttribute(attrName: string): boolean {
  const lower = attrName.toLowerCase();
  if (lower.startsWith('on') || lower === 'style' || lower === 'srcdoc') {
    return false;
  }
  if (lower.startsWith('data-') || lower.startsWith('aria-')) {
    return true;
  }
  return ALLOWED_INPUT_ATTRIBUTES.has(lower);
}

/**
 * Checks if a value is a plain JavaScript object (Record<string, any>).
 * Excludes primitives, arrays, null, DOM Nodes, Map, Set, Promise, Date, RegExp, etc.
 */
export function isPlainObject(value: any): value is Record<string, any> {
  if (!value || typeof value !== 'object') return false;
  if (typeof Node !== 'undefined' && value instanceof Node) return false;
  if (Array.isArray(value)) return false;
  if (
    value instanceof Map ||
    value instanceof Set ||
    value instanceof Promise ||
    value instanceof Date ||
    value instanceof RegExp
  ) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Deep merge protecting against prototype pollution.
 * Recursively merges only plain objects; preserves non-plain objects, callbacks, and arrays.
 */
export function safeMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Array<Record<string, any> | undefined>
): T {
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    for (const key of Object.keys(source)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      const value = (source as any)[key];
      if (value !== undefined) {
        if (isPlainObject(value)) {
          if (!isPlainObject((target as any)[key])) {
            (target as any)[key] = {};
          }
          safeMerge((target as any)[key], value);
        } else {
          (target as any)[key] = value;
        }
      }
    }
  }
  return target;
}

