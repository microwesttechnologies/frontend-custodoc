import { NgModule } from '@angular/core';
import { TabItemComponent } from './tab-item/tab-item.component';
import { TabsGroupsComponent } from './tabs-groups/tabs-groups.component';
import { SharedModule } from '../shared.module';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';

@NgModule({
  declarations: [TabItemComponent, TabsGroupsComponent],
  exports: [TabItemComponent, TabsGroupsComponent],
  imports: [SharedModule,DisabledElementDirective],
})
export class TabsModule {}
