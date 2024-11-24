import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingModuleComponent } from './ranking-module.component';

describe('RankingModuleComponent', () => {
  let component: RankingModuleComponent;
  let fixture: ComponentFixture<RankingModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankingModuleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RankingModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
