import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentStepperDialogComponent } from './payment-stepper-dialog.component';

describe('PaymentStepperDialogComponent', () => {
  let component: PaymentStepperDialogComponent;
  let fixture: ComponentFixture<PaymentStepperDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentStepperDialogComponent]
    });
    fixture = TestBed.createComponent(PaymentStepperDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
