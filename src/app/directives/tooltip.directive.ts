import {
  ChangeDetectorRef,
  ViewContainerRef,
  SimpleChanges,
  AfterViewInit,
  TemplateRef,
  ElementRef,
  Directive,
  OnDestroy,
  Renderer2,
  Input,
  inject,
} from '@angular/core';

/**
 * Interface for tooltip configuration options.
 */
interface ConfigTooltip {
  position?: 'top' | 'left' | 'right'; // Position of the tooltip relative to the target element.
  activationMode?: 'hover' | 'click'; // Mode of activation (hover or click).
  classes?: string; // Additional CSS classes for styling.
  margin?: {
    top?: number; // Margin from the top edge.
    right?: number; // Margin from the right edge.
    left?: number; // Margin from the left edge.
    bottom?: number; // Margin from the bottom edge.
  };
}

/**
 * Directive to create a customizable tooltip with dynamic positioning and arrow.
 * Author: Jesús David Muñoz Gallego
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements AfterViewInit, OnDestroy {
  @Input('appTooltip') tooltipContent!: string | TemplateRef<HTMLElement>; // The content of the tooltip, either text or a template.

  @Input() configTooltip!: ConfigTooltip; // Configuration for tooltip positioning, activation, and styling.

  private arrowTooltipElement?: HTMLElement; // Element representing the tooltip arrow.
  private tooltipElement?: HTMLElement; // Main tooltip element.

  private parentResizeObserver!: ResizeObserver; // Observer for resizing the parent element.
  private resizeObserver!: ResizeObserver; // Observer for resizing the tooltip element.
  private setTimeoutTooltip?: number | ReturnType<typeof setTimeout>; // Timeout for tooltip delay actions.
  private listeners: (() => void)[] = []; // Array of listeners for event management.

  private readonly changeDetectorRef= inject(ChangeDetectorRef);
  private readonly viewContainerRef= inject(ViewContainerRef);
  private readonly elementRef= inject(ElementRef);
  private readonly renderer= inject(Renderer2);

  ngAfterViewInit(): void {
    this.observeParentSizeChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      'tooltipContent' in changes &&
      changes['tooltipContent']?.currentValue
    ) {
      this.setupEventListeners();
    }
  }

  /**
   * Sets up event listeners based on activation mode (hover or click).
   * Adds listeners to show, hide, and toggle the tooltip.
   */
  private setupEventListeners() {
    this.listeners.forEach((unlisten) => unlisten()); // Clean up existing listeners
    const event = this.configTooltip?.activationMode ?? 'hover'; // Default activation mode is hover.

    switch (event) {
      case 'hover':
        this.listeners.push(
          this.renderer.listen(
            this.elementRef.nativeElement,
            'mouseenter',
            () => {
              if (this.setTimeoutTooltip) {
                clearTimeout(this.setTimeoutTooltip);
                this.setTimeoutTooltip = undefined;
              }

              this.setTimeoutTooltip = setTimeout(
                () => this.showTooltip(),
                150,
              );
            },
          ),
        );
        this.listeners.push(
          this.renderer.listen(
            this.elementRef.nativeElement,
            'mouseleave',
            () => {
              if (this.setTimeoutTooltip) {
                clearTimeout(this.setTimeoutTooltip);
                this.setTimeoutTooltip = undefined;
              }
              this.removeTooltip();
            },
          ),
        );
        break;
      case 'click':
        this.listeners.push(
          this.renderer.listen(this.elementRef.nativeElement, 'click', () =>
            this.toggleTooltip(),
          ),
        );
        break;
    }

    // Add listener to detect clicks outside the tooltip.
    this.listeners.push(
      this.renderer.listen(
        'document',
        'click',
        this.onDocumentClick.bind(this),
      ),
    );
  }

  /**
   * Observes changes in the size of the parent element to adjust tooltip positioning.
   */
  private observeParentSizeChanges(): void {
    this.parentResizeObserver = new ResizeObserver(() => {
      if (this.tooltipElement) {
        this.adjustPosition();
      }
    });
    this.parentResizeObserver.observe(this.elementRef.nativeElement);
  }

  /**
   * Handles document click events to close the tooltip if clicked outside.
   * @param event - The click event.
   */
  private onDocumentClick(event: Event): void {
    if (this.tooltipElement) {
      const targetElement = event.target as HTMLElement;
      const clickedInsideParent =
        this.elementRef.nativeElement.contains(targetElement);

      if (
        !clickedInsideParent ||
        this.configTooltip?.activationMode !== 'click'
      ) {
        this.removeTooltip();
      }
    }
  }

  /**
   * Event handler for window resize and scroll events to adjust tooltip positioning.
   */
  private readonly onWindowEvent = (): void => {
    if (this.tooltipElement) {
      this.adjustPosition();
    }
  };

  /**
   * Shows the tooltip by creating the tooltip element.
   */
  private readonly showTooltip = () => {
    if (this.tooltipElement ?? !this.tooltipContent) return;

    this.createTooltipElement();
  };

  /**
   * Removes the tooltip and cleans up the event listeners and observers.
   */
  private readonly removeTooltip = () => {
    if (!this.tooltipElement) return;

    if (typeof this.tooltipContent !== 'string') this.viewContainerRef.clear();

    this.renderer.removeChild(document.body, this.tooltipElement);
    this.arrowTooltipElement = undefined;
    this.tooltipElement = undefined;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.setTimeoutTooltip) {
      clearTimeout(this.setTimeoutTooltip);
      this.setTimeoutTooltip = undefined;
    }

    window.removeEventListener('scroll', this.onWindowEvent, true);
    window.removeEventListener('resize', this.onWindowEvent, true);
  };

  /**
   * Toggles the visibility of the tooltip between showing and hiding.
   */
  private toggleTooltip(): void {
    if (this.tooltipElement) this.removeTooltip();
    else this.showTooltip();
  }

  private applyAnimation(action: 'up' | 'down') {
    this.renderer.addClass(this.tooltipElement, `scale-${action}-center`);
    this.renderer.removeClass(
      this.tooltipElement,
      `scale-${action === 'down' ? 'up' : 'down'}-center`,
    );
  }

  /**
   * Creates the tooltip element, including the arrow, and positions it correctly.
   */
  private readonly createTooltipElement = () => {
    // Create main tooltip element
    this.tooltipElement = this.renderer.createElement('div') as HTMLElement;
    this.renderer.appendChild(document.body, this.tooltipElement);
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'hidden');

    // Create arrow element and append it to the tooltip
    this.arrowTooltipElement = this.renderer.createElement(
      'div',
    ) as HTMLElement;
    this.renderer.appendChild(this.tooltipElement, this.arrowTooltipElement);
    this.renderer.addClass(this.arrowTooltipElement, 'tooltip-arrow');

    // Add content to the tooltip
    if (typeof this.tooltipContent !== 'string') {
      const view = this.viewContainerRef.createEmbeddedView(
        this.tooltipContent,
      );

      view.rootNodes.forEach((node) =>
        this.renderer.appendChild(this.tooltipElement, node),
      );
    } else {
      const tagP = this.renderer.createElement('p') as HTMLElement;
      this.renderer.appendChild(this.tooltipElement, tagP);

      this.renderer.setProperty(tagP, 'textContent', this.tooltipContent);

      this.renderer.setStyle(tagP, '-webkit-box-orient', 'vertical');
      this.renderer.setStyle(tagP, 'text-overflow', 'ellipsis');
      this.renderer.setStyle(tagP, 'word-break', 'break-word');
      this.renderer.setStyle(tagP, '-webkit-line-clamp', '6');
      this.renderer.setStyle(tagP, 'display', '-webkit-box');
      this.renderer.setStyle(tagP, 'overflow', 'hidden');
      this.renderer.setStyle(tagP, 'color', '#FFFFFF');

      this.renderer.addClass(tagP, 'font-caption-large');
    }

    if (this.configTooltip?.classes) {
      this.renderer.addClass(this.tooltipElement, this.configTooltip?.classes);
    }
    this.renderer.addClass(this.tooltipElement, 'primary-tooltip');

    this.changeDetectorRef.detectChanges();

    requestAnimationFrame(() => {
      if (this.tooltipElement) {
        this.adjustPosition();
        this.renderer.setStyle(this.tooltipElement, 'visibility', 'visible');

        this.resizeObserver = new ResizeObserver(() => this.adjustPosition());
        this.resizeObserver.observe(this.tooltipElement);
      }
    });

    window.addEventListener('scroll', this.onWindowEvent, true);
    window.addEventListener('resize', this.onWindowEvent, true);
  };

  /**
   * Adjusts the position of the tooltip and arrow based on available space and the configured position.
   */
  private readonly adjustPosition = (): void => {
    if (!this.elementRef?.nativeElement || !this.tooltipElement) return;

    const hostPos = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement.getBoundingClientRect();

    if (hostPos && tooltipPos) {
      let top = hostPos.top,
        left = hostPos.left;
      const defaultMargin = 10;
      const extraMarginLeftAndRight = 5;

      // Clear existing arrow position classes
      this.clearArrowClasses();
      switch (this.configTooltip?.position) {
        case 'top':
          top = hostPos.top - tooltipPos.height - defaultMargin;
          left = hostPos.left + hostPos.width / 2 - tooltipPos.width / 2;
          this.renderer.addClass(
            this.arrowTooltipElement,
            'tooltip-arrow-bottom',
          );
          break;
        case 'left':
          top = hostPos.top + hostPos.height / 2 - tooltipPos.height / 2;
          left =
            hostPos.left -
            tooltipPos.width -
            defaultMargin -
            extraMarginLeftAndRight;
          this.renderer.addClass(
            this.arrowTooltipElement,
            'tooltip-arrow-right',
          );
          break;
        case 'right':
          top = hostPos.top + hostPos.height / 2 - tooltipPos.height / 2;
          left = hostPos.right + defaultMargin + extraMarginLeftAndRight;
          this.renderer.addClass(
            this.arrowTooltipElement,
            'tooltip-arrow-left',
          );
          break;
        default:
          top = hostPos.bottom + defaultMargin;
          left = hostPos.left + hostPos.width / 2 - tooltipPos.width / 2;
          this.renderer.addClass(this.arrowTooltipElement, 'tooltip-arrow-top');
          break;
      }

      // Adjust position if tooltip is out of bounds and update arrow class
      if (top < window.scrollY) {
        top = hostPos.bottom + defaultMargin;
        this.clearArrowClasses();
        this.renderer.addClass(this.arrowTooltipElement, 'tooltip-arrow-top');
      }
      if (top + tooltipPos.height > window.scrollY + window.innerHeight) {
        top = hostPos.top - tooltipPos.height - defaultMargin;
        this.clearArrowClasses();
        this.renderer.addClass(
          this.arrowTooltipElement,
          'tooltip-arrow-bottom',
        );
      }
      if (left < 0) {
        left = hostPos.right + defaultMargin + extraMarginLeftAndRight;
        this.clearArrowClasses();
        this.renderer.addClass(this.arrowTooltipElement, 'tooltip-arrow-left');
      }
      if (left + tooltipPos.width > window.innerWidth) {
        left =
          hostPos.left -
          tooltipPos.width -
          defaultMargin -
          extraMarginLeftAndRight;
        this.clearArrowClasses();
        this.renderer.addClass(this.arrowTooltipElement, 'tooltip-arrow-right');
      }

      // Ensure tooltip stays within visible bounds
      top = Math.max(top, window.scrollY);
      left = Math.max(left, defaultMargin);

      // Apply position styles to tooltip
      this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
      this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
      this.renderer.setStyle(this.tooltipElement, 'position', 'fixed');
      this.renderer.setStyle(this.tooltipElement, 'z-index', '1000');
    }
  };

  /**
   * Clears all position classes from the arrow element to avoid conflicts.
   */
  private clearArrowClasses(): void {
    this.renderer.removeClass(this.arrowTooltipElement, 'tooltip-arrow-top');
    this.renderer.removeClass(this.arrowTooltipElement, 'tooltip-arrow-bottom');
    this.renderer.removeClass(this.arrowTooltipElement, 'tooltip-arrow-left');
    this.renderer.removeClass(this.arrowTooltipElement, 'tooltip-arrow-right');
  }

  ngOnDestroy(): void {
    this.listeners.forEach((unlisten) => unlisten());
    this.listeners = [];

    this.removeTooltip();

    if (this.setTimeoutTooltip) {
      clearTimeout(this.setTimeoutTooltip);
      this.setTimeoutTooltip = undefined;
    }

    if (this.parentResizeObserver) {
      this.parentResizeObserver.disconnect();
    }
  }
}
