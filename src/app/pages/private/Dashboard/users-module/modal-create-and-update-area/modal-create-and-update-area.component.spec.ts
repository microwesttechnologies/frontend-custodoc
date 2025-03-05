import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateAndUpdateAreaComponent } from './modal-create-and-update-area.component';

describe('ModalCreateAndUpdateAreaComponent', () => {
  let component: ModalCreateAndUpdateAreaComponent;
  let fixture: ComponentFixture<ModalCreateAndUpdateAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCreateAndUpdateAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalCreateAndUpdateAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
