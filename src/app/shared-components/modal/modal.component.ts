import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../shared.module';
import { slideCustomAnimation } from 'src/app/animations/global.animations';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { ButtonComponent } from '../form/button/button.component';

interface ButtonsFooter {
  disabled?: boolean;
  hidden?: boolean;
  text?: string;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [SharedModule, DisabledElementDirective, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
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
export class ModalComponent {
  @Input() size: 'lg' | 'md' | 'sm' = 'lg';
  @Input() loadingButtons!: boolean;
  @Input() customStyles!: any;
  @Input() title!: string;

  @Input() secondaryButton!: ButtonsFooter;
  @Input() primaryButton!: ButtonsFooter;

  @Output() eventButtonClick = new EventEmitter<boolean>();
}
