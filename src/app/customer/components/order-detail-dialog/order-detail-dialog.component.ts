import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-order-detail-dialog',
  templateUrl: './order-detail-dialog.component.html',
  styleUrls: ['./order-detail-dialog.component.css']
})
export class OrderDetailDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public order:any) {}


  getStatusText(status: string): string {
    const statusTexts: {[key: string]: string} = {
      'PENDING': 'Đang chờ xử lý',
      'PLACED': 'Đã đặt hàng',
      'DELIVERING': 'Đang giao hàng',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusTexts[status] || status;
  }
  
  getPaymentStatusText(status?: string): string {
    if (!status) return '--';
    
    const statusTexts: {[key: string]: string} = {
      'PENDING': 'Chờ thanh toán',
      'PAID': 'Đã thanh toán',
      'FAILED': 'Thanh toán thất bại',
      'REFUNDED': 'Đã hoàn tiền'
    };
    return statusTexts[status] || status;
  }

}
