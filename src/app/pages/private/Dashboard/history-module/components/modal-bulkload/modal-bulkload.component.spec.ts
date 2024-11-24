import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBulkloadComponent } from './modal-bulkload.component';

describe('ModalBulkloadComponent', () => {
  let component: ModalBulkloadComponent;
  let fixture: ComponentFixture<ModalBulkloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalBulkloadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalBulkloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
