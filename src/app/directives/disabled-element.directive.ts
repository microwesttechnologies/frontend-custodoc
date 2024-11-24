import {
  SimpleChanges,
  ElementRef,
  OnDestroy,
  Directive,
  Renderer2,
  OnChanges,
  OnInit,
  inject,
  Input,
} from '@angular/core';

@Directive({
  selector: '[appDisabledElement]',
  standalone: true,
})
export class DisabledElementDirective implements OnInit, OnChanges, OnDestroy {
  @Input() opacityElement: string | number = 0.6;
  @Input() appDisabledElement!: boolean;

  private mutationObserver!: MutationObserver;
  private isPreviouslyDisabled!: boolean;
  private modifyingInProgress!: boolean;

  private readonly renderer = inject(Renderer2);
  private readonly el = inject(ElementRef);

  ngOnInit() {
    this.mutationObserver = new MutationObserver((mutations) => {
      if (this.modifyingInProgress || !this.appDisabledElement) return;

      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName) {
          const targetElement = mutation.target as HTMLElement;
          if (
            mutation.oldValue ===
              targetElement.getAttribute(mutation.attributeName) ||
            !mutation.oldValue
          )
            return;

          if (
            (mutation.attributeName === 'style' &&
              targetElement.style.pointerEvents !== 'none') ||
            (mutation.attributeName === 'disabled' &&
              targetElement.getAttribute('disabled') !== 'true')
          ) {
            this.disableElement(targetElement);
          }
        }

        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              this.disableElement(node);
              if (node?.children?.length) this.disableChildren(node);
            }
          });
        }
      });
    });

    this.connectObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      'appDisabledElement' in changes &&
      (changes['appDisabledElement']?.currentValue ||
        !changes['appDisabledElement']?.firstChange)
    ) {
      if (this.appDisabledElement || this.isPreviouslyDisabled)
        this.isPreviouslyDisabled = this.appDisabledElement;
      this.updateStateElement();
    }
  }

  private updateStateElement(): void {
    this.modifyingInProgress = true;
    if (this.appDisabledElement) {
      this.renderer.setAttribute(
        this.el.nativeElement,
        'elementIsDisabled',
        'true'
      );
      this.renderer.setStyle(
        this.el.nativeElement,
        'opacity',
        this.opacityElement
      );
      this.modifyingInProgress = false;
      this.disableElement(this.el.nativeElement);
      this.disableChildren(this.el.nativeElement);
    } else {
      this.renderer.removeAttribute(this.el.nativeElement, 'elementIsDisabled');
      this.renderer.removeStyle(this.el.nativeElement, 'opacity');
      this.modifyingInProgress = false;
      this.enableElement(this.el.nativeElement, true);
      this.enableChildren(this.el.nativeElement);
    }
  }

  private disableElement(element: HTMLElement): void {
    if (
      this.isInteractiveElement(element) ||
      this.attributeElementIsDisabled(element)
    ) {
      this.modifyingInProgress = true;

      if (element.hasAttribute('contentEditable')) {
        if (!element.hasAttribute('notChangeContentEditable')) {
          this.renderer.setAttribute(element, 'contentEditable', 'false');
        }
      } else {
        if (element.style.pointerEvents !== 'none')
          this.renderer.setStyle(element, 'pointer-events', 'none');

        if (element.getAttribute('disabled') !== 'true') {
          this.renderer.setAttribute(element, 'disabled', 'true');
        }
      }

      this.modifyingInProgress = false;
    }
  }

  private disableChildren(element: HTMLElement): void {
    const children = element.children;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;

      if (this.attributeElementIsDisabled(child)) {
        this.renderer.removeStyle(child, 'opacity');
        break;
      }

      this.disableElement(child);
      if (child?.children?.length) this.disableChildren(child);
    }
  }

  private enableElement(element: HTMLElement, withDirective = false): void {
    if (this.isInteractiveElement(element) || withDirective) {
      this.modifyingInProgress = true;
      if (element.hasAttribute('contentEditable')) {
        if (!element.hasAttribute('notChangeContentEditable')) {
          this.renderer.setAttribute(element, 'contentEditable', 'true');
        }
      } else {
        this.renderer.removeStyle(element, 'pointer-events');
        this.renderer.removeAttribute(element, 'disabled');
        this.modifyingInProgress = false;
      }
    }
  }

  private enableChildren(element: HTMLElement): void {
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;

      if (this.attributeElementIsDisabled(child)) break;

      this.enableElement(child);
      if (child?.children?.length) this.enableChildren(child);
    }
  }

  private attributeElementIsDisabled(element: HTMLElement): boolean {
    return (
      element.hasAttribute &&
      element.hasAttribute('elementIsDisabled') &&
      element.getAttribute('elementIsDisabled') === 'true'
    );
  }

  private isInteractiveElement(element: HTMLElement): boolean {
    const interactiveTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'];
    const isContentEditable = element.hasAttribute('contentEditable');
    return interactiveTags.includes(element.tagName) || isContentEditable;
  }

  private connectObserver(): void {
    if (this.mutationObserver) {
      this.mutationObserver.observe(this.el.nativeElement, {
        attributeFilter: ['style', 'disabled'],
        attributeOldValue: true,
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
  }

  private disconnectObserver(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  ngOnDestroy(): void {
    this.disconnectObserver();
  }
}
