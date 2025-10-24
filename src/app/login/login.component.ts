import { HttpClient } from '@angular/common/http';
import { VoucherService } from './../services/voucher/voucher.service';
import { CartService } from './../services/cart/cart.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserstorageService } from '../services/storage/userstorage.service';
import { CheckoutService } from '../customer/service/checkout.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  userInfo: any;
  isLoading: boolean = false;
  private messageListener!: (event: MessageEvent) => void;
  private BASIC_URL = environment.BASIC_URL;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private voucherService: VoucherService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.messageListener = (event: MessageEvent) => {
      if (event.data.type === 'LOGIN_SUCCESS') {
        // Sau khi đăng nhập thành công, gọi API /cookie để lấy thông tin
      


        this.authService.getUserInfo().subscribe({
          next: () => {

            if (UserstorageService.isCustomerLoggedIn()) {
              // Kiểm tra nếu có redirectUrl trong localStorage
              const redirectUrl = localStorage.getItem('redirectUrl') || '/';
              const fromCheckout = localStorage.getItem('fromCheckout');

              // Xóa các giá trị đã lưu sau khi sử dụng
              localStorage.removeItem('redirectUrl');
              localStorage.removeItem('fromCheckout');
              if (redirectUrl && fromCheckout) {
                // Nếu là từ checkout thì navigate về trang đó và mở stepper
                this.router.navigateByUrl(redirectUrl).then(() => {
                  // Giả sử bạn có cách để trigger openStepperDialog từ component hiện tại
                  // Bạn có thể dùng service hoặc EventEmitter để thực hiện việc này
                  // Ví dụ:
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
                          next: () => {
                            console.log("cập nhật trạng thái customervoucher đã sử dụng");
                          },
                          error: () => {
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
                });
              } else if (redirectUrl) {
                // Nếu có redirectUrl nhưng không phải từ checkout
                this.router.navigateByUrl(redirectUrl);
              } else {
                // Mặc định chuyển đến trang chu
                this.router.navigateByUrl('/');
              }
            } else {
              this.router.navigateByUrl('/login'); // Chuyển hướng nếu đăng nhập thành công
            }

          },
          error: () => {
            //err
            this.snackbar.open('Không thể lấy thông tin người dùng!', 'Đóng', {
              duration: 3000,
              panelClass: ['snackbar-error'],
            });
            this.router.navigate(['/login']); // Chuyển hướng lại nếu chưa đăng nhập
          },
        });
      }
    };

    window.addEventListener('message', this.messageListener);


  }

  ngOnDestroy(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
  }


  onSubmit() {

    if (this.loginForm.invalid) return;

    this.isLoading = true;


    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        //success


        // Kiểm tra nếu có redirectUrl trong localStorage
        const redirectUrl = localStorage.getItem('redirectUrl');
        const fromCheckout = localStorage.getItem('fromCheckout');

        // Xóa các giá trị đã lưu sau khi sử dụng
        localStorage.removeItem('redirectUrl');
        localStorage.removeItem('fromCheckout');

        if (UserstorageService.isAdminLoggedIn()) {
          this.router.navigateByUrl('admin/dashboard');
        } else if (UserstorageService.isCustomerLoggedIn()) {
          if (redirectUrl && fromCheckout) {
            // Nếu là từ checkout thì navigate về trang đó và mở stepper
            this.router.navigateByUrl(redirectUrl).then(() => {
              // Giả sử bạn có cách để trigger openStepperDialog từ component hiện tại
              // Bạn có thể dùng service hoặc EventEmitter để thực hiện việc này
              // Ví dụ:
              this.checkoutService.openStepperDialog().subscribe(result => {
                if (result?.success) {
                  this.cartService.clearCart();
                  const voucherCode = localStorage.getItem('voucherCode');
                  const voucherId = localStorage.getItem('voucherId');
                  localStorage.removeItem('voucherCode');
                  localStorage.removeItem('voucherId');
                  if (voucherCode) {
                    this.voucherService.incrementVoucherUsage(voucherCode).subscribe({
                      next: () => {
                        console.log("cập nhật số lần voucher đã sử dụng");
                      },
                      error: () => {
                        this.snackbar.open('Cập nhật trạng thái voucher thất bại!', 'Đóng', {
                          duration: 3000,
                          panelClass: ['snackbar-error'],
                        });
                      }
                    });
                  } else if (voucherId) {
                    const customerId = Number(UserstorageService.getUserId());
                    this.voucherService.markCustomerVoucherAsUsed(customerId, Number(voucherId)).subscribe({
                      next: () => {
                        console.log("cập nhật trạng thái customervoucher đã sử dụng");
                      },
                      error: () => {
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
            });
          } else if (redirectUrl) {
            // Nếu có redirectUrl nhưng không phải từ checkout
            this.router.navigateByUrl(redirectUrl);
          } else {
            // Mặc định chuyển đến dashboard
            this.router.navigateByUrl('/');
          }
        } else if (UserstorageService.isStaffLoggedIn()) {
          this.router.navigate(['/staff']);
        } else if (UserstorageService.isDeliveryLoggedIn()) {
          this.router.navigate(['/delivery']);
        }
        //-----------------------------------

        //------------------------------------
        this.snackbar.open('Đăng nhập thành công!', 'Đóng', { duration: 3000 });
      },
      error: (error) => {
        this.isLoading = false;
        // error
        this.snackbar.open('Email hoặc mật khẩu không đúng!', 'Đóng', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

  googleLogin() {
    window.open(
      `${this.BASIC_URL}oauth2/authorization/google`,
      '_blank',
      'width=600,height=600'
    );
  }

  facebookLogin() {
    window.open(
      `${this.BASIC_URL}oauth2/authorization/facebook`,
      '_blank',
      'width=600,height=600'
    );
  }
}
