import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit{

  registerForm!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder, 
    private snackBar: MatSnackBar, 
    private router: Router, 
    private authService: AuthService
  ){ } 


  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }
    );
    this.registerForm.addValidators(this.passwordMatchValidator);
  }



  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true }; // Trả về lỗi cho FormGroup
  }



  onSubmit() {

   



    if (this.registerForm.valid) {
     
      this.isLoading = true;

      this.authService.register(this.registerForm.value).subscribe({
        next: (respone) => {//success
          this.isLoading=false;
        
          this.snackBar.open('Đăng ký tài khoản thành công!', 'Đóng', { duration: 3000 });
          this.router.navigateByUrl("/login");
        },
        error: (error) => { // error
          this.isLoading=false;
          // Kiểm tra nếu error có chứa response và message
          const errorMessage = error.error?.message || "Đăng ký thất bại. Vui lòng thử lại.";
          this.snackBar.open(errorMessage, 'Đóng', { duration: 3000, panelClass: ['snackbar-error'] });
        }
      });

    } else {
      if (this.registerForm.hasError('passwordMismatch')) {
        this.snackBar.open('Mật khẩu nhập lại không khớp!', 'Đóng', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      } else {
        this.snackBar.open('Vui lòng nhập đầy đủ thông tin!', 'Đóng', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }

    }

  }


}
