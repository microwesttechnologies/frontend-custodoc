import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { ListFields } from '../../models/modal.model';
import { SharedModule } from '../shared.module';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    AutoCompleteModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FileUploadModule,
    DropdownModule,
    ToastModule,
    SharedModule,
  ],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  providers: [MessageService],
})
export class ModalComponent implements OnInit {
  @Input() withFile: boolean = false;
  @Input() description: string = '';
  @Input() title: string = '';
  @Input() listFields: ListFields[] = [];

  position:
    | 'right'
    | 'left'
    | 'center'
    | 'top'
    | 'bottom'
    | 'topleft'
    | 'topright'
    | 'bottomleft'
    | 'bottomright' = 'center';
  @Output() modalClosed = new EventEmitter<void>();
  @Output() saveData = new EventEmitter<{ data: FormGroup; file?: File }>();

  public selectedFile?: File;
  public formGroup!: FormGroup;

  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.formGroup = this.createForm();
  }

  createForm(): FormGroup {
    const group = this.formBuilder.group({});

    this.listFields.forEach((field) => {
      const validators = field.required ? [Validators.required] : [];
      group.addControl(
        field.key,
        this.formBuilder.control(field.value, validators)
      );
    });

    return group;
  }

  closeModal() {
    this.modalClosed.emit();
  }

  onFileSelected(event: any) {
    const file: File = event.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  search(event: any, field: ListFields) {
    const query = event.query as string;

    field.dataFilter = field.data?.filter((item) =>
      item[field.keyAutoComplete as string]
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }

  isFieldInvalid(key: string): boolean {
    return (this.formGroup.get(key)?.invalid &&
      this.formGroup.get(key)?.touched) as boolean;
  }

  // onUpload() {
  //   this.numberIdentification = 1024494633;
  //   if (this.selectedFile && this.numberIdentification) {
  //     const formData = new FormData();
  //     formData.append('documento', this.selectedFile, this.selectedFile.name);
  //     formData.append('identidad', this.numberIdentification.toString()); // Convertir a string

  //     // this.uploadDocumentService.uploadDocument(formData).subscribe(
  //     //   (response: any) => {
  //     //     this.messageService.add({
  //     //       severity: 'success',
  //     //       summary: 'Éxito',
  //     //       detail: response.message,
  //     //     });
  //     //     this.uploadedFilePath = response.path;
  //     //     console.log('Ruta del archivo:', response.path);
  //     //     this.closeModal();
  //     //   },
  //     //   (error: any) => {
  //     //     console.error('Error al subir el documento:', error);
  //     //     this.messageService.add({
  //     //       severity: 'error',
  //     //       summary: 'Error',
  //     //       detail:
  //     //         'Error al subir el documento.' + (error.error.message || ''),
  //     //     });
  //     //   }
  //     // );
  //   } else {
  //     this.messageService.add({
  //       severity: 'warn',
  //       summary: 'Advertencia',
  //       detail:
  //         'Por favor selecciona un archivo y proporciona el número de identificación.',
  //     });
  //   }
  // }

  onSubmit(): void {
    this.formGroup.markAllAsTouched();
    console.log(this.formGroup.value);
    if (this.formGroup.valid) {
      this.saveData.emit({
        data: this.formGroup,
        file: this.selectedFile,
      });
    }
  }
}
