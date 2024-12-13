import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../shared.module';
import { slideCustomAnimation } from 'src/app/animations/global.animations';
import { ButtonComponent } from '../form/button/button.component';
import { ModalComponent } from '../modal/modal.component';
import { InputComponent } from '../form/input/input.component';
import { FormControl, Validators } from '@angular/forms';

interface ButtonsFooter {
  disabled?: boolean;
  hidden?: boolean;
  text?: string;
}

@Component({
  selector: 'app-modal-confirmation-delete',
  standalone: true,
  imports: [SharedModule, ModalComponent, InputComponent],
  templateUrl: './modal-confirmation-delete.component.html',
  styleUrl: './modal-confirmation-delete.component.scss',
  animations: [
    slideCustomAnimation(
      'slideEnterAndLeaveTop',
      'Y',
      '-1rem',
      '0',
      { enter: '400ms', leave: '400ms' },
      {
        enter: true,
        leave: true,
      }
    ),
  ],
})
export class ModalConfirmationDeleteComponent {

  @Input() nameToValidate!: string;
  @Input() title!: string;
  @Input() primaryButton!: ButtonsFooter;

  @Output() eventButtonClick = new EventEmitter<boolean>();

  public name = new FormControl('', [Validators.required]);

  public executeDelete(): void {
    if (this.nameToValidate === this.name.value) {
      this.eventButtonClick.emit(true);
    } else {
      this.name.setErrors({ notMatch: true });
      this.name.markAsTouched();
    }
  }

}
