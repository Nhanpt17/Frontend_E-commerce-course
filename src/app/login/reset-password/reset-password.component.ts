import { AuthService } from './../../services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit{

  newPassword:string='';
  confirmPassword:string='';
  isProcessing: boolean = false;  // Biến kiểm soát trạng thái xử lý
  token!:string;
  tokenValid:boolean =false;
  errorMessage:string ='';
  message: string = '';
  confirmMessage: string = '';


  constructor(protected router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar)
    { }

  ngOnInit(): void {
    // lay token tu url
    this.token = this.route.snapshot.queryParamMap.get('token')|| '';
   
    if(this.token){
      this.validateToken(this.token);
    }
    else{
      this.errorMessage = "Token không hợp lệ";
    }
  }

  validateToken(token:string){
    this.isProcessing = true;
    this.authService.validateToken(token).subscribe({
      next: () =>{
        this.tokenValid = true;
        this.isProcessing = false;
      },
      error: (err) =>{
        this.errorMessage = err.error?.message ||"Token không hợp lệ";
        this.tokenValid = false;
        this.isProcessing=false;
      }
    });
  }


  resetPassword(){

    if (!this.newPassword) {
      this.message = "Mật khẩu không được để trống!";
      return;
    } 

    if (this.newPassword.length < 6) {
      this.message = "Mật khẩu phải có ít nhất 6 ký tự!";
      return;
    }
    

    if (this.newPassword !== this.confirmPassword) {
      this.confirmMessage = "Mật khẩu không khớp!";
      return;
    }
    

    this.isProcessing = true;  // Bắt đầu xử lý, vô hiệu hóa nút submit

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.showSnackbar("Đặt lại mật khẩu thành công!");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.showSnackbar("Có lỗi xảy ra: " + (err.error?.message || "Lỗi không xác định"), "error");
        this.isProcessing = false;  // Hoàn tất xử lý, kích hoạt lại nút submit
      },
      complete: () => {
      this.isProcessing = false;  // Hoàn tất xử lý, kích hoạt lại nút submit
      }
    });

    

  }


  clearMessage() {
    this.message = '';
    this.confirmMessage = '';
  }

  isButtonDisabled(): boolean {
    return !this.newPassword || !this.confirmPassword || this.newPassword.length < 6 || this.newPassword !== this.confirmPassword;
  }

  showSnackbar(message: string, type: "success" | "error" = "success") {
    this.snackBar.open(message, "Đóng", {
      duration: 3000,
      panelClass: type === "error" ? "snackbar-error" : "snackbar-success",
    });
  }


}
