import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryModuleComponent } from './history-module.component';

describe('HistoryModuleComponent', () => {
  let component: HistoryModuleComponent;
  let fixture: ComponentFixture<HistoryModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryModuleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoryModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
