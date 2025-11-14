import { ExchangeRateService } from './../services/exchange/exchange-rate.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckoutService } from './../customer/service/checkout.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CartService } from '../services/cart/cart.service';
import { UserstorageService } from '../services/storage/userstorage.service';
import { PaymentStepperDialogComponent } from '../customer/components/payment-stepper-dialog/payment-stepper-dialog.component';
import { PaypalCheckoutStepperComponent } from '../customer/components/paypal-checkout-stepper/paypal-checkout-stepper.component';
import { VoucherService } from '../services/voucher/voucher.service';
import { environment } from 'src/environments/environment';
import { loadScript } from '@paypal/paypal-js';
import { firstValueFrom } from 'rxjs';
import { NgZone } from '@angular/core';
import { VnpayPaymentComponent } from '../customer/components/vnpay-payment/vnpay-payment.component';

declare var paypal: any;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  private paypalLoaded = false;
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
  payPalClientID: string = environment.PAYPAL_CLIENT_ID;
  BASIC_URL = environment.BASIC_URL;
  usdRate = 25000;
  payPalUser: any;
  constructor(private cartService: CartService, private router: Router, private dialog: MatDialog,
    private checkoutService: CheckoutService, private voucherService: VoucherService,
    private snackbar: MatSnackBar, private exchangeService: ExchangeRateService,
    private zone: NgZone) { }

  ngOnInit() {


    this.exchangeService.getUsdRate().then(rate => {
      this.usdRate = rate;
      console.log('Tỷ giá:', rate);
    });

    this.cart = this.cartService.getCart();

    this.calculateTotal();

    if (UserstorageService.isCustomerLoggedIn()) {
      this.loadCustomerVouchers();
    }

    // this.loadPayPalService(this.payPalClientID, this.BASIC_URL);

    this.loadPayPalServiceOnce(this.payPalClientID);

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
    if (this.discountAmount != 0) {
      this.removeVoucher();
    }

    this.calculateTotal();

    // refresh PayPal button state
    this.refreshPayPalButtons();
  }

  decreaseQuantity(productId: number) {
    this.cartService.decreaseQuantity(productId);
    this.cart = this.cartService.getCart();
    if (this.discountAmount != 0) {
      this.removeVoucher();
    }
    this.calculateTotal();

    // refresh PayPal button state
    this.refreshPayPalButtons();
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
    this.cart = this.cartService.getCart();
    if (this.discountAmount != 0) {
      this.removeVoucher();
    }
    this.calculateTotal();

    // refresh PayPal button state
    this.refreshPayPalButtons();
  }

  clearCart() {
    this.cartService.clearCart();
    this.cart = [];
    if (this.discountAmount != 0) {
      this.removeVoucher();
    }
    this.calculateTotal();


    // refresh PayPal button state
    this.refreshPayPalButtons();
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

        this.voucherError = err.error.message || 'Có lỗi xảy ra khi áp dụng voucher';
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

  checkInput() {
    if (this.discountCode == '' && this.selectedVoucherId == null) {
      this.voucherError = null;
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


  // async loadPayPalService(clientId: string, baseUrl: string): Promise<void> {
  //   // 🔹 Khai báo các biến để có thể thay đổi giá trị
  //   let customerId: string = '';
  //   let customerName: string = '';
  //   let customerEmail: string = '';
  //   let cartItems: any[] = [];
  //   let totalPrice: number = 0;
  //   let shippingFee: number = 0;
  //   let discountAmount: number = 0;
  //   let finalAmount: number = 0;

  //   let shippingPhone: string = '';
  //   let shippingAddress: string = '';
  //   let payment: string = 'paypal';  // cố định hoặc có thể đổi

  //   try {
  //     paypal = await loadScript({ clientId });
  //   } catch (error) {
  //     console.error('❌ Failed to load the PayPal JS SDK script:', error);
  //     return;
  //   }

  //   if (!paypal) {
  //     console.error('⚠️ PayPal SDK not loaded.');
  //     return;
  //   }

  //   try {
  //     await paypal.Buttons({
  //       style: {
  //         shape: 'pill',
  //         label: 'paypal',
  //         layout: 'vertical',
  //       },
  //       message: {
  //         amount: 100,
  //         align: 'center',
  //         color: 'black',
  //         position: 'top',
  //       },

  //       // ⚙️ Khi nút được click
  //       onClick: async (data: any, actions: any) => {
  //         const itemCount = this.cartService.getItemQuantity();
  //         console.log('🛒 Item count in cart:', itemCount);

  //         if (itemCount < 1) {
  //           this.snackbar.open('🛒 Giỏ hàng trống. Vui lòng thêm sản phẩm!', 'Đóng', {
  //             duration: 2500,
  //             horizontalPosition: 'center',
  //             verticalPosition: 'bottom',
  //             panelClass: ['custom-snackbar']
  //           });
  //           return actions.reject(); // gợi ý dừng phía PayPal
  //         }

  //         if (!UserstorageService.isLoggedIn()) {
  //           this.snackbar.open('🛒 Giỏ hàng trống. Vui lòng thêm sản phẩm!', 'Đóng', {
  //             duration: 2500,
  //             horizontalPosition: 'center',
  //             verticalPosition: 'bottom',
  //             panelClass: ['custom-snackbar']
  //           });
  //           return actions.reject();
  //         }

  //         const dialogRef = this.dialog.open(PaypalCheckoutStepperComponent, {
  //           width: '400px',
  //           disableClose: true
  //         });

  //         const userInfo = await firstValueFrom(dialogRef.afterClosed());
  //         if (!userInfo) {
  //           this.snackbar.open('User cancelled shipping info input.!', 'Đóng', { duration: 2500 });
  //           return actions.reject();
  //         }

  //         // 🧩 Lưu lại info để dùng trong createOrder
  //         shippingPhone = userInfo.phone || '';
  //         shippingAddress = userInfo.address || '';
  //         customerId = UserstorageService.getUserId() || '';
  //         customerName = UserstorageService.getUserName() || '';
  //         customerEmail = UserstorageService.getUserEmail() || '';
  //         cartItems = this.cartService.getCart();
  //         totalPrice = this.cartService.getTotalPrice() || 0;
  //         shippingFee = this.shippingFee || 0;
  //         discountAmount = this.discountAmount || 0;
  //         finalAmount = this.finalAmount || 0;


  //         console.log('✅ Shipping info from user:', userInfo);


  //         return actions.resolve(); // tiếp tục
  //       },

  //       createOrder: async () => {
  //         const itemCount = this.cartService.getItemQuantity();
  //         if (itemCount < 1) {
  //           console.log('🛑 Cart empty → stop createOrder()');
  //           throw new Error('Cart is empty');
  //         }
  //         console.log('🛒 Calling backend → create order...');
  //         try {
  //           const orderData: any = await fetch(`${baseUrl}api/paypal/create-order`, {
  //             method: 'POST',
  //             headers: { 'Content-Type': 'application/json' },
  //             body: JSON.stringify({
  //               cart: this.cart.map((item: { id: any; name: any; description: any; quantity: any; price: number; imgUrl: any; categoryId: any }) => ({
  //                 id: item.id,
  //                 name: item.name,
  //                 description: item.description,
  //                 quantity: item.quantity,
  //                 unitAmount: (item.price / this.usdRate).toFixed(2), // VND → USD
  //                 category: 'PHYSICAL_GOODS',
  //                 imageUrl: item.imgUrl,
  //                 categoryId: item.categoryId
  //               })),
  //               shipping: (this.shippingFee / this.usdRate).toFixed(2),
  //               discount: (this.discountAmount / this.usdRate).toFixed(2),
  //               currency: 'USD',
  //               customerId: this.customerId,
  //               description: 'Thanh toán giỏ hàng nước ép tại cửa hàng X',
  //               data: {
  //                 customerId: customerId,
  //                 customerName: customerName,
  //                 customerEmail: customerEmail,
  //                 cartItems: cartItems,
  //                 totalPrice: totalPrice,
  //                 shippingFee: shippingFee,
  //                 discountAmount: discountAmount,
  //                 finalAmount: finalAmount,
  //                 phone: shippingPhone,       // nhập từ modal
  //                 address: shippingAddress,   // nhập từ modal
  //                 payment: payment
  //               },
  //             }),
  //           }).then(async res => {
  //             const text = await res.text();
  //             if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  //             return text ? JSON.parse(text) : {};
  //           });

  //           console.log('✅ Backend returned order data:', orderData);

  //           if (!orderData.id) {
  //             const err = orderData.details?.[0];
  //             throw new Error(err
  //               ? `${err.issue}: ${err.description} (${orderData.debug_id})`
  //               : 'Unexpected error creating order.');
  //           }

  //           return orderData.id;
  //         } catch (err) {
  //           this.snackbar.open('Error creating PayPal order:. Please try again.', 'Đóng', {
  //             duration: 2500,
  //             panelClass: ['snackbar-error'],
  //           });
  //           return;
  //         }
  //       },

  //       onApprove: async (data: any) => {
  //         console.log('💰 Capturing funds for order:', data.orderID);
  //         try {
  //           const captureData: any = await fetch(`${baseUrl}api/paypal/orders/capture`, {
  //             method: 'POST',
  //             headers: { 'Content-Type': 'application/json' },
  //             body: JSON.stringify({ orderId: data.orderID }),
  //           }).then(async res => {
  //             const text = await res.text();
  //             if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  //             return text ? JSON.parse(text) : {};
  //           });

  //           console.log('✅ Capture response:', captureData);
  //           this.snackbar.open(`Transaction completed by ${captureData.payer?.name?.given_name || 'unknown buyer'}`, 'Đóng', {
  //             duration: 2500,
  //             panelClass: ['success-snackbar']
  //           });

  //           // update voucher
  //           this.cartService.clearCart();
  //           const voucherCode = this.discountCode || '';
  //           const voucherId = this.selectedVoucherId == null ? '' : this.selectedVoucherId.toString();

  //           if (voucherCode) {
  //             this.voucherService.incrementVoucherUsage(voucherCode).subscribe({
  //               next: (value) => {
  //                 console.log("cập nhật số lần voucher đã sử dụng");
  //               },
  //               error: (err) => {
  //                 this.snackbar.open('Cập nhật trạng thái voucher thất bại!', 'Đóng', {
  //                   duration: 3000,
  //                   panelClass: ['snackbar-error'],
  //                 });
  //               }
  //             });
  //           } else if (voucherId) {
  //             const customerId = Number(UserstorageService.getUserId());
  //             this.voucherService.markCustomerVoucherAsUsed(customerId, Number(voucherId)).subscribe({
  //               next: (value) => {
  //                 console.log("cập nhật trạng thái customervoucher đã sử dụng");
  //               },
  //               error: (err) => {
  //                 this.snackbar.open('Cập nhật trạng thái CustomerVoucher thất bại!', 'Đóng', {
  //                   duration: 3000,
  //                   panelClass: ['snackbar-error'],
  //                 });
  //               }
  //             });
  //           }
  //           console.log("thanh toan thanh cong");
  //           // Xử lý kết quả
  //           // redirect to history
  //           window.location.href = "/customer/order-history";
  //         } catch (err) {
  //           console.error('❌ Error capturing order:', err);
  //           this.snackbar.open('Payment capture failed. Please try again.', 'Đóng', {
  //             duration: 2500,
  //             panelClass: ['snackbar-error'],
  //           });


  //         }
  //       },

  //       onCancel() {
  //         console.log('🟡 Payment cancelled by user');
  //       },

  //       onError(err: any) {
  //         console.error('🔥 PayPal checkout error:', err);
  //         this.snackbar.open('Something went wrong during checkout. Please try again.', 'Đóng', {
  //           duration: 2500,
  //           panelClass: ['snackbar-error'],
  //         });
  //       },
  //     }).render('#paypal-button-container');
  //   } catch (error) {
  //     console.error('❌ Failed to render PayPal Buttons:', error);
  //     this.snackbar.open('Failed to render PayPal Buttons:. Please try again.', 'Đóng', {
  //       duration: 2500,
  //       panelClass: ['snackbar-error'],
  //     });
  //   }
  // }





  //gọi 1 lần trong ngOnInit để load SDK, rồi render





  async loadPayPalServiceOnce(clientId: string) {
    if (this.paypalLoaded) return;
    try {
      await loadScript({ clientId });
      this.paypalLoaded = true;
      // render lần đầu
      this.renderPayPalButtons();
    } catch (err) {
      console.error('Failed to load PayPal SDK', err);
      this.zone.run(() => {
        this.snackbar.open('Không thể tải PayPal. Vui lòng thử lại.', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
      });
    }
  }

  // gọi khi cart thay đổi để refresh trạng thái nút
  private refreshPayPalButtons() {
    // nếu SDK chưa load thì nothing
    if (!this.paypalLoaded) return;
    // hủy container cũ rồi render lại
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';
    this.renderPayPalButtons();
  }


  private renderPayPalButtons() {
    if (!window.hasOwnProperty('paypal')) {
      console.warn('paypal not available yet');
      return;
    }

    // đảm bảo container trống trước khi render (tránh render chồng)
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';

    try {
      // 🔹 Khai báo các biến để có thể thay đổi giá trị
      let customerId: string = '';
      let customerName: string = '';
      let customerEmail: string = '';
      let cartItems: any[] = [];
      let totalPrice: number = 0;
      let shippingFee: number = 0;
      let discountAmount: number = 0;
      let finalAmount: number = 0;
      let systemOrderId: number = 0;
      let shippingPhone: string = '';
      let shippingAddress: string = '';
      let payment: string = 'paypal';  // cố định hoặc có thể đổi

      paypal.Buttons({
        style: {
          shape: 'pill',
          label: 'paypal',
          layout: 'vertical',
        },

        // onInit chạy khi button ready — ta enable/disable theo cart hiện tại
        onInit: (data: any, actions: any) => {
          const itemCount = this.cartService.getItemQuantity();
          if (itemCount < 1) {
            actions.disable();
          } else {
            actions.enable();
          }
        },

        // check khi click — vẫn giữ kiểm tra an toàn
        onClick: async (data: any, actions: any) => {
          const itemCount = this.cartService.getItemQuantity();
          // chạy snackbar trong ngZone và cố định vị trí
          if (itemCount < 1) {
            this.zone.run(() => {
              this.snackbar.open('🛒 Giỏ hàng trống. Vui lòng thêm sản phẩm!', 'Đóng', {
                duration: 2500,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['snackbar-error']
              });
            });
            return actions.reject();
          }

          if (!UserstorageService.isLoggedIn()) {
            this.zone.run(() => {
              this.snackbar.open('Vui lòng đăng nhập trước khi thanh toán!', 'Đóng', {
                duration: 2500,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['snackbar-error']
              });
            });
            return actions.reject();
          }


          if (!this.payPalUser) {

            // Mở dialog lấy thông tin shipping
            const dialogRef = this.dialog.open(PaypalCheckoutStepperComponent, {
              width: '400px',
              disableClose: true
            });
            dialogRef.afterClosed().subscribe(userInfo => {
              if (userInfo) {
                this.payPalUser = userInfo;
                this.zone.run(() => {
                  this.snackbar.open('Thông tin đã lưu! Vui lòng bấm PayPal lại.', 'Đóng', {
                    duration: 2500,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    panelClass: ['snackbar-error']
                  });
                });
              } else {
                this.zone.run(() => {
                  this.snackbar.open('Vui lòng điền thông tin vận chuyển!', 'Đóng', {
                    duration: 2500,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    panelClass: ['snackbar-error']
                  });
                });
              }
            });
            return actions.reject();
          }




          // lưu dữ liệu cần thiết vào biến cục bộ nếu cần...

          // 🧩 Lưu lại info để dùng trong createOrder
          shippingPhone = this.payPalUser.phone || '';
          shippingAddress = this.payPalUser.address || '';
          customerId = UserstorageService.getUserId() || '';
          customerName = UserstorageService.getUserName() || '';
          customerEmail = UserstorageService.getUserEmail() || '';
          cartItems = this.cartService.getCart();
          totalPrice = this.cartService.getTotalPrice() || 0;
          shippingFee = this.shippingFee || 0;
          discountAmount = this.discountAmount || 0;
          finalAmount = this.finalAmount || 0;



          console.log('✅ Shipping info from user:', this.payPalUser);


          // nếu mọi thứ ok:
          return actions.resolve();








        },



        // giữ nguyên createOrder / onApprove / onError như bạn có, 
        // nhưng khi gọi snackbar ở đây nhớ dùng this.zone.run(...)
        createOrder: async () => {
          console.log("di vo create order");
          // ... bạn có thể copy logic createOrder hiện tại vào đây (giữ dấu this)
          const itemCount = this.cartService.getItemQuantity();
          if (itemCount < 1) {
            console.log('🛑 Cart empty → stop createOrder()');
            throw new Error('Cart is empty');
          }
          console.log('🛒 Calling backend → create order...');
          try {
            const orderData: any = await fetch(`${this.BASIC_URL}api/paypal/create-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cart: this.cart.map((item: { id: any; name: any; description: any; quantity: any; price: number; imgUrl: any; categoryId: any }) => ({
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  quantity: item.quantity,
                  unitAmount: (item.price / this.usdRate).toFixed(2), // VND → USD
                  category: 'PHYSICAL_GOODS',
                  imageUrl: item.imgUrl,
                  categoryId: item.categoryId
                })),
                shipping: (this.shippingFee / this.usdRate).toFixed(2),
                discount: (this.discountAmount / this.usdRate).toFixed(2),
                currency: 'USD',
                customerId: this.customerId,
                description: 'Thanh toán giỏ hàng nước ép tại cửa hàng X',
                data: {
                  customerId: customerId,
                  customerName: customerName,
                  customerEmail: customerEmail,
                  cartItems: cartItems,
                  totalPrice: totalPrice,
                  shippingFee: shippingFee,
                  discountAmount: discountAmount,
                  finalAmount: finalAmount,
                  phone: shippingPhone,       // nhập từ modal
                  address: shippingAddress,   // nhập từ modal
                  payment: payment
                },
              }),
            }).then(async res => {
              const text = await res.text();
              if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
              return text ? JSON.parse(text) : {};
            });

            console.log('✅ Backend returned order data:', orderData);

            if (!orderData.id) {
              const err = orderData.details?.[0];
              throw new Error(err
                ? `${err.issue}: ${err.description} (${orderData.debug_id})`
                : 'Unexpected error creating order.');
            }

            systemOrderId = orderData.systemOrderId
            return orderData.id;
          } catch (err) {
            this.zone.run(() => {
              this.snackbar.open('Error creating PayPal order:. Please try again.', 'Đóng', {
                duration: 2500,
                panelClass: ['snackbar-error'],
              });
            });

            return;
          }

          // khi gọi this.snackbar.open(...) trong createOrder/onApprove/onError, bọc vào this.zone.run(...)
        },

        onApprove: async (data: any) => {
          // copy logic onApprove hiện tại; khi gọi snackbar => this.zone.run(...)
          console.log('💰 Capturing funds for order:', data.orderID);
          try {
            console.log("systemOrderId", data.systemOrderId)
            const captureData: any = await fetch(`${this.BASIC_URL}api/paypal/orders/capture`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderID,
                systemOrderId: systemOrderId
              }),
            }).then(async res => {
              const text = await res.text();
              if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
              return text ? JSON.parse(text) : {};
            });

            console.log('✅ Capture response:', captureData);
            this.snackbar.open(`Transaction completed by ${captureData.payer?.name?.given_name || 'unknown buyer'}`, 'Đóng', {
              duration: 2500,
              panelClass: ['success-snackbar']
            });

            // update voucher
            this.cartService.clearCart();
            const voucherCode = this.discountCode || '';
            const voucherId = this.selectedVoucherId == null ? '' : this.selectedVoucherId.toString();

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
            console.log("thanh toan thanh cong");
            // Xử lý kết quả
            // redirect to history
            window.location.href = "/customer/order-history";
          } catch (err) {
            console.error('❌ Error capturing order:', err);
            this.zone.run(() => {
              this.snackbar.open('Payment capture failed. Please try again.', 'Đóng', {
                duration: 2500,
                panelClass: ['snackbar-error'],
              });
            });


          }
        },

        onError: (err: any) => {
          this.zone.run(() => {
            this.snackbar.open('Something went wrong during checkout. Please try again.', 'Đóng', {
              duration: 2500,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['snackbar-error']
            });
          });
          console.error(err);
        }

      }).render('#paypal-button-container');
    } catch (err) {
      console.error('Failed to render PayPal Buttons', err);
    }
  }


  /**
   * Phương thức XỬ LÝ sự kiện paymentInitiated từ VnpayPaymentComponent.
   * Nó được gọi ngay trước khi VnpayPaymentComponent thực hiện chuyển hướng đến cổng VNPAY.
   * Đây là nơi bạn có thể hiển thị thông báo hoặc lưu trữ trạng thái giỏ hàng.
   */
  vnpayCheckout(): void {

    if (this.cartService.getItemQuantity() < 1)
      return;


    console.log('--- Thanh toán VNPAY được khởi tạo từ Cart Component ---');
    // Lưu thông tin voucher nếu có
    localStorage.removeItem('voucherCode');
      localStorage.removeItem('voucherId');
      
    if (this.discountCode) {
      localStorage.setItem('voucherCode', this.discountCode);
    } else if (this.selectedVoucherId) {
      localStorage.setItem('voucherId', this.selectedVoucherId.toString());
    }
    // Ví dụ 1: Hiển thị thông báo cho người dùng
    // Mở dialog lấy thông tin shipping

    if (UserstorageService.isCustomerLoggedIn()) {
      const dialogRef = this.dialog.open(VnpayPaymentComponent, {
      width: '450px',
      data: {
        customerId: UserstorageService.getUserId() || '',
        customerName: UserstorageService.getUserName() || '',
        customerEmail: UserstorageService.getUserEmail() || '',
        cartItems: this.cartService.getCart(),
        totalPrice: this.cartService.getTotalPrice() || 0,
        shippingFee: this.shippingFee || 0,
        discountAmount: this.discountAmount || 0,
        finalAmount: this.finalAmount || 0,

      }
    });
    dialogRef.afterClosed().subscribe(userInfo => {
      console.log('data after close dialog', userInfo);
      

    });
    }
    else if (!UserstorageService.isLoggedIn()) {
      this.snackbar.open('Vui lòng đăng nhập trước khi thanh toán!','Đóng',{duration:2500});
    }

    
    // Ví dụ 2: (Quan trọng) Lưu trữ trạng thái đơn hàng cuối cùng vào DB 
    // để chuẩn bị cho bước xử lý kết quả thanh toán (với orderId chính xác).
    // this.saveOrderBeforePayment(); 

    // Trong thực tế, bạn sẽ cần gọi một service để lưu đơn hàng
    // và nhận lại Order ID, sau đó truyền Order ID này vào VnpayPaymentComponent 
    // thay cho customerId hoặc orderInfo hiện tại.
  }



}
