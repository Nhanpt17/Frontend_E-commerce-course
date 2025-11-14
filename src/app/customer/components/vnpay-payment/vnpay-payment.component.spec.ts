import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VnpayPaymentComponent } from './vnpay-payment.component';

describe('VnpayPaymentComponent', () => {
  let component: VnpayPaymentComponent;
  let fixture: ComponentFixture<VnpayPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VnpayPaymentComponent]
    });
    fixture = TestBed.createComponent(VnpayPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
