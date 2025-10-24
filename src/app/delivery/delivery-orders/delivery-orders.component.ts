import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from 'src/app/customer/service/order.service';
import { OrderStatus } from 'src/app/models/order-status.enum';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';

@Component({
  selector: 'app-delivery-orders',
  templateUrl: './delivery-orders.component.html',
  styleUrls: ['./delivery-orders.component.css']
})
export class DeliveryOrdersComponent {

  orders: any[] = [];
  displayedColumns: string[] = ['id', 'customer', 'address', 'status', 'actions'];
  orderStatus = OrderStatus;
  
  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const userId = Number(UserstorageService.getUserId());
    this.orderService.getOrdersByDeliveryStaff(userId).subscribe(
      {
        next: (orders) => {
          this.orders = orders.filter(order=>
            order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED
          );

        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
           this.snackBar.open(errorMessage, 'Đóng', { duration: 3000 })
          
        }
      }

    );
  }

  updateOrderStatus(order: any, status: OrderStatus): void {
    this.orderService.updateOrderStatus(order.id, status).subscribe(

      {
        next: () => {
          this.snackBar.open('Order status updated', 'Close', { duration: 2000 });
          this.loadOrders();
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
        }
      }
    );
  }

  getStatusText(status: string): string {
    const statusText: {[key: string]: string} = {
      'PLACED': 'Đã đặt hàng',
      'DELIVERING': 'Đang giao hàng',
      'COMPLETED': 'Đã hoàn thành'
    };
    return statusText[status] || status;
  }
  
  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

}
