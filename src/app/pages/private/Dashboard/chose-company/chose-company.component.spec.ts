import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoseCompanyComponent } from './chose-company.component';

describe('ChoseCompanyComponent', () => {
  let component: ChoseCompanyComponent;
  let fixture: ComponentFixture<ChoseCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoseCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChoseCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
