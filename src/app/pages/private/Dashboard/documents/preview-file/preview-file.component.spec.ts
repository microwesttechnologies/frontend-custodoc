import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewFileComponent } from './preview-file.component';

describe('PreviewFileComponent', () => {
  let component: PreviewFileComponent;
  let fixture: ComponentFixture<PreviewFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
