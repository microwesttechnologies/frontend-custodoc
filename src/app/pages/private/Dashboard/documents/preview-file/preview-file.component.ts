import { DocumentService } from 'src/app/services/external/document.service';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrlPipe } from 'src/app/pipes/safe-url.pipe';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-preview-file',
  standalone: true,
  imports: [SafeUrlPipe],
  templateUrl: './preview-file.component.html',
  styleUrl: './preview-file.component.scss',
})
export class PreviewFileComponent implements OnInit {
  public fileUrl?: string;

  private readonly notificationService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const id = +this.activatedRoute.snapshot.paramMap.get('id')!;
    if (id) this.previewFile(id);
    else this.router.navigate(['/']);
  }

  public previewFile(id: number) {
    this.documentService
      .getFile(new HttpParams().append('id_history', id))
      .subscribe({
        next: (file) => {
          this.fileUrl = `${URL.createObjectURL(file)}`;
        },
        error: (err) => {
          console.error(err);
          this.notificationService.showNotification(
            'Lo sentimos, no se pudo mostrar el archivo',
            'danger'
          );
          this.router.navigate(['/']);
        },
      });
  }
}
