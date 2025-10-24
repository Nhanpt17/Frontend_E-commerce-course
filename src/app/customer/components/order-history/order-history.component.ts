import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';
import { OrderService } from './../../service/order.service';
import { Component, OnInit } from '@angular/core';
import { OrderDetailDialogComponent } from '../order-detail-dialog/order-detail-dialog.component';
import { ConfirmCusDialogComponent } from 'src/app/shared/dialogs/confirm-cus-dialog/confirm-cus-dialog.component';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit{
  
  orders:any[]=[];
  userId = UserstorageService.getUserId();

  constructor(private orderService: OrderService, private dialog:MatDialog, private snackbar:MatSnackBar){}

  ngOnInit(): void {

    this.loadOrders();
    
  }

  loadOrders(){
    this.orderService.getOrdersByUser(Number(this.userId)).subscribe({
      next:(res)=>{
        
        this.orders = res;
      },
      error:(err)=>{
        console.log("Không lấy được order: ", err);
      }
    });
  }

  
  cancelOrder(order:any):void{
    if(order.status !== 'PENDING' && order.status !== 'PLACED'){
      this.dialog.open(ConfirmCusDialogComponent,{
        width:'400px',
        data:{
          title: 'Không thể hủy đơn',
          message:'Đơn hàng chỉ có thể hủy khi ở trạng thái "Đang chờ xử lý" hoặc "Đã đặt hàng"',
          confirmText: 'Đã hiểu',
          showCancel:false
        }
      });

      return;
    }

    const dialogRef = this.dialog.open(ConfirmCusDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận hủy đơn',
        message: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
        confirmText: 'Xác nhận hủy',
        cancelText: 'Quay lại'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.cancelOrder(order.id).subscribe({
          next: () => {
            this.snackbar.open("Hủy đơn hàng thành công!",'Đóng',{duration:2000});

             this.loadOrders();
          },
          error: (err) => {
            const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
            this.snackbar.open(errorMessage,'Đóng',{duration:2000});
          }
        });
      }
    });

  }


  viewDetails(order: any): void {
    this.dialog.open(OrderDetailDialogComponent, {
      width: '800px',
      data: order
    });
  }


  
getStatusIcon(status: string): string {
  const statusIcons: { [key: string]: string } = {
    'PENDING': 'hourglass_empty',
    'PLACED': 'shopping_cart',
    'DELIVERING': 'local_shipping',
    'COMPLETED': 'check_circle',
    'CANCELLED': 'cancel'
  };
  return statusIcons[status] || 'help_outline';
}

getStatusText(status: string): string {
  const statusTexts: { [key: string]: string } = {
    'PENDING': 'Đang chờ xử lý',
    'PLACED': 'Đã đặt hàng',
    'DELIVERING': 'Đang giao hàng',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy'
  };
  return statusTexts[status] || status;
}

}
