import {
  ContentChild,
  EventEmitter,
  TemplateRef,
  Component,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { ItemSkeletonComponent } from '../item-skeleton/item-skeleton.component';

import {
  arrayFilter,
  createArrayByNumber,
} from 'src/app/services/local/helper.service';

import { SharedModule } from '../shared.module';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import {
  fadeInCustomAnimation,
  slideCustomAnimation,
} from 'src/app/animations/global.animations';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  imports: [ItemSkeletonComponent, SharedModule, DisabledElementDirective],
  standalone: true,
  animations: [
    slideCustomAnimation(
      'slideEnterRight',
      'X',
      '1rem',
      '0',
      {
        enter: '300ms',
      },
      {
        enter: true,
      }
    ),
    fadeInCustomAnimation('fadeIn', '300ms'),
  ],
})
export class TableComponent implements OnChanges {
  @Input() itemsPerPage = 25;
  @Input() selectedItem: [string, any] = [
    '',
    null,
  ]; /** La primera posición es el identificador y el siguiente el valor a comparar */
  @Input() hiddenOptionsPager!: boolean;
  @Input() gridHeaderColumns!: string;
  @Input() gridBodyColumns!: string;
  @Input() loadingTable!: boolean;
  @Input() currentPage!: number;
  @Input() nameFilter!: string;
  @Input() totalItems!: number;
  @Input() withPager!: boolean;
  @Input() list: any[] = [];
  @Input() height = '100%';

  @Output() currentPageChange = new EventEmitter<number>();
  @Output() eventRowClick = new EventEmitter<any>();

  @ContentChild(TemplateRef, { static: false }) templateRef!: TemplateRef<any>;

  public listFilter: any[] = [];

  public createArrayByNumber = createArrayByNumber;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['list']) {
      this.listFilter = this.list;
    }

    if (changes['nameFilter']) {
      this.listFilter = arrayFilter(this.list, this.nameFilter, 'name');
    }
  }

  public changeCurrentPage(page: number): void {
    this.currentPage = page;
    this.currentPageChange.emit(page);
  }
}
