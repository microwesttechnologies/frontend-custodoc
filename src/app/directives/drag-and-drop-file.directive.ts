import {
  EventEmitter,
  HostListener,
  Directive,
  Renderer2,
  inject,
  Output,
} from '@angular/core';
import { NotificationService } from '../shared-components/notification/notification.service';

@Directive({
  selector: '[appDragAndDropFile]',
  standalone: true,
})
export class DragAndDropFileDirective {
  @Output() filesDropped = new EventEmitter<File[]>();

  private overlay: HTMLElement | null = null;

  private notificationService = inject(NotificationService);
  private renderer = inject(Renderer2);

  @HostListener('document:dragenter', ['$event'])
  onDragEnter(event: DragEvent) {
    event.preventDefault();
    this.showOverlay();
  }

  @HostListener('document:dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    if (event.relatedTarget === null) {
      this.hideOverlay();
    }
  }

  @HostListener('document:dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('document:drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.hideOverlay();

    if (event.dataTransfer?.files) {
      const files: File[] = Array.from(event.dataTransfer.files).filter(
        (file) => file.type === 'application/pdf'
      );
      if (files.length > 0) {
        this.filesDropped.emit(files);
      } else {
        this.notificationService.showNotification(
          'Solo se pueden cargar archivos de tipo PDF',
          'danger'
        );
      }
    }
  }

  private showOverlay() {
    if (!this.overlay) {
      this.overlay = this.renderer.createElement('div');
      this.renderer.setStyle(this.overlay, 'background', 'rgba(0, 0, 0, 0.5)');
      this.renderer.setStyle(this.overlay, 'justify-content', 'center');
      this.renderer.setStyle(this.overlay, 'align-items', 'center');
      this.renderer.addClass(this.overlay, 'font-headline-small');
      this.renderer.setStyle(this.overlay, 'position', 'fixed');
      this.renderer.setStyle(this.overlay, 'color', '#FFFFFF');
      this.renderer.setStyle(this.overlay, 'height', '100vh');
      this.renderer.setStyle(this.overlay, 'display', 'flex');
      this.renderer.setStyle(this.overlay, 'z-index', '9999');
      this.renderer.setStyle(this.overlay, 'width', '100vw');
      this.renderer.setStyle(this.overlay, 'left', '0');
      this.renderer.setStyle(this.overlay, 'top', '0');

      this.overlay!.innerText = '¡Suelta los archivos aquí!';

      this.renderer.appendChild(document.body, this.overlay);
    }
  }

  private hideOverlay() {
    if (this.overlay) {
      this.renderer.removeChild(document.body, this.overlay);
      this.overlay = null;
    }
  }
}
