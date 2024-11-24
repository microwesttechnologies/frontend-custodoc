import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsGroupsComponent } from './tabs-groups.component';

describe('TabsGroupsComponent', () => {
  let component: TabsGroupsComponent;
  let fixture: ComponentFixture<TabsGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabsGroupsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
