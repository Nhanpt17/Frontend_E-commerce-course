import { OrderStatus } from './../../models/order-status.enum';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/customer/service/order.service';



@Component({
  selector: 'app-delivery-order-detail',
  templateUrl: './delivery-order-detail.component.html',
  styleUrls: ['./delivery-order-detail.component.css']
})
export class DeliveryOrderDetailComponent implements OnInit{
  order: any;
  orderStatus = OrderStatus;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    
  ) { }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetail(Number(orderId));
    }
  }

  loadOrderDetail(orderId: number): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        this.order = res.order;
      },
      error: () => {
        // this.snackBar.open('Error loading order details', 'Close', { duration: 3000 });
        console.log('Lỗi tải chi tiết đơn hàng');
      }
    });
  }

  updateOrderStatus(order: any, status: OrderStatus): void {
    this.orderService.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.snackBar.open('Cập nhật trạng thái thành công', 'Đóng', { duration: 2000 });
        this.loadOrderDetail(order.id);
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
        
        this.snackBar.open(errorMessage, 'Đóng', { duration: 3000 });
      }
    });
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
