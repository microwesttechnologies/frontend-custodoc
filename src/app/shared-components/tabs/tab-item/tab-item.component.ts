import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'app-tab-item',
  template: `<ng-content></ng-content>`,
})
export class TabItemComponent implements OnChanges {
  @Output() disabledChange = new EventEmitter();

  @Input() withErrors = false;
  @Input() disabled = false;
  @Input() label = '';

  @ContentChild(TemplateRef) templateRef!: TemplateRef<any>;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['disabled'] &&
      !changes['disabled']?.firstChange &&
      changes['disabled']?.currentValue
    ) {
      this.disabledChange.emit();
    }
  }
}
