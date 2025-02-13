import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcumbFoldersComponent } from './breadcumb-folders.component';

describe('BreadcumbFoldersComponent', () => {
  let component: BreadcumbFoldersComponent;
  let fixture: ComponentFixture<BreadcumbFoldersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcumbFoldersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BreadcumbFoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
