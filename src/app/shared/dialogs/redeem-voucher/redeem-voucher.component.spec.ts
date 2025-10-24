import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemVoucherComponent } from './redeem-voucher.component';

describe('RedeemVoucherComponent', () => {
  let component: RedeemVoucherComponent;
  let fixture: ComponentFixture<RedeemVoucherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RedeemVoucherComponent]
    });
    fixture = TestBed.createComponent(RedeemVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
