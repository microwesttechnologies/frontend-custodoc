import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';

import { SharedModule } from '../../shared.module';
import { collapseAnimation } from 'src/app/animations/global.animations';
import { validateLimitText } from 'src/app/services/local/helper.service';
import { DestroyObs } from 'src/app/abstract-classes/destroy.abstract';
import { OverlayDirective } from 'src/app/directives/overlay.directive';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';

interface ConfigSelect {
  fieldText: string | string[];
  defaultLabelError?: boolean;
  assignOnlyFieldId?: boolean;
  separatorText?: string;
  placeholder?: string;
  multiple?: boolean;
  size?: 'md' | 'sm';
  fieldId: string;
  width?: string;
  id: string;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  animations: [collapseAnimation],
  imports: [
    SharedModule,
    OverlayDirective,
    TooltipDirective,
    DisabledElementDirective,
  ],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent
  extends DestroyObs
  implements OnInit, OnChanges, ControlValueAccessor
{
  @ViewChild('optionsPanel') optionsPanel!: ElementRef<HTMLElement>;
  @Input() configSelect!: ConfigSelect;
  @Input() options: any[] = [];

  @Output() selectionChange = new EventEmitter<any>();

  private selectedOptions: any[] = [];
  public filteredOptions: any[] = [];
  public inputValue = '';

  public listStatus = {
    showOptions: false,
  };

  public sizeClass = {
    input: '',
    panel: '',
  };

  public validateLimitText = validateLimitText;

  private onChange: Function = (value: any) => {};
  public onTouched: Function = () => {};

  public ngControl!: NgControl;

  public get invalid() {
    return this.ngControl?.invalid;
  }

  public get touched() {
    return this.ngControl?.touched;
  }

  public get valid() {
    return this.ngControl?.valid;
  }

  public get disabled() {
    return this.ngControl?.disabled;
  }

  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);

  ngOnInit(): void {
    this.initializeNgControl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setSizeClass();

    setTimeout(() => {
      if (changes['options'] && changes['options']?.currentValue) {
        this.initializeFilteredOptions();
        this.checkSelectedOptions();
      }
    }, 0);
  }

  private initializeNgControl() {
    try {
      this.ngControl = this.injector.get(NgControl);
    } catch (error) {
      console.warn('form control no implemented');
    }
  }

  private setSizeClass() {
    const size = this.configSelect?.size;
    if (size) {
      this.sizeClass.input = `primary-select-custom-size-${size}`;
      this.sizeClass.panel = `primary-select-custom-panel-size-${size}`;
      this.cdRef.detectChanges();
    }
  }

  private initializeFilteredOptions() {
    this.filteredOptions = this.options.map((option) => ({
      ...option,
      selected: this.configSelect?.multiple ? new FormControl(false) : null,
    }));
    this.cdRef.detectChanges();
  }

  writeValue(option: any): void {
    this.selectedOptions = this.configSelect?.multiple
      ? Array.isArray(option)
        ? option
        : []
      : option
      ? [option]
      : [];

    if (!this.selectedOptions?.length) this.inputValue = '';

    this.checkSelectedOptions();
    this.cdRef.detectChanges();
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  public getDisplayValue(option: any): string {
    const fieldText = this.configSelect?.fieldText;

    if (!option || !fieldText) return '';

    return Array.isArray(fieldText)
      ? fieldText
          .map((prop) => option[prop])
          .filter(Boolean)
          .join(this.configSelect?.separatorText || ' ')
      : option[fieldText as string]
      ? option[fieldText as string]
      : '';
  }

  public getIdValue(option: any): any {
    return option?.[this.configSelect?.fieldId]
      ? String(option?.[this.configSelect?.fieldId])
      : undefined;
  }

  private checkSelectedOptions(): any {
    if (!this.selectedOptions?.length || !this.options?.length) return;

    this.selectedOptions = this.selectedOptions.map(
      (sel) =>
        this.options.find(
          (opt) =>
            this.getIdValue(opt) === (this.getIdValue(sel) || String(sel))
        ) || String(sel)
    );

    if (this.configSelect?.multiple) {
      this.filteredOptions.forEach((option) => {
        const isSelected = this.isSelected(option);
        option.selected?.setValue(isSelected, { emitEvent: false });
      });
    }

    this.updateSelections(true);
    this.cdRef.detectChanges();
  }

  private setInputValue() {
    this.inputValue = this.configSelect?.multiple
      ? this.selectedOptions.map((opt) => this.getDisplayValue(opt)).join(', ')
      : this.selectedOptions?.length
      ? this.getDisplayValue(this.selectedOptions[0])
      : '';
    this.cdRef.detectChanges();
  }

  public selectOption(option: any): void {
    if (this.configSelect?.multiple) this.toggleMultipleSelection(option);
    else this.setSingleSelection(option);
  }

  private toggleMultipleSelection(option: any): void {
    const indexOption = this.selectedOptions.findIndex(
      (opt) => this.getIdValue(opt) === this.getIdValue(option)
    );

    if (indexOption > -1) {
      this.selectedOptions.splice(indexOption, 1);
    } else {
      this.selectedOptions.push(option);
    }

    this.updateSelections();
  }

  private setSingleSelection(option: any): void {
    if (this.getIdValue(option) !== this.getIdValue(this.selectedOptions[0])) {
      this.selectedOptions = [option];
      this.updateSelections();
    }
  }

  private updateSelections(check?: boolean): void {
    if (!check) {
      this.selectionChange.emit(
        this.configSelect?.multiple
          ? this.selectedOptions
          : this.selectedOptions[0]
      );
    }

    this.setInputValue();
    this.onChange(
      this.configSelect?.assignOnlyFieldId
        ? this.configSelect?.multiple
          ? this.selectedOptions.map((sel) => this.getIdValue(sel))
          : this.getIdValue(this.selectedOptions[0])
        : this.configSelect?.multiple
        ? this.selectedOptions
        : this.selectedOptions[0]
    );
  }

  public isSelected(option: any): boolean {
    return this.selectedOptions?.some(
      (sel) => this.getIdValue(sel) === this.getIdValue(option)
    );
  }
}
