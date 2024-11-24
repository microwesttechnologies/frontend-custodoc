import {
  Component,
  Injector,
  Input,
  OnInit,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { SharedModule } from '../../shared.module';

@Component({
  standalone: true,
  imports: [SharedModule],
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
export class InputComponent implements OnInit, ControlValueAccessor {
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() defaultLabelError!: boolean;
  @Input() placeholder: string = '';
  @Input() maxLength!: number;
  @Input() id!: string;

  private onChange: Function = (value: any) => {};
  private onTouched: Function = () => {};

  public ngControl!: NgControl;

  public value = '';

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
}
