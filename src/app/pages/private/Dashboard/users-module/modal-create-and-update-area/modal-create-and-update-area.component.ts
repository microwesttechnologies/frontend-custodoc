import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { fadeInCustomAnimation } from 'src/app/animations/global.animations';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { Area } from 'src/app/models/area.model';
import { ButtonComponent } from 'src/app/shared-components/form/button/button.component';
import { InputComponent } from 'src/app/shared-components/form/input/input.component';
import { ModalComponent } from 'src/app/shared-components/modal/modal.component';
import { SharedModule } from 'src/app/shared-components/shared.module';
import { AreaService } from 'src/app/services/external/area.service';
import { NotificationService } from 'src/app/shared-components/notification/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';

@Component({
  selector: 'app-modal-create-and-update-area',
  standalone: true,
  imports: [
    DisabledElementDirective,
    TooltipDirective,
    ButtonComponent,
    InputComponent,
    ModalComponent,
    SharedModule,
  ],
  templateUrl: './modal-create-and-update-area.component.html',
  styleUrl: './modal-create-and-update-area.component.scss',
  animations: [fadeInCustomAnimation('fadeIn', '300ms')],
})
export class ModalCreateAndUpdateAreaComponent implements OnChanges {
  @Input() areas: Area[] = [];
  @Input() listStatus!: any;

  public areasForm!: FormArray<FormGroup>;
  public nameArea = new FormControl();

  private readonly notificationService = inject(NotificationService);
  private readonly areaService = inject(AreaService);

  ngOnChanges(changes: SimpleChanges): void {
    if ('areas' in changes) this.initForm();
  }

  public getFieldNameForm(formGroup: FormGroup): FormControl {
    return formGroup.get('name') as FormControl;
  }

  private initForm(): void {
    this.areasForm = new FormArray<FormGroup>([]);
    this.areas
      .filter((area) => area.id_company)
      .forEach((area) => {
        const formGroup = new FormGroup({
          id_area: new FormControl(area.id_area),
          name: new FormControl(area.name, Validators.required),
          nameBackup: new FormControl(area.name),
        });
        this.areasForm.push(formGroup);
      });

    this.areasForm.markAllAsTouched();
  }

  public createOrUpdateArea(formGroup?: FormGroup, index?: number): void {
    if (formGroup ? formGroup.valid : this.nameArea.value) {
      const endpointToExecute = formGroup
        ? this.areaService.updateArea({
            id_area: formGroup.get('id_area')?.value,
            name: formGroup.get('name')?.value,
          })
        : this.areaService.createArea(this.nameArea.value);

      this.listStatus.savingArea = true;
      endpointToExecute.subscribe({
        next: (response) => {
          this.notificationService.showNotification(
            response.message!,
            response.status ? 'success' : 'danger'
          );

          if (formGroup) {
            const name = formGroup.get('name')?.value;
            formGroup.get('nameBackup')?.setValue(name);
            this.areas[index! + 1].name = name;
          } else {
            this.areas.splice(1, 0, response.record!);
            this.areasForm.insert(
              0,
              new FormGroup({
                id_area: new FormControl(response.record?.id_area),
                name: new FormControl(
                  response.record?.name,
                  Validators.required
                ),
                nameBackup: new FormControl(response.record?.name),
              })
            );
            this.nameArea.reset();
            this.areasForm.markAllAsTouched();
          }

          this.listStatus.savingArea = false;
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.showNotification(
            `Lo sentimos, no se pudo ${
              formGroup ? 'actualizar' : 'agregar'
            } el area`,
            'danger'
          );
          this.listStatus.savingArea = false;
        },
      });
    }
  }
}
