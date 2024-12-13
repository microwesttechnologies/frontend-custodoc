import {
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { SharedModule } from '../../shared.module';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';

type InputTypes = 'text' | 'email' | 'password' | 'number';

@Component({
  standalone: true,
  imports: [SharedModule, TooltipDirective],
  selector: 'app-input',
  templateUrl: './input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() type: InputTypes = 'text';
  @Input() defaultLabelError!: boolean;
  @Input() placeholder: string = '';
  @Input() maxLength!: number;
  @Input() id!: string;

  private onChange: Function = (value: any) => { };
  private onTouched: Function = () => { };

  public ngControl!: NgControl;

  public value = '';
  public tempType!: InputTypes;
  public iconPassword = 'fa-eye-slash';

  public get invalid() {
    return this.ngControl?.invalid;
  }

  public get touched() {
    return this.ngControl?.touched;
  }

  public get valid() {
    return this.ngControl?.valid;
  }

  private readonly injector = inject(Injector);

  ngOnInit(): void {
    try {
      this.ngControl = this.injector.get(NgControl);
    } catch (error) {
      console.warn('form control no implemented');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type']) {
      this.tempType = this.type;
    }
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  writeValue(value: string): void {
    this.value = value;
  }

  /**
   * tocar control
   *
   */
  public onBlur(): void {
    if (this.ngControl) {
      this.onTouched();
    }
  }

  /**
   * actualizar el valor del control
   *
   */
  public onInput(value: string) {
    if (this.ngControl) {
      this.value = value;
      this.onChange(this.value);
    }
  }

  public togglePassword(): void {
    this.tempType = this.tempType === 'password' ? 'text' : 'password';
    this.iconPassword = this.tempType === 'password' ? 'fa-eye-slash' : 'fa-eye';
  }
}
