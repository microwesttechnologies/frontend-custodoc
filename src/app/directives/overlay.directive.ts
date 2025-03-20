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
  EmbeddedViewRef,
} from '@angular/core';
import {
  debounceTime,
  fromEvent,
  Observable,
  Subject,
  Subscription,
  takeUntil,
  throttleTime,
} from 'rxjs';

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
  @Input() closeInsideParent: boolean = true; // Determines if clicking inside the parent should close it.
  @Input() closeOverlay!: boolean; // Input to programmatically close the overlay.
  @Input() openOverlay!: boolean; // Input to programmatically open the overlay.
  @Input() overlayWidth!: string; // Sets a specific width for the overlay.
  @Input() overlayContext: any;
  @Input() closeOnGlobalScroll!: boolean;
  @Input() parent!: string;
  @Input() manualClose: boolean = false;
  @Input() $actionOverlay!: Observable<'open' | 'close'>;
  @Output() statusOverlayChange = new EventEmitter<boolean>(); // Emits the status change of the overlay (opened/closed).

  private overlayIsOpened!: boolean; // Tracks the open state of the overlay.

  private targetInput: HTMLElement | null = null; // References an input inside the parent if present.
  private overlayElement?: HTMLElement; // The main element of the overlay.

  private setTimeoutOverlay?: number | ReturnType<typeof setTimeout>; // Timeout for overlay delay actions.
  private parentResizeObserver!: ResizeObserver; // Observer for resizing the parent element.
  private resizeObserver!: ResizeObserver; // Observer for resizing the tooltip element.

  private $destroy = new Subject<void>();

  private globalListeners: (() => void)[] = []; // Array of listeners for event management.
  private subscriptions: Subscription[] = []; // Array of listeners for event management.
  private listeners: (() => void)[] = []; // Array of listeners for event management.
  private embeddedViewRef: EmbeddedViewRef<any> | null = null;

  private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private elementRef: ElementRef = inject(ElementRef);
  private renderer: Renderer2 = inject(Renderer2);

  ngOnInit(): void {
    if (this.overlayHTML) {
      this.setupEventListeners();
      this.parentResizeObserver = new ResizeObserver(() => {
        if (this.overlayIsOpened) this.adjustPosition();
      });

      this.parentResizeObserver?.observe(this.elementRef.nativeElement);
    }

    this.$actionOverlay?.pipe(takeUntil(this.$destroy))?.subscribe({
      next: (action) =>
        action === 'open' ? this.showOverlay() : this.removeOverlay(),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      if (changes['openOverlay']?.currentValue && !this.overlayIsOpened)
        this.showOverlay();

      if (changes?.['closeOverlay']?.currentValue && this.overlayIsOpened)
        this.removeOverlay();
    }, 0);
  }

  /**
   * Sets up event listeners based on the activation method (hover or click).
   * Adds listeners to handle showing, hiding, and toggling the overlay.
   */
  private setupEventListeners() {
    this.clearListeners();

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
                this.clearSetTimeoutOverlay();
                this.setTimeoutOverlay = setTimeout(
                  () => this.showOverlay(),
                  150
                );
              }
            )
          );
          this.listeners.push(
            this.renderer.listen(
              this.elementRef.nativeElement,
              'mouseleave',
              () => {
                this.clearSetTimeoutOverlay();
                this.setTimeoutOverlay = setTimeout(
                  () => this.removeOverlay(),
                  150
                );
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
  }

  private clearSetTimeoutOverlay(): void {
    if (this.setTimeoutOverlay) {
      clearTimeout(this.setTimeoutOverlay);
      this.setTimeoutOverlay = undefined;
    }
  }

  private clearListeners(global?: boolean): void {
    if (global) {
      this.globalListeners.forEach((unlisten) => unlisten());
      this.globalListeners = [];
    } else {
      this.listeners.forEach((unlisten) => unlisten());
      this.listeners = [];
    }
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

  /**
   * Handles document click events to close the overlay if clicked outside.
   * @param event - The click event.
   */
  private onDocumentClick = (event: Event) => {
    if (this.manualClose) return;
    if (this.overlayElement && this.overlayIsOpened) {
      const targetElement = event.target as HTMLElement;
      const inputId = this.elementRef.nativeElement
        ?.querySelector('input')
        ?.getAttribute('id');
      let isLabel = false;

      if (inputId)
        isLabel =
          targetElement.tagName === 'LABEL' &&
          targetElement.getAttribute('for') === inputId;

      const clickedInsideParent =
        this.elementRef.nativeElement.contains(targetElement) || isLabel;
      const clickedInsideOverlay = this.overlayElement.contains(targetElement);

      if (
        (this.closeInsideParent && clickedInsideParent) ||
        (this.closeInsideOverlay && clickedInsideOverlay) ||
        (!clickedInsideParent && !clickedInsideOverlay)
      )
        this.removeOverlay();
    }
  };

  /**
   * Event handler for window resize and scroll events to adjust overlay positioning.
   */
  private onWindowEvent = (): void => {
    if (this.overlayElement && this.overlayIsOpened) this.adjustPosition();
  };

  private handleGlobalScroll = (event: Event): void => {
    const target = event.target as HTMLElement;

    const isInsideOverlay =
      this.overlayElement?.contains(target) || this.overlayElement === target;

    if (!isInsideOverlay) this.removeOverlay();
  };

  private bindGlobalEvents(): void {
    this.unbindGlobalEvents();

    if (this.closeOnGlobalScroll)
      window.addEventListener('scroll', this.handleGlobalScroll, true);
    else window.addEventListener('scroll', this.onWindowEvent, true);

    this.globalListeners.push(
      this.renderer.listen(window, 'click', (event: Event) =>
        this.onDocumentClick(event)
      )
    );
    this.globalListeners.push(
      this.renderer.listen(window, 'keyup', (event: KeyboardEvent) =>
        this.closeOverlayWithEsc(event)
      )
    );
    this.subscriptions.push(
      fromEvent(window, 'resize')
        .pipe(debounceTime(200))
        .subscribe(() => this.onWindowEvent())
    );
  }

  private unbindGlobalEvents(): void {
    this.clearListeners(true);
    this.clearSubscriptions();
    window.removeEventListener('scroll', this.handleGlobalScroll, true);
    window.removeEventListener('scroll', this.onWindowEvent, true);
  }

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

    if (this.embeddedViewRef) {
      this.embeddedViewRef.destroy();
      this.embeddedViewRef = null;
    }

    if (this.viewContainerRef) this.viewContainerRef.clear();

    if (this.overlayElement) {
      this.renderer.removeChild(document.body, this.overlayElement);
      this.overlayElement = undefined;
    }

    if (this.parentResizeObserver) this.parentResizeObserver.disconnect();

    if (this.resizeObserver) this.resizeObserver.disconnect();

    this.clearSetTimeoutOverlay();
    this.unbindGlobalEvents();
  };

  /**
   * Toggles the visibility of the overlay between showing and hiding.
   */
  private toggleOverlay() {
    if (!this.overlayIsOpened) this.showOverlay();
    else if (this.closeInsideParent) this.removeOverlay();
  }

  /**
   * Creates the overlay element, sets its content, and positions it correctly.
   */
  private createOverlayElement = () => {
    // Create main overlay element
    this.overlayElement = this.renderer.createElement('div') as HTMLElement;

    this.renderer.setStyle(this.overlayElement, 'visibility', 'hidden');
    this.renderer.setStyle(this.overlayElement, 'position', 'fixed');
    this.renderer.setStyle(this.overlayElement, 'z-index', '1000');

    this.embeddedViewRef = this.viewContainerRef.createEmbeddedView(
      this.overlayHTML,
      {
        $implicit: this.overlayContext,
      }
    );
    this.embeddedViewRef.rootNodes.forEach((node) =>
      this.renderer.appendChild(this.overlayElement, node)
    );

    this.renderer.appendChild(document.body, this.overlayElement);
    if (this.parent === 'autocomplete') this.changeDetectorRef.detectChanges();

    requestAnimationFrame(() => {
      if (this.overlayElement) {
        this.adjustPosition();

        if (!this.resizeObserver)
          this.resizeObserver = new ResizeObserver(() => {
            this.renderer.setStyle(
              this.overlayElement,
              'visibility',
              'visible'
            );
            if (this.overlayIsOpened) this.adjustPosition();
          });
        this.resizeObserver?.disconnect();
        this.resizeObserver?.observe(this.overlayElement);

        this.bindGlobalEvents();
      }
    });
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
      this.renderer.setStyle(this.overlayElement, 'left', `${left}px`);
      this.renderer.setStyle(this.overlayElement, 'top', `${top}px`);
    }
  };

  private closeOverlayWithEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.removeOverlay();
  };

  public close(): void {
    this.removeOverlay();
  }

  ngOnDestroy(): void {
    this.clearListeners();
    this.removeOverlay();

    this.$destroy.next();
    this.$destroy.complete();
  }
}
