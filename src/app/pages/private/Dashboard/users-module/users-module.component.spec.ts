import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersModuleComponent } from './users-module.component';

describe('UsersModuleComponent', () => {
  let component: UsersModuleComponent;
  let fixture: ComponentFixture<UsersModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersModuleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
