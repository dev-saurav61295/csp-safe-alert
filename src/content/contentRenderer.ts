/**
 * Content & Icon Rendering Module
 * Zero inline styles, zero external network downloads.
 */

import { CspAlertIcon, CspAlertOptions } from '../types';
import { createElement, addClasses, isHTMLElement, isNode, clearChildren } from '../utils/dom';
import { isSafeUrl, getSanitizer } from '../utils/security';

const ICON_SVGS: Record<CspAlertIcon, string> = {
  success: `
    <svg class="cspa-icon-svg cspa-icon-success-svg" viewBox="0 0 52 52" aria-hidden="true" focusable="false">
      <circle class="cspa-icon-circle" cx="26" cy="26" r="25" fill="none"/>
      <path class="cspa-icon-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
    </svg>
  `,
  error: `
    <svg class="cspa-icon-svg cspa-icon-error-svg" viewBox="0 0 52 52" aria-hidden="true" focusable="false">
      <circle class="cspa-icon-circle" cx="26" cy="26" r="25" fill="none"/>
      <path class="cspa-icon-cross" fill="none" d="M16 16 36 36 M36 16 16 36"/>
    </svg>
  `,
  warning: `
    <svg class="cspa-icon-svg cspa-icon-warning-svg" viewBox="0 0 52 52" aria-hidden="true" focusable="false">
      <circle class="cspa-icon-circle" cx="26" cy="26" r="25" fill="none"/>
      <path class="cspa-icon-exclamation" fill="currentColor" d="M24 14h4v16h-4z M24 34h4v4h-4z"/>
    </svg>
  `,
  info: `
    <svg class="cspa-icon-svg cspa-icon-info-svg" viewBox="0 0 52 52" aria-hidden="true" focusable="false">
      <circle class="cspa-icon-circle" cx="26" cy="26" r="25" fill="none"/>
      <path class="cspa-icon-info-i" fill="currentColor" d="M24 14h4v4h-4z M24 22h4v16h-4z"/>
    </svg>
  `,
  question: `
    <svg class="cspa-icon-svg cspa-icon-question-svg" viewBox="0 0 52 52" aria-hidden="true" focusable="false">
      <circle class="cspa-icon-circle" cx="26" cy="26" r="25" fill="none"/>
      <path class="cspa-icon-question-mark" fill="currentColor" d="M23 15c0-1.7 1.3-3 3-3s3 1.3 3 3c0 1.5-1 2.3-2 3.1-.9.7-2 1.6-2 3.9h2c0-1.5 1-2.3 2-3.1.9-.7 2-1.6 2-3.9 0-2.8-2.2-5-5-5s-5 2.2-5 5h2zm2 18h2v2h-2z"/>
    </svg>
  `,
};

export function renderIcon(options: CspAlertOptions): HTMLElement | null {
  if (!options.icon && !options.iconHtml) return null;

  const iconContainer = createElement('div', ['cspa-icon']);
  iconContainer.setAttribute('aria-hidden', 'true');

  if (options.icon) {
    addClasses(iconContainer, `cspa-icon-${options.icon}`);
    const svgString = ICON_SVGS[options.icon];
    if (svgString) {
      // Create SVG node safely via DOMParser to avoid script execution
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = doc.documentElement;
      if (svgElement && !svgElement.querySelector('parsererror')) {
        iconContainer.appendChild(document.importNode(svgElement, true));
      }
    }
  }

  if (options.iconHtml) {
    if (isHTMLElement(options.iconHtml) || isNode(options.iconHtml)) {
      iconContainer.appendChild(options.iconHtml);
    } else if (typeof options.iconHtml === 'string') {
      const sanitizer = getSanitizer();
      if (sanitizer) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitizer(options.iconHtml), 'text/html');
        while (doc.body.firstChild) {
          iconContainer.appendChild(doc.body.firstChild);
        }
      } else {
        iconContainer.textContent = options.iconHtml;
      }
    }
  }

  if (options.customClass?.icon) {
    addClasses(iconContainer, options.customClass.icon);
  }

  return iconContainer;
}

export function renderImage(options: CspAlertOptions): HTMLElement | null {
  if (!options.imageUrl) return null;
  if (!isSafeUrl(options.imageUrl)) return null;

  const img = createElement('img', 'cspa-image') as HTMLImageElement;
  img.src = options.imageUrl;
  img.alt = options.imageAlt || '';

  if (options.imageWidth) {
    img.setAttribute('width', String(options.imageWidth));
  }
  if (options.imageHeight) {
    img.setAttribute('height', String(options.imageHeight));
  }

  if (options.customClass?.image) {
    addClasses(img, options.customClass.image);
  }

  return img;
}

export function renderTitle(options: CspAlertOptions, id: string): HTMLElement | null {
  const titleText = options.titleText || options.title;
  if (!titleText) return null;

  const titleEl = createElement('h2', 'cspa-title', titleText);
  titleEl.id = id;

  if (options.customClass?.title) {
    addClasses(titleEl, options.customClass.title);
  }

  return titleEl;
}

export function renderHtmlContainer(options: CspAlertOptions, id: string): HTMLElement | null {
  const { html, text } = options;
  if (!html && !text) return null;

  const container = createElement('div', 'cspa-html-container');
  container.id = id;

  if (html) {
    if (isHTMLElement(html) || isNode(html)) {
      container.appendChild(html);
    } else if (typeof html === 'string') {
      const sanitizer = getSanitizer();
      if (sanitizer) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitizer(html), 'text/html');
        while (doc.body.firstChild) {
          container.appendChild(doc.body.firstChild);
        }
      } else {
        container.textContent = html;
      }
    }
  } else if (text) {
    container.textContent = text;
  }

  if (options.customClass?.htmlContainer) {
    addClasses(container, options.customClass.htmlContainer);
  }

  return container;
}

export function renderFooter(options: CspAlertOptions): HTMLElement | null {
  if (!options.footer) return null;

  const footerEl = createElement('div', 'cspa-footer');

  if (isHTMLElement(options.footer) || isNode(options.footer)) {
    footerEl.appendChild(options.footer);
  } else if (typeof options.footer === 'string') {
    footerEl.textContent = options.footer;
  }

  if (options.customClass?.footer) {
    addClasses(footerEl, options.customClass.footer);
  }

  return footerEl;
}
