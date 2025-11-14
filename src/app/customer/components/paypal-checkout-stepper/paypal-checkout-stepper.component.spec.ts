import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaypalCheckoutStepperComponent } from './paypal-checkout-stepper.component';

describe('PaypalCheckoutStepperComponent', () => {
  let component: PaypalCheckoutStepperComponent;
  let fixture: ComponentFixture<PaypalCheckoutStepperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaypalCheckoutStepperComponent]
    });
    fixture = TestBed.createComponent(PaypalCheckoutStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
