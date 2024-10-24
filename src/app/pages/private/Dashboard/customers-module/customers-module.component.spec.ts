import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersModuleComponent } from './customers-module.component';

describe('CustomersModuleComponent', () => {
  let component: CustomersModuleComponent;
  let fixture: ComponentFixture<CustomersModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
