import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  ViewContainerRef,
  TemplateRef,
  OnDestroy,
  ChangeDetectorRef,
  OnInit,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  inject,
} from '@angular/core';

/**
 * Defines the types of activation modes for the overlay.
 */
type ActivationBy = 'hover' | 'click';

/**
 * Defines the possible positions of the overlay relative to the target element.
 */
type PositionsOverlay =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'right-center'
  | 'left-center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Defines the offset values for overlay positioning.
 */
interface OffsetPositionOverlay {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

/**
 * A custom directive to create an overlay that can be activated by hover or click.
 * Allows for dynamic positioning and adjustment based on the parent element size.
 * This overlay is used for the panel in SelecCustom and AutocompleteCustom
 * Author: Jesús David Muñoz Gallego
 */
@Directive({
  selector: '[appOverlay]',
  standalone: true,
})
export class OverlayDirective implements OnInit, OnChanges, OnDestroy {
  @Input('appOverlay') overlayHTML!: TemplateRef<any>; // Template for the overlay content.

  @Input() overlayActivateBy: ActivationBy | ActivationBy[] = 'hover'; // Mode of activation (hover or click).
  @Input() overlayPosition: PositionsOverlay = 'bottom-center'; // Position of the overlay relative to the target element.
  @Input() offsetPositionOverlay!: OffsetPositionOverlay; // Optional offset adjustments for overlay positioning.
  @Input() closeInsideOverlay!: boolean; // Determines if clicking inside the overlay should close it.
  @Input() closeOverlay!: boolean; // Input to programmatically close the overlay.
  @Input() openOverlay!: boolean; // Input to programmatically open the overlay.
  @Input() overlayWidth!: string; // Sets a specific width for the overlay.

  @Output() statusOverlayChange = new EventEmitter<boolean>(); // Emits the status change of the overlay (opened/closed).

  private overlayIsOpened!: boolean; // Tracks the open state of the overlay.

  private targetInput: HTMLElement | null = null; // References an input inside the parent if present.
  private overlayElement?: HTMLElement; // The main element of the overlay.

  private parentResizeObserver!: ResizeObserver; // Observer for resizing the parent element.
  private setTimeoutOverlay?: number | ReturnType<typeof setTimeout>; // Timeout for overlay delay actions.
  private resizeObserver!: ResizeObserver; // Observer for resizing the tooltip element.
  private listeners: (() => void)[] = []; // Array of listeners for event management.

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  ngOnInit(): void {
    if (this.overlayHTML) {
      this.setupEventListeners();
      this.observeParentSizeChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      if (
        'openOverlay' in changes &&
        changes['openOverlay'].currentValue &&
        !this.overlayIsOpened
      ) {
        this.showOverlay();
      }

      if (
        'closeOverlay' in changes &&
        changes?.['closeOverlay'].currentValue &&
        this.overlayIsOpened
      ) {
        this.removeOverlay();
      }
    }, 0);
  }

  /**
   * Sets up event listeners based on the activation method (hover or click).
   * Adds listeners to handle showing, hiding, and toggling the overlay.
   */
  private setupEventListeners() {
    this.listeners.forEach((unlisten) => unlisten()); // Clean up existing listeners.
    const events = Array.isArray(this.overlayActivateBy)
      ? this.overlayActivateBy
      : [this.overlayActivateBy]; // Handles multiple activation modes.

    events.forEach((event) => {
      switch (event) {
        case 'hover':
          this.listeners.push(
            this.renderer.listen(
              this.elementRef.nativeElement,
              'mouseenter',
              () => {
                if (this.setTimeoutOverlay) {
                  clearTimeout(this.setTimeoutOverlay);
                  this.setTimeoutOverlay = undefined;
                }
                this.setTimeoutOverlay = setTimeout(() => {
                  this.showOverlay();
                }, 150);
              }
            )
          );
          this.listeners.push(
            this.renderer.listen(
              this.elementRef.nativeElement,
              'mouseleave',
              () => {
                if (this.setTimeoutOverlay) {
                  clearTimeout(this.setTimeoutOverlay);
                  this.setTimeoutOverlay = undefined;
                }
                this.removeOverlay();
              }
            )
          );
          break;
        case 'click':
          this.listeners.push(
            this.renderer.listen(this.elementRef.nativeElement, 'click', () => {
              this.targetInput =
                this.elementRef.nativeElement.querySelector('input');
              this.toggleOverlay();
              if (this.targetInput) this.targetInput.focus();
            })
          );
          break;
      }
    });

    // Add listener to detect clicks outside the overlay
    this.listeners.push(
      this.renderer.listen('document', 'click', this.onDocumentClick.bind(this))
    );
  }

  /**
   * Observes changes in the size of the parent element to adjust overlay positioning.
   */
  private observeParentSizeChanges(): void {
    this.parentResizeObserver = new ResizeObserver(() => {
      if (this.overlayIsOpened) {
        this.adjustPosition();
      }
    });
    this.parentResizeObserver.observe(this.elementRef.nativeElement);
  }

  /**
   * Handles document click events to close the overlay if clicked outside.
   * @param event - The click event.
   */
  private onDocumentClick(event: Event) {
    if (this.overlayElement && this.overlayIsOpened) {
      const targetElement = event.target as HTMLElement;
      const clickedInsideParent =
        this.elementRef.nativeElement.contains(targetElement);
      const clickedInsideOverlay = this.overlayElement.contains(targetElement);

      if (
        !clickedInsideParent &&
        (!clickedInsideOverlay ||
          (clickedInsideOverlay && this.closeInsideOverlay))
      ) {
        this.removeOverlay();
      }
    }
  }

  /**
   * Event handler for window resize and scroll events to adjust overlay positioning.
   */
  private onWindowEvent = (): void => {
    if (this.overlayElement) {
      this.adjustPosition();
    }
  };

  /**
   * Shows the overlay by creating the overlay element.
   */
  private showOverlay = () => {
    if (this.overlayHTML) {
      if (this.overlayIsOpened) return;

      this.overlayIsOpened = true;
      this.statusOverlayChange.emit(this.overlayIsOpened);

      this.createOverlayElement();
    }
  };

  /**
   * Removes the overlay and cleans up the event listeners and observers.
   */
  private removeOverlay = () => {
    if (!this.overlayIsOpened) return;

    this.overlayIsOpened = false;
    this.statusOverlayChange.emit(this.overlayIsOpened);

    this.viewContainerRef.clear();
    this.renderer.removeChild(document.body, this.overlayElement);
    this.overlayElement = undefined;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    window.removeEventListener('scroll', this.onWindowEvent, true);
    window.removeEventListener('resize', this.onWindowEvent, true);
  };

  /**
   * Toggles the visibility of the overlay between showing and hiding.
   */
  private toggleOverlay() {
    if (this.overlayIsOpened) this.removeOverlay();
    else this.showOverlay();
  }

  /**
   * Creates the overlay element, sets its content, and positions it correctly.
   */
  private createOverlayElement = () => {
    // Create main overlay element
    this.overlayElement = this.renderer.createElement('div') as HTMLElement;
    this.renderer.appendChild(document.body, this.overlayElement);

    this.renderer.setStyle(this.overlayElement, 'visibility', 'hidden');

    const view = this.viewContainerRef.createEmbeddedView(this.overlayHTML);
    view.rootNodes.forEach((node) =>
      this.renderer.appendChild(this.overlayElement, node)
    );

    this.changeDetectorRef.detectChanges();

    requestAnimationFrame(() => {
      if (this.overlayElement) {
        this.adjustPosition();
        this.renderer.setStyle(this.overlayElement, 'visibility', 'visible');

        this.resizeObserver = new ResizeObserver(() => {
          this.adjustPosition();
        });
        this.resizeObserver.observe(this.overlayElement);
      }
    });

    window.addEventListener('scroll', this.onWindowEvent, true);
    window.addEventListener('resize', this.onWindowEvent, true);
  };

  /**
   * Adjusts the position of the overlay based on the configured position and offsets.
   */
  private adjustPosition = () => {
    if (!this.elementRef?.nativeElement || !this.overlayElement) return;

    const hostPos = this.elementRef.nativeElement.getBoundingClientRect();
    const overlayPos = this.overlayElement?.getBoundingClientRect();
    this.renderer.setStyle(
      this.overlayElement,
      'width',
      `${this.overlayWidth || hostPos.width + 'px'}`
    );

    if (hostPos && overlayPos) {
      let top = hostPos.top,
        left = hostPos.left;

      const defaultMargin = 5;

      // Positioning logic based on the specified overlayPosition
      switch (this.overlayPosition) {
        case 'top-left':
          top = hostPos.top - overlayPos.height - defaultMargin;
          left = hostPos.left;
          break;
        case 'top-center':
          top = hostPos.top - overlayPos.height - defaultMargin;
          left = hostPos.left + hostPos.width / 2 - overlayPos.width / 2;
          break;
        case 'top-right':
          top = hostPos.top - overlayPos.height - defaultMargin;
          left = hostPos.right - overlayPos.width;
          break;
        case 'right-center':
          top = hostPos.top + hostPos.height / 2 - overlayPos.height / 2;
          left = hostPos.right + defaultMargin;
          break;
        case 'left-center':
          top = hostPos.top + hostPos.height / 2 - overlayPos.height / 2;
          left = hostPos.left - overlayPos.width - defaultMargin;
          break;
        case 'bottom-left':
          top = hostPos.bottom + defaultMargin;
          left = hostPos.left;
          break;
        case 'bottom-center':
          top = hostPos.bottom + defaultMargin;
          left = hostPos.left + hostPos.width / 2 - overlayPos.width / 2;
          break;
        case 'bottom-right':
          top = hostPos.bottom + defaultMargin;
          left = hostPos.right - overlayPos.width;
          break;
      }

      // Adjust position based on optional offset configuration
      const adjustOffestPositionOverlay = () => {
        if (this.offsetPositionOverlay) {
          Object.keys(this.offsetPositionOverlay).forEach((key) => {
            if (['bottom', 'top'].includes(key)) {
              top =
                top +
                this.offsetPositionOverlay[key as keyof OffsetPositionOverlay];
            }
            if (['left', 'right'].includes(key)) {
              left =
                left +
                this.offsetPositionOverlay[key as keyof OffsetPositionOverlay];
            }
          });
        }
      };

      adjustOffestPositionOverlay();

      // Adjust to keep overlay within view bounds
      if (top < window.scrollY) top = hostPos.bottom + defaultMargin;
      if (top + overlayPos?.height > window.scrollY + window.innerHeight)
        top = hostPos.top - overlayPos?.height - defaultMargin;
      if (left < 0) left = hostPos.right + defaultMargin;
      if (left + overlayPos?.width > window.innerWidth)
        left = hostPos.left - overlayPos?.width - defaultMargin;

      adjustOffestPositionOverlay();

      // Ensure tooltip stays within visible bounds
      top = Math.max(top, window.scrollY);
      left = Math.max(left, defaultMargin);

      // Apply positioning styles to overlay element
      this.renderer.setStyle(this.overlayElement, 'top', `${top}px`);
      this.renderer.setStyle(this.overlayElement, 'left', `${left}px`);
      this.renderer.setStyle(this.overlayElement, 'position', 'fixed');
      this.renderer.setStyle(this.overlayElement, 'z-index', '1000');
    }
  };

  ngOnDestroy(): void {
    this.listeners.forEach((unlisten) => unlisten());
    this.listeners = [];

    if (this.overlayElement) {
      this.viewContainerRef.clear();
      this.renderer.removeChild(document.body, this.overlayElement);
      this.overlayElement = undefined;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.parentResizeObserver) {
      this.parentResizeObserver.disconnect();
    }

    if (this.setTimeoutOverlay) {
      clearTimeout(this.setTimeoutOverlay);
    }

    if (this.overlayIsOpened) {
      this.statusOverlayChange.emit(false);
    }

    window.removeEventListener('scroll', this.onWindowEvent, true);
    window.removeEventListener('resize', this.onWindowEvent, true);
  }
}
