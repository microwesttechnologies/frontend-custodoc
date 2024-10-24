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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { ListFields } from 'src/app/models/modal.model';
import { SharedModule } from '../shared.module';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { GetObjectPropertiesPipe } from 'src/app/pipes/get-object-properties.pipe';
import { isObjectValidator } from 'src/app/services/local/helper.service';

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
    PasswordModule,
    SharedModule,
    GetObjectPropertiesPipe,
  ],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  providers: [MessageService],
})
export class ModalComponent implements OnInit {
  @Input() withFile!: boolean;
  @Input() description: string = '';
  @Input() title: string = '';
  @Input() listFields!: ListFields;

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
  @Output() saveData = new EventEmitter<{ form: FormGroup; file?: File }>();

  public selectedFile?: File;
  public formGroup!: FormGroup;

  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.formGroup = this.createForm();
  }

  private createForm(): FormGroup {
    const group = this.formBuilder.group({});

    Object.keys(this.listFields).forEach((key) => {
      const validators = this.listFields[key].required
        ? [Validators.required]
        : [];

      if (['select', 'autocomplete'].includes(this.listFields[key].type!)) {
        validators.push(isObjectValidator);
      }

      group.addControl(
        key,
        this.formBuilder.control(this.listFields[key].value, validators)
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

  isFieldInvalid(key: string): boolean {
    return (this.formGroup.get(key)?.invalid &&
      this.formGroup.get(key)?.touched) as boolean;
  }

  onSubmit(): void {
    this.formGroup.markAllAsTouched();
    if (
      this.formGroup.valid &&
      (!this.withFile || (this.withFile && this.selectedFile))
    ) {
      this.saveData.emit({
        form: this.formGroup,
        file: this.selectedFile,
      });
    }
  }
}
