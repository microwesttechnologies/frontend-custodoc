import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { UploadDocumentService } from 'Core/Infraestructura/driver-adapter/Services/UploadDocument.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [DialogModule, ButtonModule, InputTextModule, CommonModule, FormsModule, FileUploadModule, ToastModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  providers: [MessageService]
})
export class ModalComponent implements OnInit {
  @Input() visible: boolean = false;
  position: 'right' | 'left' | 'center' | 'top' | 'bottom' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright' = 'center';
  @Output() modalClosed = new EventEmitter<void>();

  @Input() title: string = '';
  @Input() description: string = '';
  @Input() inputs: any[] = [];
  userRole: string = "";
  routerName: string = "";
  selectedFile?: File; 
  uploadedFilePath: string = "";
  numberIdentification: number = 0;

  constructor( private router: Router, private messageService: MessageService, private uploadDocumentService: UploadDocumentService) {}

  ngOnInit(): void {
    this.routerName = this.router.url;
  }

  closeModal() {
    this.visible = false;
    this.modalClosed.emit();
  }

  onFileSelected(event: any) {
    const file: File = event.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  
  onUpload() {
    this.numberIdentification=1024494633;
    if (this.selectedFile && this.numberIdentification) {
      const formData = new FormData();
      formData.append('documento', this.selectedFile, this.selectedFile.name);
      formData.append('identidad', this.numberIdentification.toString()); // Convertir a string
    
      this.uploadDocumentService.uploadDocument(formData).subscribe(
        (response: any) => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response.message });
          this.uploadedFilePath = response.path;
          console.log('Ruta del archivo:', response.path);
          this.closeModal();
        },
        (error: any) => {
          console.error('Error al subir el documento:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al subir el documento.' + (error.error.message || '') });
        }
      );
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor selecciona un archivo y proporciona el número de identificación.' });
    }
  }
  
  saveData() {
    this.onUpload()
    console.log('Datos guardados:', this.inputs);
    this.closeModal();
  }
}
