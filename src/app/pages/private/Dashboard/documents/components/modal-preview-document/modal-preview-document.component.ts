import { Component, Input } from '@angular/core';
import { SafeUrlPipe } from 'src/app/pipes/safe-url.pipe';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { SharedModule } from 'src/app/shared-components/shared.module';

@Component({
  selector: 'app-modal-preview-document',
  standalone: true,
  imports: [SharedModule, ModalComponent, SafeUrlPipe],
  templateUrl: './modal-preview-document.component.html',
  styleUrl: './modal-preview-document.component.scss',
})
export class ModalPreviewDocumentComponent {
  @Input() listStatus?: any;
  @Input() fileUrl?: string;
}
