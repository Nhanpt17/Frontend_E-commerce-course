import { VoucherService } from './../../../services/voucher/voucher.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from './../../../services/cart/cart.service';
import { MomoService } from './../../service/momo.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';

@Component({
  selector: 'app-handle-payment-momo',
  templateUrl: './handle-payment-momo.component.html',
  styleUrls: ['./handle-payment-momo.component.css']
})
export class HandlePaymentMomoComponent implements OnInit {
  result: string = '';
  systemOrderId: string | null = null;

  constructor(private route: ActivatedRoute, private momoService: MomoService, private cartService: CartService,
    private router: Router,
    private voucherService: VoucherService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const message = params.get('message');
      const orderId = params.get('orderId'); // Lấy orderId từ URL
      const resultCode = params.get('resultCode');
      const transId = params.get('transId') || '';

      // Lấy phần số phía trước "MOMO"
      if (orderId) {
        this.systemOrderId = orderId.split('MOMO')[0];
        console.log('System Order ID:', this.systemOrderId); // 
      }

 
      if (resultCode) {
        this.momoService.handleAfterPayment(Number(resultCode), Number(this.systemOrderId), transId).subscribe({
          next: () => {
            console.log('Cập nhật trạng thái thành công!');
      
            if (resultCode == '0') {
              this.result = 'Thanh toán thành công!';
              this.cartService.clearCart();
      
              const voucherCode = localStorage.getItem('voucherCode');
              const voucherId = localStorage.getItem('voucherId');
              localStorage.removeItem('voucherCode');
              localStorage.removeItem('voucherId');
      
              const handleVoucher = () => {
                if (voucherCode) {
                  this.voucherService.incrementVoucherUsage(voucherCode).subscribe({
                    next: () => {
                      console.log("Cập nhật số lần voucher đã sử dụng");
                      this.router.navigate(['/customer/order-history']);
                    },
                    error: () => {
                      this.snackbar.open('Cập nhật trạng thái voucher thất bại!', 'Đóng', {
                        duration: 3000,
                        panelClass: ['snackbar-error'],
                      });
                      this.router.navigate(['/customer/order-history']);
                    }
                  });
                } else if (voucherId) {
                  const customerId = Number(UserstorageService.getUserId());
                  this.voucherService.markCustomerVoucherAsUsed(customerId, Number(voucherId)).subscribe({
                    next: () => {
                      console.log("Cập nhật trạng thái customervoucher đã sử dụng");
                      this.router.navigate(['/customer/order-history']);
                    },
                    error: () => {
                      this.snackbar.open('Cập nhật trạng thái CustomerVoucher thất bại!', 'Đóng', {
                        duration: 3000,
                        panelClass: ['snackbar-error'],
                      });
                      this.router.navigate(['/customer/order-history']);
                    }
                  });
                } else {
                  this.router.navigate(['/customer/order-history']);
                }
              };
      
              handleVoucher();
      
            } else {
              this.result = 'Thanh toán thất bại: ' + (message || 'Lỗi không xác định');
            }
          },
          error: (err) => {
            console.error('Lỗi xử lý sau khi thanh toán Momo', err);
            this.result = 'Thanh toán thất bại: Lỗi hệ thống';
          }
        });
      }
      


    })
  }

}
