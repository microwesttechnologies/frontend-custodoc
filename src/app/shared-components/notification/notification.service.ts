import {
  ComponentFactoryResolver,
  ApplicationRef,
  ComponentRef,
  Injectable,
  Injector,
  inject,
} from '@angular/core';
import { NotificationComponent } from './notification.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationComponentRef?: ComponentRef<NotificationComponent>;
  private setTimeoutNotification?: number | ReturnType<typeof setTimeout>;

  private readonly componentFactoryResolver = inject(ComponentFactoryResolver);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);

  showNotification(
    message: string,
    theme: 'success' | 'warning' | 'danger',
    duration = 3000,
    position:
      | 'top-center'
      | 'top-right'
      | 'top-left'
      | 'bottom-center'
      | 'bottom-right'
      | 'bottom-left' = 'top-center'
  ): void {
    // Eliminar la instancia del setTimeout
    if (this.setTimeoutNotification) {
      clearTimeout(this.setTimeoutNotification);
    }

    // Destruir la instancia anterior si existe
    if (this.notificationComponentRef) {
      this.notificationComponentRef.destroy();
    }

    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(
        NotificationComponent
      );
    this.notificationComponentRef = componentFactory.create(this.injector);

    // Configurar los parámetros del componente
    const instance = this.notificationComponentRef.instance;
    instance.message = message;
    instance.positionClass = `notification-${position}`;
    instance.theme = `notification-${theme}`;
    instance.hideNotification = false;

    // Agregar el componente al DOM
    this.appRef.attachView(this.notificationComponentRef.hostView);
    const domElem = (this.notificationComponentRef.hostView as any)
      .rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);

    // Configurar un temporizador para ocultar automáticamente la notificación
    this.setTimeoutNotification = setTimeout(() => {
      instance.hideNotification = true;
      setTimeout(() => this.hideNotification(), 300);
    }, duration);
  }

  hideNotification(): void {
    if (this.notificationComponentRef) {
      this.notificationComponentRef.destroy();
    }
  }
}
