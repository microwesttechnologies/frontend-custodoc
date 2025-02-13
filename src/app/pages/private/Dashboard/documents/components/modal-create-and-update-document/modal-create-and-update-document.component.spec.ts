import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateAndUpdateDocumentComponent } from './modal-create-and-update-document.component';

describe('ModalCreateAndUpdateDocumentComponent', () => {
  let component: ModalCreateAndUpdateDocumentComponent;
  let fixture: ComponentFixture<ModalCreateAndUpdateDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCreateAndUpdateDocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalCreateAndUpdateDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
