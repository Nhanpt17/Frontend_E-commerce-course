import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryOrderDetailComponent } from './delivery-order-detail.component';

describe('DeliveryOrderDetailComponent', () => {
  let component: DeliveryOrderDetailComponent;
  let fixture: ComponentFixture<DeliveryOrderDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveryOrderDetailComponent]
    });
    fixture = TestBed.createComponent(DeliveryOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
