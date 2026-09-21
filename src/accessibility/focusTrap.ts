/**
 * Accessibility - Focus Trap & Containment Manager
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
].join(', ');

export interface FocusTrapOptions {
  container: HTMLElement;
  initialFocusElement?: HTMLElement | null;
  returnFocus?: boolean;
}

export class FocusTrap {
  private container: HTMLElement;
  private previouslyFocusedElement: HTMLElement | null = null;
  private returnFocus: boolean;
  private initialFocusElement: HTMLElement | null = null;
  private handleKeyDownBound: (e: KeyboardEvent) => void;
  private hiddenSiblings: Array<{ el: HTMLElement; prevInert: boolean; prevAriaHidden: string | null }> = [];

  constructor(options: FocusTrapOptions) {
    this.container = options.container;
    this.returnFocus = options.returnFocus ?? true;
    this.initialFocusElement = options.initialFocusElement ?? null;
    this.handleKeyDownBound = this.handleKeyDown.bind(this);
  }

  public activate(): void {
    if (typeof document === 'undefined') return;

    // Capture currently focused element to restore upon close
    if (document.activeElement instanceof HTMLElement) {
      this.previouslyFocusedElement = document.activeElement;
    }

    // Mark background siblings inert / aria-hidden
    this.isolateBackground();

    // Attach Tab key trapping listener
    document.addEventListener('keydown', this.handleKeyDownBound, true);

    // Set initial focus
    this.setInitialFocus();
  }

  public deactivate(): void {
    if (typeof document === 'undefined') return;

    document.removeEventListener('keydown', this.handleKeyDownBound, true);
    this.restoreBackground();

    if (this.returnFocus && this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      try {
        if (document.body.contains(this.previouslyFocusedElement)) {
          this.previouslyFocusedElement.focus();
        }
      } catch {
        // Safe fallback if previous element cannot be focused
      }
    }
  }

  public setInitialFocus(): void {
    if (this.initialFocusElement && typeof this.initialFocusElement.focus === 'function') {
      try {
        this.initialFocusElement.focus();
        return;
      } catch {
        // Fallback to first focusable
      }
    }

    const focusables = this.getFocusableElements();
    if (focusables.length > 0) {
      focusables[0]?.focus();
    } else {
      this.container.focus();
    }
  }

  public getFocusableElements(): HTMLElement[] {
    const list = Array.from(this.container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    return list.filter((el) => {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;

    const focusables = this.getFocusableElements();
    if (focusables.length === 0) {
      e.preventDefault();
      this.container.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || !this.container.contains(document.activeElement)) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last || !this.container.contains(document.activeElement)) {
        e.preventDefault();
        first?.focus();
      }
    }
  }

  private isolateBackground(): void {
    if (!this.container || typeof document === 'undefined') return;

    let current: HTMLElement | null = this.container.parentElement;
    while (current) {
      for (const child of Array.from(current.children)) {
        if (
          child instanceof HTMLElement &&
          child !== this.container &&
          !child.contains(this.container)
        ) {
          const prevInert = 'inert' in child ? Boolean((child as any).inert) : false;
          const prevAriaHidden = child.getAttribute('aria-hidden');
          if ('inert' in child) {
            (child as any).inert = true;
          }
          child.setAttribute('aria-hidden', 'true');
          this.hiddenSiblings.push({ el: child, prevInert, prevAriaHidden });
        }
      }
      if (current === document.body) break;
      current = current.parentElement;
    }
  }

  private restoreBackground(): void {
    // Restore in reverse order
    for (let i = this.hiddenSiblings.length - 1; i >= 0; i--) {
      const item = this.hiddenSiblings[i];
      if (item) {
        const { el, prevInert, prevAriaHidden } = item;
        if ('inert' in el) {
          (el as any).inert = prevInert;
        }
        if (prevAriaHidden !== null) {
          el.setAttribute('aria-hidden', prevAriaHidden);
        } else {
          el.removeAttribute('aria-hidden');
        }
      }
    }
    this.hiddenSiblings = [];
  }
}

