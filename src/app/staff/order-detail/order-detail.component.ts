import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/customer/service/order.service';
import { DeliveryAssignmentDialogComponent } from 'src/app/shared/delivery-assignment-dialog/delivery-assignment-dialog.component';
import { ConfirmCusDialogComponent } from 'src/app/shared/dialogs/confirm-cus-dialog/confirm-cus-dialog.component';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit{
 
  order: any;
  deliveryName: any;
  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetail(Number(orderId));
    }
  }

  loadOrderDetail(orderId: number): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (res:any) => {
        this.order = res.order;
        if (res.deliveryName) {
          this.order.deliveryName = res.deliveryName;
        }
      },
      error: () => {
        this.snackBar.open('Error loading order details', 'Close', { duration: 3000 });
      }
    });
  }

    openCancelDialog(order: any): void {
      const dialogRef = this.dialog.open(ConfirmCusDialogComponent, {
        width: '500px',
        data: { title: "Hủy đơn hàng",
          message:'Bạn có chắc muốn hủy đơn hàng này?',
          showCancel: true,
          cancelText:"Hủy bỏ",
          confirmText:'Xác nhận hủy'
         }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.orderService.cancelOrderByStaff(order.id).subscribe({
            next: () => {
              this.snackBar.open('Đã hủy đơn hàng thành công', 'Đóng', { duration: 3000 });
              this.loadOrderDetail(order.id); // Tải lại danh sách sau khi hủy thành công
             
  
            },
            error: (err) => {
              
              this.snackBar.open('Lỗi khi hủy đơn hàng: ' + err.message, 'Đóng', { duration: 3000 });
              
            }
          });
        }
       
      });
    }

  assignDelivery(order: any): void {
    this.orderService.checkInventory(order.id).subscribe({
      next: (result) => {
        if (result.available) {
          this.openAssignmentDialog(order);
        } else {
          this.snackBar.open(result.message || 'Inventory not available', 'Close', { duration: 3000 });
        }
      },
      error: () => this.snackBar.open('Error checking inventory', 'Close', { duration: 3000 })
    });
  }

  openAssignmentDialog(order: any): void {
    const dialogRef = this.dialog.open(DeliveryAssignmentDialogComponent, {
      width: '400px',
      data: { orderId: order.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrderDetail(order.id);
        this.snackBar.open('Phân công giao thành công','Đóng',{duration:1000});
      }
    });
  }


getPaymentStatusText(status: string): string {
  const statusText: {[key: string]: string} = {
    'PENDING': 'Chờ thanh toán',
    'PAID': 'Đã thanh toán',
    'FAILED': 'Thanh toán thất bại',
    'REFUNDED': 'Đã hoàn tiền'
  };
  return statusText[status] || status;
}

getPaymentStatusClass(status: string): string {
  return 'payment-' + status.toLowerCase();
}

getPaymentMethodText(method: string): string {
  const methodText: {[key: string]: string} = {
    'CASH': 'Tiền mặt',
    'MOMO': 'Ví điện tử MoMo'
  };
  return methodText[method] || method;
}


getStatusText(status: string): string {
  const statusText: {[key: string]: string} = {
    'PENDING': 'Chờ xử lý',
    'PLACED': 'Đã đặt hàng',
    'DELIVERING': 'Đang giao hàng',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy'
  };
  return statusText[status] || status;
}

getStatusClass(status: string): string {
  return status.toLowerCase();
}

  
}
