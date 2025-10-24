import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherFormDialogComponent } from './voucher-form-dialog.component';

describe('VoucherFormDialogComponent', () => {
  let component: VoucherFormDialogComponent;
  let fixture: ComponentFixture<VoucherFormDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VoucherFormDialogComponent]
    });
    fixture = TestBed.createComponent(VoucherFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
