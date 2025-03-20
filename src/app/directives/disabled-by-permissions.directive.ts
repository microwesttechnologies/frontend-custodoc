import { ModulesKeys, PermissionsKeys } from '../models/permissions.model';
import { UserLocalService } from '../services/local/user.service';
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
  selector: '[appDisabledByPermission]',
  standalone: true,
})
export class DisabledByPermissionDirective
  implements OnInit, OnChanges, OnDestroy
{
  @Input('appDisabledByPermission') codeModule!: ModulesKeys;
  @Input() opacityPermission: string | number = 0.7;
  @Input() permission: PermissionsKeys = 'CREATE';
  @Input() disabledAnyWay!: boolean;
  @Input() remove!: boolean;

  private mutationObserver!: MutationObserver;
  private modifyingInProgress!: boolean;
  private disabled = false;

  private readonly userLocalService = inject(UserLocalService);
  private readonly renderer = inject(Renderer2);
  private readonly el = inject(ElementRef);

  ngOnInit() {
    this.mutationObserver = new MutationObserver((mutations) => {
      if (this.modifyingInProgress || !this.disabled) return;

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
      ('codeModule' in changes && changes['codeModule']?.currentValue) ||
      ('permission' in changes &&
        changes['permission']?.currentValue &&
        this.codeModule)
    ) {
      this.disabled =
        this.disabledAnyWay ||
        !this.userLocalService.menuSidebar?.find(
          (module) => module.code === this.codeModule && module[this.permission]
        );

      this.updateStateElement();
    }

    if (
      'disabledAnyWay' in changes &&
      (!changes['disabledAnyWay']?.firstChange ||
        changes['disabledAnyWay']?.currentValue)
    ) {
      this.disabled =
        this.disabledAnyWay ||
        (this.codeModule &&
          !this.userLocalService.menuSidebar?.find(
            (module) =>
              module.code === this.codeModule && module[this.permission]
          ));
      this.updateStateElement();
    }
  }

  private updateStateElement(): void {
    this.modifyingInProgress = true;
    if (this.disabled) {
      if (this.remove) this.el.nativeElement.remove();
      else {
        this.renderer.setAttribute(
          this.el.nativeElement,
          'elementIsDisabledByPermission',
          'true'
        );
        this.renderer.setStyle(
          this.el.nativeElement,
          'opacity',
          this.opacityPermission
        );
        this.modifyingInProgress = false;
        this.disableElement(this.el.nativeElement);
        this.disableChildren(this.el.nativeElement);
      }
    } else {
      this.renderer.removeAttribute(
        this.el.nativeElement,
        'elementIsDisabledByPermission'
      );
      this.renderer.removeStyle(this.el.nativeElement, 'opacity');
      this.modifyingInProgress = false;
      this.enableElement(this.el.nativeElement, true);
      this.enableChildren(this.el.nativeElement);
    }
  }

  private disableElement(element: HTMLElement): void {
    if (
      this.isInteractiveElement(element) ||
      this.attributeElementIsDisabledByPermission(element)
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

      if (this.attributeElementIsDisabledByPermission(child)) {
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

      if (this.attributeElementIsDisabledByPermission(child)) break;

      this.enableElement(child);
      if (child?.children?.length) this.enableChildren(child);
    }
  }

  private attributeElementIsDisabledByPermission(
    element: HTMLElement
  ): boolean {
    return (
      element.hasAttribute &&
      element.hasAttribute('elementIsDisabledByPermission') &&
      element.getAttribute('elementIsDisabledByPermission') === 'true'
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
