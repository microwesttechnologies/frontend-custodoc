import {
  ContentChild,
  EventEmitter,
  TemplateRef,
  Component,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';

import { ItemSkeletonComponent } from '../item-skeleton/item-skeleton.component';

import {
  arrayFilter,
  createArrayByNumber,
} from 'src/app/services/local/helper.service';

import { SharedModule } from '../shared.module';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import { fadeInCustomAnimation } from 'src/app/animations/global.animations';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  imports: [ItemSkeletonComponent, SharedModule, DisabledElementDirective],
  standalone: true,
  animations: [fadeInCustomAnimation('fadeIn', '300ms')],
})
export class TableComponent implements OnInit, OnChanges {
  @Input() itemsPerPage = 25;
  @Input() selectedItem: [string, any] = [
    '',
    null,
  ]; /** La primera posición es el identificador y el siguiente el valor a comparar */
  @Input() fieldsToFilter: string[] = [];
  @Input() hiddenOptionsPager!: boolean;
  @Input() searchControl!: FormControl;
  @Input() gridHeaderColumns!: string;
  @Input() isNotSelectable!: boolean;
  @Input() gridBodyColumns!: string;
  @Input() loadingTable!: boolean;
  @Input() currentPage!: number;
  @Input() totalItems!: number;
  @Input() withPager!: boolean;
  @Input() list: any[] = [];
  @Input() height = '100%';

  @Output() currentPageChange = new EventEmitter<number>();
  @Output() eventRowClick = new EventEmitter<any>();

  @ContentChild(TemplateRef, { static: false }) templateRef!: TemplateRef<any>;

  public listFilter: any[] = [];

  public createArrayByNumber = createArrayByNumber;

  ngOnInit(): void {
    this.searchControl?.valueChanges
      ?.pipe(debounceTime(300))
      .subscribe((value) => {
        this.listFilter = arrayFilter(this.list, value, this.fieldsToFilter);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['list']) {
      if (this.searchControl?.value) {
        this.listFilter = arrayFilter(
          this.list,
          this.searchControl?.value,
          this.fieldsToFilter
        );
      } else {
        this.listFilter = this.list;
      }
    }
  }

  public changeCurrentPage(page: number): void {
    this.currentPage = page;
    this.currentPageChange.emit(page);
  }
}
