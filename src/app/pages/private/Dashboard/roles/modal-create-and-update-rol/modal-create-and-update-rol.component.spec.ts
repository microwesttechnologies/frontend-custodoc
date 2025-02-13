import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateAndUpdateComponent } from './modal-create-and-update-rol.component';

describe('ModalCreateAndUpdateComponent', () => {
  let component: ModalCreateAndUpdateComponent;
  let fixture: ComponentFixture<ModalCreateAndUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCreateAndUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCreateAndUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
