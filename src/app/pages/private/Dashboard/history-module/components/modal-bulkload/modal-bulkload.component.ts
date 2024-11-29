import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { TabsModule } from 'src/app/shared-components/tabs/tabs.module';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { validateLimitText } from 'src/app/services/local/helper.service';
import { Customer } from 'src/app/models/customer.model';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { DocumentService } from 'src/app/services/external/document.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-modal-bulkload',
  standalone: true,
  imports: [
    DisabledElementDirective,
    TooltipDirective,
    ModalComponent,
    SharedModule,
    TabsModule,
  ],
  templateUrl: './modal-bulkload.component.html',
  styleUrl: './modal-bulkload.component.scss',
})
export class ModalBulkloadComponent {
  @ViewChild('inputPdfs') inputPdfs!: ElementRef<HTMLInputElement>;
  @ViewChild('inputCsv') inputCsv!: ElementRef<HTMLInputElement>;

  @Input() customers: Customer[] = [];
  @Input() showModalBulkload = false;

  @Output() showModalBulkloadChange = new EventEmitter<
    'close' | 'show' | 'refresh'
  >();

  public selectedIndexTabs = 0;
  public selectedIndexStep = 0;
  public selectedFileCsv?: File;
  public csvData: any[] = []; // Array para almacenar los datos del CSV
  public selectedFilesPdf: File[] = [];
  public errorsMessage: string[] = []; // Mensaje de error en validaciones
  public headers: string[] = []; // Almacena las columnas del CSV

  public listStatus = {
    uploadingFiles: false,
  };

  public validateLimitText = validateLimitText;

  private readonly notificationService = inject(NotificationService);
  private readonly documentService = inject(DocumentService);

  /**
   * Procesar archivo CSV al cargarlo
   */
  public onDataFileChange(event: any) {
    this.selectedFileCsv = event.target.files?.[0];
    if (this.selectedFileCsv) {
      this.inputCsv.nativeElement.value = '';
      this.selectedFilesPdf = [];
      this.errorsMessage = [];

      const reader = new FileReader();

      reader.onload = () => {
        const text = reader.result as string;

        // Detectar delimitador
        const delimiter = this.detectDelimiter(text);

        // Procesar el archivo
        if (delimiter) {
          this.processCsvData(text, delimiter);
        } else {
          this.selectedIndexTabs = 1;
          this.errorsMessage.push(
            'El archivo CSV tiene un formato incorrecto o delimitador no válido.'
          );
        }
      };

      reader.onerror = () => {
        this.selectedIndexTabs = 1;
        this.errorsMessage.push(
          'Error al leer el archivo. Por favor, inténtalo de nuevo.'
        );
      };

      reader.readAsText(this.selectedFileCsv);
    }
  }

  /**
   * Detectar delimitador (, o ;)
   * @param text
   * @returns Delimitador
   */
  private detectDelimiter(text: string): string | null {
    const delimiters = [',', ';'];
    const firstLine = text.split('\n')[0]; // Tomar la primera línea del archivo

    for (const delimiter of delimiters) {
      if (firstLine.includes(delimiter)) {
        return delimiter;
      }
    }

    return null; // Si no se encuentra delimitador válido
  }

  /**
   * Procesar los datos del archivo CSV
   * @param text
   * @param delimiter
   */
  private processCsvData(text: string, delimiter: string) {
    const lines = text.split('\n').filter((line) => line.trim() !== ''); // Dividir líneas y eliminar vacías
    const headers = lines[0]
      .split(delimiter)
      .map((header) => header.trim().replace(/^"|"$/g, '')); // Quitar espacios y comillas

    if (headers.length !== 4) {
      this.selectedIndexTabs = 1;
      this.errorsMessage.push(
        `El archivo solo puede tener <strong>4</strong> columnas y tiene <strong>${headers.length}</strong> en la fila <strong>1</strong>`
      );
      return;
    }

    this.headers = headers; // Guardar encabezados

    // Procesar filas y eliminar aquellas que estén completamente vacías
    this.csvData = lines.slice(1).map((line, indexLine) => {
      const values = line
        .split(delimiter)
        .map((value) => value.trim().replace(/^"|"$/g, '')); // Quitar espacios y comillas
      const row: any = {};

      headers.forEach((header, indexHeader) => {
        row[indexHeader] = values[indexHeader] || ''; // Asignar valores a sus claves correspondientes
      });

      return row;
    });

    // Filtrar registros donde todas las columnas están vacías
    this.csvData = this.csvData.filter((row) =>
      Object.values(row).some((value) => value !== '')
    );

    this.csvData.forEach((row, indexRow) => {
      const customerExists = this.customers?.find(
        (customer) => customer.identification === row[0]
      );

      headers.forEach((header, indexHeader) => {
        if (indexHeader !== 2 && !row[indexHeader]) {
          this.errorsMessage.push(
            `La columna <strong>${
              headers[indexHeader]
            }</strong> en la fila <strong>${indexRow + 2}</strong> esta vacio`
          );
        }
      });

      if (!customerExists) {
        this.errorsMessage.push(
          `La columna ${headers[0]} con el valor <strong>${
            row[0]
          }</strong> en la fila <strong>${indexRow + 2}</strong> no existe`
        );
      }
    });

    if (!this.csvData.length || !headers.length) {
      this.errorsMessage.push('El archivo esta vacio');
    }

    this.selectedIndexTabs = this.errorsMessage.length
      ? 1
      : this.selectedIndexTabs;

    this.selectedIndexStep = this.errorsMessage.length
      ? this.selectedIndexStep
      : 1;

    this.notificationService.showNotification(
      this.errorsMessage.length
        ? 'Hay errores en el archivo CSV, debes solucionarlos para poder continuar'
        : 'Registros agregados, ahora debes cargar los archivos PDF',
      this.errorsMessage.length ? 'danger' : 'success',
      5000
    );
  }

  /**
   * Manejar archivos PDF asociados
   */
  public onPdfFileChange(event: any) {
    this.selectedFilesPdf = [];
    const files = event.target.files;
    if (files) {
      const nameFiles: any[] = [];

      for (let i = 0; i < files?.length; i++) {
        nameFiles.push(files[i]?.name);
        this.selectedFilesPdf?.push(files[i]);
      }

      this.csvData.forEach((row, indexRow) => {
        if (!nameFiles.includes(row[3])) {
          const message = `El archivo en la fila <strong>${
            indexRow + 2
          }</strong> no tiene coincidencia`;
          const messageExists = this.errorsMessage.some(
            (mess) => mess === message
          );
          if (!messageExists) {
            this.errorsMessage.push(message);
          }
        }
      });

      this.selectedIndexTabs = this.errorsMessage.length
        ? 1
        : this.selectedIndexTabs;

      this.notificationService.showNotification(
        this.errorsMessage.length
          ? 'Hay errores con los archivos PDF, debes solucionarlos para poder continuar'
          : 'Todos los registros fueron agregados exitosamente, ya puedes cargar los documentos',
        this.errorsMessage.length ? 'danger' : 'success',
        5000
      );
      this.inputPdfs.nativeElement.value = '';
    }
  }

  public bulkUploadDocuments(action: boolean): void {
    if (action) {
      this.listStatus.uploadingFiles = true;
      const formData = new FormData();

      this.csvData.forEach((record, index) => {
        formData.append(`documents[${index}][identification]`, record[0]);
        formData.append(`documents[${index}][name]`, record[1]);
        formData.append(`documents[${index}][description]`, record[2]);
        formData.append(
          `documents[${index}][file]`,
          this.selectedFilesPdf.find((file) => file.name === record[3])!
        );
      });

      this.documentService.bulkUploadDocuments(formData).subscribe({
        next: (response) => {
          if (response.status) {
            this.showModalBulkloadChange.emit('refresh');
          } else {
            this.notificationService.showNotification(
              response.message!,
              'danger'
            );
          }
          this.listStatus.uploadingFiles = false;
        },
        error: (error: HttpErrorResponse) => {
          this.listStatus.uploadingFiles = false;
          this.notificationService.showNotification(
            'Lo sentimos, no se pudieron cargar los documentos',
            'danger'
          );
        },
      });
    } else {
      this.showModalBulkload = false;
      this.showModalBulkloadChange.emit('close');
    }
  }
}
