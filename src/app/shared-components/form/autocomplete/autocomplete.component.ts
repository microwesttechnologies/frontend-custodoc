import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { collapseAnimation } from 'src/app/animations/global.animations';
import { SharedModule } from '../../shared.module';
import { OverlayDirective } from 'src/app/directives/overlay.directive';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { Subject, Subscription, timer } from 'rxjs';
import { scrollToElement } from 'src/app/services/local/helper.service';

interface ConfigAutoComplete {
  defaultLabelError?: boolean; // Mostrar error por defecto
  assignOnlyFieldId?: boolean; // Retornar solo el id de la opción
  // separateByGroups?: boolean; // Separar la lista en grupos cuando solo hay una lista
  placeholder?: string; // Placeholder del input
  fieldGroup?: string; // Propiedad para separar los grupos
  fieldText: string | string[]; // Propiedad para el texto
  fieldImg?: string; // Proipiedad para la imagen
  fieldId: string; // Propiedad del identificador
  width?: string;
  size?: 'sm'; // Tamaño del componente
  id: string; // Id para el input
  showAsError?: boolean; // Muetra error de todas formas, ejemplo: cuando se intenta enviar el formulario incompleto sin interactuar con los campos
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  animations: [collapseAnimation],
  imports: [SharedModule, OverlayDirective, DisabledElementDirective],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoCompleteComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// Es necesario actualizar el componente para que reciba proyecciones
export class AutoCompleteComponent
  implements OnInit, OnChanges, ControlValueAccessor
{
  /** Configuración del autocomplete */
  @Input() configAutoComplete!: ConfigAutoComplete;
  /** Se recibe id de las opciones a deshabilitar  */
  @Input() disabledOptions: any[] = [];
  /** Lista de opciones */
  @Input() options: any[] = [];

  @Output() selectionChange = new EventEmitter<any>();

  public $actionOverlay = new Subject<'open' | 'close'>();

  public setTimeoutKeyUpOrDown?: Subscription;
  public setTimeoutFilter?: Subscription;
  public filteredOptions: any[] = [];
  public inputValue = '';

  public currentOption!: any;

  public listStatus = {
    openOverlay: false,
  };

  public sizeClass = {
    input: '',
    panel: '',
  };

  private onChange: Function = (value: any) => {};
  private onTouched: Function = () => {};

  private ngControl: NgControl | null = null;

  public get valueControl() {
    return this.ngControl?.value;
  }

  public get invalid() {
    return this.ngControl?.invalid && this.ngControl?.touched;
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

  private readonly injector = inject(Injector);
  private readonly cdRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initializeNgControl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setSizeClass();

    if (changes['options'] && changes['options']?.currentValue) {
      this.setupFilteredOptions();
      this.checkSelectedOption();
    }
  }

  private initializeNgControl(): void {
    try {
      this.ngControl = this.injector.get(NgControl);
    } catch (error) {
      console.warn('Form control not implemented');
    }
  }

  private setSizeClass(): void {
    const size = this.configAutoComplete?.size;
    if (size) {
      this.sizeClass.input = `primary-autocomplete-size-${size}`;
      this.sizeClass.panel = `primary-autocomplete-panel-size-${size}`;
      this.cdRef.detectChanges();
    }
  }

  private setupFilteredOptions(): void {
    this.filteredOptions = this.configAutoComplete?.fieldGroup
      ? this.groupOptions(this.options)
      : [...this.options];

    this.cdRef.detectChanges();
  }

  writeValue(option: any): void {
    this.currentOption = option;
    this.inputValue = this.getDisplayValue(option) || '';
    this.checkSelectedOption();
    this.cdRef.detectChanges();
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  public getDisplayValue(option: any): string {
    const fields = Array.isArray(this.configAutoComplete?.fieldText)
      ? this.configAutoComplete.fieldText
      : [this.configAutoComplete?.fieldText];

    const displayValue = fields
      .map((field) => option?.[field] || '')
      .join(' - ');

    return displayValue === ' - ' ? '' : displayValue;
  }

  public getIdValue(option: any): any {
    return option?.[this.configAutoComplete?.fieldId]
      ? String(option?.[this.configAutoComplete?.fieldId]) || undefined
      : undefined;
  }

  private checkSelectedOption(): any {
    if (!this.currentOption || !this.options?.length) return;

    const selectedOption = this.options.find(
      (option) =>
        this.getIdValue(option) ===
        (this.getIdValue(this.currentOption) || String(this.currentOption))
    );
    this.currentOption = selectedOption || null;
    this.inputValue = selectedOption
      ? this.getDisplayValue(selectedOption)
      : '';
    if (!selectedOption) this.onChange(null);

    setTimeout(() => this.cdRef.detectChanges(), 0);
  }

  public filterOptions(): void {
    if (this.setTimeoutFilter) {
      this.setTimeoutFilter?.unsubscribe();
      this.setTimeoutFilter = undefined;
    }

    this.setTimeoutFilter = timer(150).subscribe(() => {
      if (
        this.inputValue !== this.getDisplayValue(this.currentOption) ||
        this.inputValue === ''
      ) {
        const query = this.inputValue.toLowerCase();

        if (this.configAutoComplete?.fieldGroup) {
          this.filteredOptions = this.groupOptions(this.options)
            .map((group) => ({
              group: group.group,
              options: group.options.filter((option: any) =>
                this.getDisplayValue(option).toLowerCase().includes(query)
              ),
            }))
            .filter((group) => group.options.length > 0);
        } else {
          this.filteredOptions = this.options.filter((option) =>
            this.getDisplayValue(option).toLowerCase().includes(query)
          );
        }

        const optionMatch = this.findExactOptionMatch(query);
        this.handleSelection(optionMatch);
        this.listStatus.openOverlay = true;
        this.$actionOverlay.next('open');
        this.cdRef.detectChanges();
      }
    });
  }

  private findExactOptionMatch(query: string): any {
    if (this.configAutoComplete?.fieldGroup) {
      for (const group of this.filteredOptions) {
        const match = group.options.find(
          (item: any) => this.getDisplayValue(item).toLowerCase() === query
        );
        if (match) return match;
      }
    } else {
      return this.filteredOptions.find(
        (option) => this.getDisplayValue(option).toLowerCase() === query
      );
    }
    return null;
  }

  private handleSelection(optionMatch: any): void {
    if (optionMatch) {
      this.selectOption(optionMatch);
    } else {
      this.selectionChange.emit(null);
      this.currentOption = null;
      this.onChange(null);
    }
  }

  private groupOptions(options: any[]): any[] {
    return Object.values(
      options.reduce((groups, option) => {
        const groupKey = option[this.configAutoComplete?.fieldGroup!];
        if (!groups[groupKey])
          groups[groupKey] = { group: groupKey, options: [] };
        groups[groupKey].options.push(option);
        return groups;
      }, {})
    );
  }

  public selectOption(option: any): void {
    if (
      this.getIdValue(option) !== this.getIdValue(this.currentOption) &&
      !this.disabled
    ) {
      this.inputValue = this.getDisplayValue(option);
      this.currentOption = option;
      this.onChange(
        this.configAutoComplete?.assignOnlyFieldId
          ? this.getIdValue(option)
          : option
      );
      this.selectionChange.emit(option);
      this.cdRef.detectChanges();
    }
  }

  public isSelected(option: any): any {
    return (
      this.currentOption &&
      this.getIdValue(option) == this.getIdValue(this.currentOption)
    );
  }

  public statusOverlayChange(showOverlay: boolean): void {
    this.listStatus.openOverlay = showOverlay;
    if (showOverlay) {
      setTimeout(
        () => scrollToElement(`option-autocomplete${this.valueControl}`, false),
        0,
      );
    } else {
      if (!this.touched) this.onTouched();
      this.setupFilteredOptions();
    }
    this.cdRef.detectChanges();
  }

  public eventKey(action: 'up' | 'down', event: KeyboardEvent): void {
    if (this.setTimeoutKeyUpOrDown) {
      this.setTimeoutKeyUpOrDown?.unsubscribe();
      this.setTimeoutKeyUpOrDown = undefined;
    }

    this.setTimeoutKeyUpOrDown = timer(150).subscribe(() => {
      if (event.key === 'Tab') {
        if (action === 'up') {
          this.$actionOverlay.next('open');
          const inputElement = event.target as HTMLInputElement;
          inputElement.setSelectionRange(
            this.inputValue.length,
            this.inputValue.length,
          );
        } else {
          this.$actionOverlay.next('close');
        }
      }
    });
  }
}
