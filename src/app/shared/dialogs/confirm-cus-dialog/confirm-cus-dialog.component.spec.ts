import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCusDialogComponent } from './confirm-cus-dialog.component';

describe('ConfirmCusDialogComponent', () => {
  let component: ConfirmCusDialogComponent;
  let fixture: ComponentFixture<ConfirmCusDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmCusDialogComponent]
    });
    fixture = TestBed.createComponent(ConfirmCusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
