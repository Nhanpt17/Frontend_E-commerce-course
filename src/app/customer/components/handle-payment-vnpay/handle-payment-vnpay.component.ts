import { VoucherService } from './../../../services/voucher/voucher.service';
import { CartService } from './../../../services/cart/cart.service';
import { VnpayService } from './../../service/vnpay.service';
import { HttpClient } from '@angular/common/http';


import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as crypto from 'crypto-js';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';

@Component({
  selector: 'app-handle-payment-vnpay',
  templateUrl: './handle-payment-vnpay.component.html',
  styleUrls: ['./handle-payment-vnpay.component.css']
})
export class HandlePaymentVnpayComponent {
  vnpParams: any = {};
  signValue = '';
  vnp_SecureHash = '';
  isValidSignature = false;
  statusMessage = '';

  private secretKey = environment.VNPAY_SECRET_KEY || 'TVA44OJ17MFUDUV14POP52TY193OKKAY';

  constructor(private route: ActivatedRoute, private router: Router,
    private http: HttpClient, private vnpayService: VnpayService,
    private cartService: CartService, private voucherService: VoucherService,
    private snackbar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(decodedParams => {
      this.processVnpayReturn(decodedParams);
    });

    //this.sendVnpayIpn();


  }

  private processVnpayReturn(decodedParams: any): void {
    // Lấy vnp_SecureHash
    this.vnp_SecureHash = decodedParams['vnp_SecureHash'];

    // Tạo map fields theo ĐÚNG chuẩn VNPay: URL ENCODE cả key và value
    const fields: Map<string, string> = new Map();

    // Lấy tất cả parameters và URL encode chúng
    for (const key in decodedParams) {
      if (key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
        const fieldName = this.urlEncode(key); // QUAN TRỌNG: encode key
        const fieldValue = this.urlEncode(decodedParams[key]); // QUAN TRỌNG: encode value
        if (fieldValue && fieldValue.length > 0) {
          fields.set(fieldName, fieldValue);
        }
      }
    }

    // Chuyển Map thành object cho dễ xử lý
    this.vnpParams = {};
    fields.forEach((value, key) => {
      this.vnpParams[key] = value;
    });

    console.log('=== DEBUG VNPAY RETURN ===');
    console.log('Encoded Params:', this.vnpParams);

    // Tính lại chữ ký
    const signValue = this.hashAllFields(fields);
    this.signValue = signValue;
    this.isValidSignature = signValue === this.vnp_SecureHash;

    console.log('Computed Hash:', signValue);
    console.log('Received Hash:', this.vnp_SecureHash);
    console.log('Is Valid:', this.isValidSignature);

    // Xác định tình trạng giao dịch
    if (this.isValidSignature) {
      if (decodedParams['vnp_TransactionStatus'] === '00') {
        this.statusMessage = 'Thanh toán thành công!';
        this.snackbar.open('Đặt hàng thành công!', 'Đóng', {
                  duration: 3000
                });

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
        this.statusMessage = 'Thanh toán không thành công!';
      }
    } else {
      this.statusMessage = 'Sai chữ ký (Invalid signature)';

      // DEBUG chi tiết
      console.log('=== DEBUG CHI TIẾT ===');
      const hashData = this.getHashDataString(fields);
      console.log('Hash Data:', hashData);
      console.log('Secret Key:', this.secretKey);
    }
  }

  private urlEncode(value: string): string {
    // URL encode theo chuẩn US_ASCII như VNPay
    return encodeURIComponent(value)
      .replace(/%20/g, '+')
      .replace(/%2B/g, '+')
      .replace(/%2D/g, '-')
      .replace(/%2E/g, '.')
      .replace(/%21/g, '!')
      .replace(/%2A/g, '*')
      .replace(/%27/g, "'")
      .replace(/%28/g, '(')
      .replace(/%29/g, ')');
  }

  private getHashDataString(fields: Map<string, string>): string {
    // Sắp xếp keys
    const fieldNames = Array.from(fields.keys()).sort();
    const sb: string[] = [];

    for (const fieldName of fieldNames) {
      const fieldValue = fields.get(fieldName);
      if (fieldValue && fieldValue.length > 0) {
        sb.push(`${fieldName}=${fieldValue}`);
      }
    }

    return sb.join('&');
  }

  private hashAllFields(fields: Map<string, string>): string {
    const hashData = this.getHashDataString(fields);
    return this.hmacSHA512(this.secretKey, hashData);
  }

  private hmacSHA512(key: string, data: string): string {
    try {
      if (!key || !data) {
        throw new Error('Key or data is null');
      }

      const hash = crypto.HmacSHA512(data, key);
      return hash.toString(crypto.enc.Hex);

    } catch (ex) {
      console.error('Error generating HMAC-SHA512:', ex);
      return '';
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }




  sendVnpayIpn() {
    // Get query string and hash from current URL
    const queryString = window.location.search + window.location.hash;
    // Or get full path: const fullPath = window.location.pathname + window.location.search + window.location.hash;
    console.log('queryURL:', queryString);
    this.vnpayService.handleVnpayIpn(queryString).subscribe({
      next: (response) => {
        console.log('VNPay IPN Response:', response);
      },
      error: (error) => {
        console.error('VNPay IPN Error:', error);
      }
    });
  }

}

