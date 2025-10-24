import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryAssignmentDialogComponent } from './delivery-assignment-dialog.component';

describe('DeliveryAssignmentDialogComponent', () => {
  let component: DeliveryAssignmentDialogComponent;
  let fixture: ComponentFixture<DeliveryAssignmentDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveryAssignmentDialogComponent]
    });
    fixture = TestBed.createComponent(DeliveryAssignmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
