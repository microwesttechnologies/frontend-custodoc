import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPreviewDocumentComponent } from './modal-preview-document.component';

describe('ModalPreviewDocumentComponent', () => {
  let component: ModalPreviewDocumentComponent;
  let fixture: ComponentFixture<ModalPreviewDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPreviewDocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalPreviewDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
