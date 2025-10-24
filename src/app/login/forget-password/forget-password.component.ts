import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './../../services/auth/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent {
  email: string ='';
  message: string = '';
  isProcessing: boolean = false;  // Biến kiểm soát trạng thái xử lý

  constructor(private authService:AuthService,private snackBar: MatSnackBar){}





  requestReset(){

    if (!this.email) {
      this.message = "Email không được để trống!";
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.message = "Vui lòng nhập đúng định dạng email!";
      return;
    }

    this.isProcessing = true;  // Bắt đầu xử lý, vô hiệu hóa nút submit

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.showSnackbar("Vui lòng kiểm tra email để đặt lại mật khẩu.");
        this.email = '';
      },
      error: (err) => {
        this.message = err.error?.message || "Có lỗi xảy ra!";
        this.showSnackbar(this.message, "error");
        this.isProcessing = false; 
      },
      complete: () => {
        this.isProcessing = false;  // Hoàn tất xử lý, kích hoạt lại nút submit
      }
    });


  }


  validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  clearMessage() {
    this.message = '';
  }


  isButtonDisabled(): boolean {
    return !this.email || !this.validateEmail(this.email);
  }


  showSnackbar(message: string, type: "success" | "error" = "success") {
    this.snackBar.open(message, "Đóng", {
      duration: 3000,
      panelClass: type === "error" ? "snackbar-error" : "snackbar-success",
    });
  }

}
