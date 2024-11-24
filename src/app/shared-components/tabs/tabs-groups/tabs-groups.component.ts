import {
  animate,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';

import { TabItemComponent } from '../tab-item/tab-item.component';

import { takeUntil } from 'rxjs';
import { DestroyObs } from 'src/app/abstract-classes/destroy.abstract';

@Component({
  selector: 'app-tabs-groups',
  templateUrl: './tabs-groups.component.html',
  styleUrls: ['./tabs-groups.component.scss'],
  animations: [
    trigger('tabAnimation', [
      transition(':increment', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            width: '100%',
            height: '100%',
          }),
        ]),
        query(':enter', [style({ left: '100%', opacity: 0 })]),
        query(':leave', [style({ left: '0%', opacity: 1 })]),
        group([
          query(':leave', [
            animate('300ms ease-out', style({ left: '-100%', opacity: 0 })),
          ]),
          query(':enter', [
            animate('300ms ease-out', style({ left: '0%', opacity: 1 })),
          ]),
        ]),
      ]),
      transition(':decrement', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            width: '100%',
            height: '100%',
          }),
        ]),
        query(':enter', [style({ left: '-100%', opacity: 0 })]),
        query(':leave', [style({ left: '0%', opacity: 1 })]),
        group([
          query(':leave', [
            animate('300ms ease-out', style({ left: '100%', opacity: 0 })),
          ]),
          query(':enter', [
            animate('300ms ease-out', style({ left: '0%', opacity: 1 })),
          ]),
        ]),
      ]),
    ]),
  ],
})
export class TabsGroupsComponent extends DestroyObs implements OnChanges {
  @HostBinding('style') defaultStyle = {
    'min-height': '0',
    height: '100%',
  };

  @ContentChildren(TabItemComponent) tabs!: QueryList<TabItemComponent>;
  @ViewChild('containerHeaderTabs')
  containerHeaderTabs!: ElementRef<HTMLDivElement>;

  @Input() positionHeader: 'start' | 'center' | 'end' = 'center';
  @Input() selectedTabIndex = 0;

  @Output() eventTabSelected = new EventEmitter<number>();

  public indicatorStyle:any = {};

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.calculatePositionIndicator();
  }

  ngOnChanges(): void {
    requestAnimationFrame(() => this.calculatePositionIndicator());
  }

  ngAfterContentInit() {
    this.validateAndSelectTab();

    this.tabs.forEach((tab, index) => {
      tab.disabledChange.pipe(takeUntil(this.$destroy)).subscribe(() => {
        if (index === this.selectedTabIndex) {
          this.validateAndSelectTab();
        }
      });
    });
  }

  public selectTab(tab: TabItemComponent) {
    if (!tab.disabled) {
      this.selectedTabIndex = this.tabs.toArray().indexOf(tab);
      this.eventTabSelected.emit(this.selectedTabIndex);
      this.calculatePositionIndicator();
    } else {
      this.selectFirstEnabledTab();
    }
  }

  private validateAndSelectTab() {
    const selectedTab = this.tabs.toArray()[this.selectedTabIndex];
    if (!selectedTab || selectedTab.disabled) {
      this.selectFirstEnabledTab();
    }
  }

  private selectFirstEnabledTab() {
    const firstEnabledTab = this.tabs.find((tab) => !tab.disabled);
    if (firstEnabledTab) {
      this.selectedTabIndex = this.tabs.toArray().indexOf(firstEnabledTab)
      this.eventTabSelected.emit(this.selectedTabIndex);
      this.calculatePositionIndicator();
    }
  }

  private calculatePositionIndicator() {
    if (this.containerHeaderTabs?.nativeElement) {
      const tabsHeader = this.containerHeaderTabs.nativeElement.children;
      const itemHeaderRect =
        tabsHeader[this.selectedTabIndex].getBoundingClientRect();
      const containerHeaderRect =
        this.containerHeaderTabs.nativeElement.getBoundingClientRect();

      this.indicatorStyle = {
        width: `${itemHeaderRect.width}px`,
        left: `${itemHeaderRect.left - containerHeaderRect.left}px`,
        transition: 'left 0.3s, width 0.3s, background-color 0.3s',
      };

      if (this.tabs.toArray()[this.selectedTabIndex]?.withErrors)
        this.indicatorStyle['background-color'] = '#de350b';
    }
  }
}
