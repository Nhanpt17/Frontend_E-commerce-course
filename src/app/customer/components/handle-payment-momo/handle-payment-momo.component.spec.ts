import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandlePaymentMomoComponent } from './handle-payment-momo.component';

describe('HandlePaymentMomoComponent', () => {
  let component: HandlePaymentMomoComponent;
  let fixture: ComponentFixture<HandlePaymentMomoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HandlePaymentMomoComponent]
    });
    fixture = TestBed.createComponent(HandlePaymentMomoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
