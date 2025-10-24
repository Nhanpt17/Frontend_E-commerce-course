import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherCenterComponent } from './voucher-center.component';

describe('VoucherCenterComponent', () => {
  let component: VoucherCenterComponent;
  let fixture: ComponentFixture<VoucherCenterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VoucherCenterComponent]
    });
    fixture = TestBed.createComponent(VoucherCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
