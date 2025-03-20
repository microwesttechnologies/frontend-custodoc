import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SafeUrlPipe } from 'src/app/pipes/safe-url.pipe';
import { DocumentService } from 'src/app/services/external/document.service';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { SharedModule } from 'src/app/shared-components/shared.module';

@Component({
  selector: 'app-modal-preview-document',
  standalone: true,
  imports: [SharedModule, ModalComponent, SafeUrlPipe],
  templateUrl: './modal-preview-document.component.html',
  styleUrl: './modal-preview-document.component.scss',
})
export class ModalPreviewDocumentComponent {
  @Output() eventClose = new EventEmitter<void>();

  @Input() listStatus?: any;
  @Input() id_history?: number;

  public fileUrl!: string;

  private readonly notificationService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);

  ngOnInit(): void {
    this.previewFile();
  }

  private previewFile(): void {
    this.documentService
      .getFile(new HttpParams().append('id_history', this.id_history!))
      .subscribe({
        next: (file) => {
          this.fileUrl = `${URL.createObjectURL(file)}#toolbar=0&navpanes=0`;
        },
        error: (err) => {
          console.error(err);
          this.notificationService.showNotification(
            'Lo sentimos, no se pudo mostrar el archivo',
            'danger'
          );
        },
      });
  }
}
