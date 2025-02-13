import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedModule } from '../shared.module';
import { slideCustomAnimation } from 'src/app/animations/global.animations';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { ButtonComponent } from '../form/button/button.component';
import { DisabledByPermissionDirective } from 'src/app/directives/disabled-by-permissions.directive';
import { ModulesKeys } from 'src/app/models/permissions.model';

interface ButtonsFooter {
  disabled?: boolean;
  hidden?: boolean;
  text?: string;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    DisabledByPermissionDirective,
    DisabledElementDirective,
    ButtonComponent,
    SharedModule,
  ],
  templateUrl: './modal.component.html',
  animations: [
    slideCustomAnimation('slideEnterAndLeaveTop', 'Y', '-1rem', '0', {
      enter: '400ms',
      leave: '400ms',
    }),
  ],
})
export class ModalComponent implements OnInit {
  @Input() size: 'lg' | 'md' | 'sm' | 'xs' = 'lg';
  @Input() loadingButtons!: boolean;
  @Input() codeModule!: ModulesKeys;
  @Input() customStylesBody!: any;
  @Input() hideFooter!: boolean;
  @Input() customStyles!: any;
  @Input() isUpdate!: boolean;
  @Input() title!: string;

  @Input() secondaryButton!: ButtonsFooter;
  @Input() primaryButton!: ButtonsFooter;

  @Output() eventButtonClick = new EventEmitter<boolean>();

  ngOnInit(): void {
    // this.customStyles = {
    //   ...this.customStyles,
    //   'grid-template-rows': `${this.title ? '4.5625rem' : ''} calc(100% ${
    //     this.title ? '- 4.5625rem' : ''
    //   } - 4.6875rem) 4.6875rem`,
    // };
  }
}
