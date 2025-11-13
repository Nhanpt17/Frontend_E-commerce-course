import { CartService } from 'src/app/services/cart/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { UserstorageService } from './services/storage/userstorage.service';
import { Router } from '@angular/router';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  cartItemCount$ = this.cartService.cartItemCount$; // Lấy Observable từ service

  title = 'graduateprojectWeb';
  flag: boolean = false;
  userName!: any;
  userAvatar: string = "";

  isCustomerLoggedIn: boolean = UserstorageService.isCustomerLoggedIn();
  isAdminLoggedIn: boolean = UserstorageService.isAdminLoggedIn();
  isStaffLoggedIn: boolean = UserstorageService.isStaffLoggedIn();
  isDeliveryLoggedIn: boolean = UserstorageService.isDeliveryLoggedIn();
  isGuest:boolean = !UserstorageService.isLoggedIn();

  constructor(private router: Router, private authService: AuthService, private snackBar: MatSnackBar, private cartService: CartService) { }




  ngOnInit(): void {

   

    window.addEventListener("storage", (event) => {
      if (event.key === "logout") {
        //UserstorageService.signOut();
        window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
      }
    });




    this.router.events.subscribe(event => {
      this.isCustomerLoggedIn = UserstorageService.isCustomerLoggedIn();
      this.isAdminLoggedIn = UserstorageService.isAdminLoggedIn();
      this.isStaffLoggedIn = UserstorageService.isStaffLoggedIn();
      this.isDeliveryLoggedIn = UserstorageService.isDeliveryLoggedIn();



      if (this.isAdminLoggedIn || this.isCustomerLoggedIn || this.isStaffLoggedIn || this.isDeliveryLoggedIn) {

        if (!this.flag) {
          this.flag = true;
         
          this.userName = UserstorageService.getUserName();


          const avatar = UserstorageService.getUserPicture();

          if (avatar) {

            this.userAvatar = avatar + '?sz=200';
          }
          else
            this.userAvatar = 'https://res.cloudinary.com/dx9yg1sze/image/upload/v1744909102/samples/balloons.jpg';

          
        }

      }
      else {
        this.userAvatar = "";

        this.flag = false;
      }

    })

    
    // this.authService.getUserById(Number(UserstorageService.getUserId())).subscribe(res => {
    //   console.log('data lấy ở app:', res);
    // });

  }



  logout() {
    UserstorageService.signOut();
    this.router.navigateByUrl('login');
  }


  goToProfile() {
    //this.router.navigate(['/profile']);
  }



}
