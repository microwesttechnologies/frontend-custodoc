import {
  Component,
  inject,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { homologateText } from 'src/app/globals/homologate-text';
import { Area } from 'src/app/models/area.model';
import { Customer } from 'src/app/models/customer.model';
import { Document } from 'src/app/models/document.model';
import { SafeUrlPipe } from 'src/app/pipes/safe-url.pipe';
import { SplitTextPipe } from 'src/app/pipes/split-text.pipe';
import { DocumentService } from 'src/app/services/external/document.service';
import { UserLocalService } from 'src/app/services/local/user.service';
import { AutoCompleteComponent } from 'src/app/shared-components/form/autocomplete/autocomplete.component';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { SelectComponent } from 'src/app/shared-components/form/select/select.component';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { SharedModule } from 'src/app/shared-components/shared.module';

@Component({
  selector: 'app-modal-create-and-update-document',
  standalone: true,
  imports: [
    DisabledElementDirective,
    AutoCompleteComponent,
    SelectComponent,
    ModalComponent,
    InputComponent,
    SplitTextPipe,
    SharedModule,
    SafeUrlPipe,
  ],
  templateUrl: './modal-create-and-update-document.component.html',
  styleUrl: './modal-create-and-update-document.component.scss',
})
export class ModalCreateAndUpdateDocumentComponent implements OnInit {
  @Output() eventRefresh = new EventEmitter<void>();
  @Output() eventClose = new EventEmitter<void>();

  @Input() id_folder: number | null = null;
  @Input() id_area: number | null = null;
  @Input() documentToUpdate?: Document;
  @Input() customers: Customer[] = [];
  @Input() areas: Area[] = [];
  @Input() listStatus?: any;

  public documentForm!: FormGroup;

  public pdfSrc?: SafeResourceUrl;
  public selectedFilePdf?: File;
  public fileUrl?: string;

  public homologateText = homologateText;

  private readonly notificationService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);
  private readonly formBuilder = inject(FormBuilder);
  public userLocalService = inject(UserLocalService);
  private readonly sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.documentForm = this.formBuilder.group({
      id_history: new FormControl(this.documentToUpdate?.id_history ?? null),
      name: new FormControl(this.documentToUpdate?.name ?? null, [
        Validators.required,
      ]),
      description: new FormControl(this.documentToUpdate?.description ?? null),
    });

    if (
      this.userLocalService.user?.type_company === 'IPS' ||
      this.userLocalService?.companySelected?.type_company === 'IPS'
    ) {
      this.documentForm.addControl(
        'identification',
        new FormControl('', [Validators.required])
      );
    } else {
      this.documentForm.addControl(
        'id_area',
        new FormControl(this.documentToUpdate?.id_area || this.id_area, [
          Validators.required,
        ])
      );
    }

    if (this.id_folder)
      this.documentForm.addControl(
        'id_folder',
        new FormControl(this.id_folder)
      );

    if (this.userLocalService?.companySelected?.id_company)
      this.documentForm.addControl(
        'id_company',
        new FormControl(this.userLocalService?.companySelected?.id_company)
      );

    if (this.documentToUpdate) {
      this.documentForm.addControl(
        'path',
        new FormControl(this.documentToUpdate?.path)
      );

      this.documentForm.markAllAsTouched();
      this.previewFile(this.documentToUpdate?.id_history!);
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFilePdf = file;

      if (file.type === 'application/pdf') {
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          `${URL.createObjectURL(file)}#toolbar=0&navpanes=0`
        );
      } else {
        this.notificationService.showNotification(
          `Solo se permiten archivos PDF`,
          'danger'
        );
      }
    } else {
      this.selectedFilePdf = undefined;
      this.pdfSrc = undefined;
    }
  }

  public createOrUpdateDocument(): void {
    this.documentForm.markAllAsTouched();

    if (
      this.documentForm.valid &&
      (this.selectedFilePdf || this.fileUrl) &&
      !this.listStatus.savingDocument
    ) {
      const formData = new FormData();

      Object.entries(this.documentForm.value).forEach((elm: any[]) => {
        formData.append(elm[0], elm[1] ?? '');
      });
      if (this.selectedFilePdf) {
        formData.append('file', this.selectedFilePdf!);
      }

      this.listStatus.savingDocument = true;
      this.documentService.createOrUpdateDocument(formData).subscribe({
        next: (response) => {
          if (response.status) {
            this.eventRefresh.emit();
            this.notificationService.showNotification(
              `${homologateText(
                this.userLocalService?.user?.type_company!,
                'documento'
              )} se agrego exitosamente`,
              'success'
            );
            this.closeModal();
          } else {
            this.notificationService.showNotification(
              response.message!,
              'danger'
            );
          }
          this.listStatus.savingDocument = false;
        },
        error: (error) => {
          this.listStatus.savingDocument = false;
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo ${
              this.documentToUpdate ? 'actualizar ' : 'crear '
            } ${homologateText(
              this.userLocalService?.user?.type_company!,
              'documento'
            )}`,
            'danger'
          );
        },
      });
    }
  }

  private previewFile(id_history: number) {
    this.documentService.getFile(id_history).subscribe({
      next: (file) =>
        (this.fileUrl = `${URL.createObjectURL(file)}#toolbar=0&navpanes=0`),
      error: (err) => {
        console.error(err);
        this.notificationService.showNotification(
          'Lo sentimos, no se pudo mostrar el archivo',
          'danger'
        );
      },
    });
  }

  public closeModal(): void {
    this.listStatus.showModalDocument = false;
    this.eventClose.emit();
  }
}
