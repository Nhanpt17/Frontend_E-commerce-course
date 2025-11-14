import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandlePaymentVnpayComponent } from './handle-payment-vnpay.component';

describe('HandlePaymentVnpayComponent', () => {
  let component: HandlePaymentVnpayComponent;
  let fixture: ComponentFixture<HandlePaymentVnpayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HandlePaymentVnpayComponent]
    });
    fixture = TestBed.createComponent(HandlePaymentVnpayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
