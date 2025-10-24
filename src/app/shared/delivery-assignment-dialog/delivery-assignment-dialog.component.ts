import { UserService } from './../../services/user/user.service';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from 'src/app/customer/service/order.service';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';

@Component({
  selector: 'app-delivery-assignment-dialog',
  templateUrl: './delivery-assignment-dialog.component.html',
  styleUrls: ['./delivery-assignment-dialog.component.css']
})
export class DeliveryAssignmentDialogComponent implements OnInit {

  deliveryStaffs: any[] = [];
  selectedStaffId!: number;
  staffId = Number(UserstorageService.getUserId());

  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DeliveryAssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  ngOnInit(): void {
    this.userService.getDeliveryStaff().subscribe(
      {
        next: (staffs)=>{
          this.deliveryStaffs = staffs;
        },
        error: ()=>{
          this.snackBar.open('Error loading delivery staff', 'Close', { duration: 3000 });
        }
      }
    );
  }
  onAssign(): void {
    this.orderService.assignDeliveryStaff(this.data.orderId,this.staffId,this.selectedStaffId).subscribe(
      {
        next: ()=>{
          this.dialogRef.close(true);
        },
        error: (err)=>{
          const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });       
        }
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
