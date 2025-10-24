import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckoutService } from './../customer/service/checkout.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CartService } from '../services/cart/cart.service';
import { UserstorageService } from '../services/storage/userstorage.service';
import { PaymentStepperDialogComponent } from '../customer/components/payment-stepper-dialog/payment-stepper-dialog.component';
import { VoucherService } from '../services/voucher/voucher.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  cart: any[] = [];
  totalPrice: number = 0;
  discountCode: string = '';
  discountAmount: number = 0;
  shippingFee: number = 0;
  finalAmount: number = 0;
  showDiscountInput: boolean = false;
  availableVouchers: any[] = [];
  selectedVoucherId: number | null = null;
  voucherError: string | null = null;
  customerId = Number(UserstorageService.getUserId());

  constructor(private cartService: CartService, private router: Router, private dialog: MatDialog,
    private checkoutService: CheckoutService, private voucherService: VoucherService,
    private snackbar: MatSnackBar) { }

  ngOnInit() {
    this.cart = this.cartService.getCart();

    this.calculateTotal();

    if (UserstorageService.isCustomerLoggedIn()) {
      this.loadCustomerVouchers();
    }
  }


  loadCustomerVouchers() {
    this.voucherService.getCustomerAvailableVouchers(this.customerId).subscribe({
      next: (res) => {
        this.availableVouchers = res;
      },
      error: (err) => {
        console.error('Error loading customer vouchers:', err);
      }
    });
  }

  increaseQuantity(productId: number) {
    this.cartService.increaseQuantity(productId);
    this.cart = this.cartService.getCart();
    if(this.discountAmount !=0){
      this.removeVoucher();
    }

    this.calculateTotal();
  }

  decreaseQuantity(productId: number) {
    this.cartService.decreaseQuantity(productId);
    this.cart = this.cartService.getCart();
    if(this.discountAmount !=0){
      this.removeVoucher();
    }
    this.calculateTotal();
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
    this.cart = this.cartService.getCart();
    if(this.discountAmount !=0){
      this.removeVoucher();
    }
    this.calculateTotal();
  }

  clearCart() {
    this.cartService.clearCart();
    this.cart = [];
    if(this.discountAmount !=0){
      this.removeVoucher();
    }
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalPrice = this.cartService.getTotalPrice();

    // Áp dụng chiến lược tính phí vận chuyển theo tổng tiền hàng
    if (this.totalPrice >= 300000) {
      this.shippingFee = 0;
    } else if (this.totalPrice >= 100000) {
      this.shippingFee = 15000;
    } else {
      this.shippingFee = 25000;
    }



    // Tính thành tiền cuối cùng
    this.finalAmount = this.totalPrice + this.shippingFee - this.discountAmount;
  }

  // Áp dụng voucher private (nhập mã)
  applyDiscount() {
    this.voucherError = null;
    if (!this.discountCode) {
      return;
    }

    // Đảm bảo không có voucher nào được chọn
    this.selectedVoucherId = null;

    const totalPrice = this.cartService.getTotalPrice();
    const shippingFee = this.shippingFee;

    this.voucherService.applyVoucher(this.discountCode, totalPrice, shippingFee).subscribe({
      next: (res) => {
        if (res.success) {
          this.discountAmount = res.discountAmount;
          this.calculateTotal();
        } else {
          this.voucherError = res.message;
          this.discountAmount = 0;
          this.calculateTotal();
        }
      },
      error: (err) => {
        this.voucherError = err.error.message || 'Có lỗi xảy ra khi áp dụng voucher';
        this.discountAmount = 0;
        this.calculateTotal();
      }
    });

  }

  // Áp dụng voucher public (chọn từ danh sách)
  applyPublicVoucher() {
    
    this.voucherError = null;

    if (!this.selectedVoucherId) {
      return;
    }
    
     // Đảm bảo không có mã nhập tay nào
     this.discountCode = '';

    const totalPrice = this.cartService.getTotalPrice();
    const shippingFee = this.shippingFee;

    this.voucherService.applyCustomerVoucher(this.customerId, this.selectedVoucherId, totalPrice, shippingFee).subscribe({
      next: (res) => {
        if (res.success) {
          this.discountAmount = res.discountAmount;
          this.calculateTotal();
        } else {
          this.voucherError = res.message;
          this.discountAmount = 0;
          this.calculateTotal();
        }
      },
      error: (err) => {
       
        this.voucherError =  err.error.message ||'Có lỗi xảy ra khi áp dụng voucher';
        this.discountAmount = 0;
        this.calculateTotal();
      }
    });
  }

 


  

  // Hủy áp dụng voucher
  removeVoucher() {
    this.discountCode = '';
    this.selectedVoucherId = null;
    this.discountAmount = 0;
    this.voucherError = null;
    this.calculateTotal();
  }
  
  checkInput(){
    if(this.discountCode=='' && this.selectedVoucherId == null){
      this.voucherError =null;
    }
  }

  checkout() {
    if (this.cartService.getItemQuantity() < 1)
      return;



    // Lưu các giá trị phí vận chuyển, giảm giá và tổng tiền
    localStorage.setItem('shippingFee', JSON.stringify(this.shippingFee));
    localStorage.setItem('discountAmount', JSON.stringify(this.discountAmount));
    localStorage.setItem('finalAmount', JSON.stringify(this.finalAmount));

    // Lưu thông tin voucher nếu có
    if (this.discountCode) {
      localStorage.setItem('voucherCode', this.discountCode);
    } else if (this.selectedVoucherId) {
      localStorage.setItem('voucherId', this.selectedVoucherId.toString());
    }


    if (UserstorageService.isCustomerLoggedIn()) {
      this.checkoutService.openStepperDialog().subscribe(result => {
        if (result?.success) {
          this.cartService.clearCart();
          const voucherCode = localStorage.getItem('voucherCode');
          const voucherId = localStorage.getItem('voucherId');
          localStorage.removeItem('voucherCode');
          localStorage.removeItem('voucherId');
          if (voucherCode) {
            this.voucherService.incrementVoucherUsage(voucherCode).subscribe({
              next: (value) => {
                console.log("cập nhật số lần voucher đã sử dụng");
              },
              error: (err) => {
                this.snackbar.open('Cập nhật trạng thái voucher thất bại!', 'Đóng', {
                  duration: 3000,
                  panelClass: ['snackbar-error'],
                });
              }
            });
          } else if (voucherId) {
            const customerId = Number(UserstorageService.getUserId());
            this.voucherService.markCustomerVoucherAsUsed(customerId, Number(voucherId)).subscribe({
              next: (value) => {
                console.log("cập nhật trạng thái customervoucher đã sử dụng");
              },
              error: (err) => {
                this.snackbar.open('Cập nhật trạng thái CustomerVoucher thất bại!', 'Đóng', {
                  duration: 3000,
                  panelClass: ['snackbar-error'],
                });
              }
            });
          }
          console.log("thanh toan thanh cong - Chitiet:: ", result.order);
          // Xử lý kết quả
        } else if (result?.err) {
          // Hiển thị lỗi
          console.log("thanh toan that bai - Chitiet:: ", result.err);

        }
      });
    }
    else if (!UserstorageService.isLoggedIn()) {



      // Lưu lại URL hiện tại vào localStorage
      localStorage.setItem('redirectUrl', this.router.url);
      // Thêm flag để nhận biết đây là từ checkout
      localStorage.setItem('fromCheckout', 'true');
      this.router.navigate(["/login"]);
    }
  }

  

}
