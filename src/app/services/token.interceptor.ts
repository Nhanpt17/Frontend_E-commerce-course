import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { Injectable } from "@angular/core";
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpErrorResponse
  } from '@angular/common/http';
  import { Observable, throwError, BehaviorSubject } from 'rxjs';
  import { catchError, switchMap, filter, take, exhaustMap } from 'rxjs/operators';
  import { AuthService } from "./auth/auth.service";
import { UserstorageService } from "./storage/userstorage.service";


@Injectable()
export class TokenInterceptor implements HttpInterceptor{

    private isRefreshing = false;
    private accessTokenSubject: BehaviorSubject<string|null> = new BehaviorSubject<string|null>(null);

    constructor(private authService:AuthService, private userstorageService:UserstorageService, private router:Router, private snackbar:MatSnackBar){ }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // Nếu request là API refresh token, không gửi Authorization header
        if (req.url.includes('/reset/refresh-token')||
        req.url.includes('/reset/forgot-password')||
        req.url.includes('/reset/validate-reset-token')||
        req.url.includes('/reset/reset-password')||
        req.url.startsWith('api/products') ||
        req.url.includes('/cookie')|| 
        req.url.includes('/vouchers/apply')||
        req.url.includes('api/momo/create') ||       
        req.url.includes('api/momo/handle/after-payment')) {
         return next.handle(req);
        }

        let authReq= req;
        const accessToken = UserstorageService.getAccessToken();

        if(accessToken){
            authReq = this.addAccessToken(req,accessToken);
        }

        return next.handle(authReq).pipe(
            catchError(err =>{
                console.log("Lỗi request:", err);


                console.log("Status:", err.status); // Kiểm tra nếu có 0 hoặc 401
                console.log("Body:", err.error); // Xem nội dung response

                if(err instanceof HttpErrorResponse && err.status === 401){

                    console.log("chạy vô hàm gửi yêu cầu xử lý lỗi 401");
                    return this.handle401Error(req,next);
                }
                
                return throwError(() => err);
            })
        );


    }



    private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
        if(!this.isRefreshing){
            this.isRefreshing=true;
            this.accessTokenSubject.next(null);
            console.log("Đang yêu cầu refresh token...");

            return this.authService.refreshToken().pipe(
                switchMap((tokendata:any)=>{
                    console.log("Nhận access token mới:");
                    this.isRefreshing = false;
                    this.accessTokenSubject.next(tokendata.accessToken);

                    return next.handle(this.addAccessToken(req,tokendata.accessToken));
                }),
                catchError((err)=>{
                    this.snackbar.open('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 'Đóng', {
                        duration: 5000,
                        panelClass: ['snackbar-error'],
                        verticalPosition: 'top' // Hiển thị ở phía trên
                      });
                    console.log("gặp lỗi lúc đang yêu cầu gửi lại access token");
                    this.isRefreshing= false;
                    UserstorageService.signOut();
                    localStorage.setItem("logout", Date.now().toString()); // Phát sự kiện logout
                    
                    this.router.navigate(["/login"]);
                    
                      
                    return throwError(()=>err);
                })
            );
            
            
            
        }
        else{
            console.log("Chờ refresh token hoàn tất...");
            return this.accessTokenSubject.pipe(
                filter(token => token !==null),
                take(1),
                switchMap(accessToken => next.handle(this.addAccessToken(req,accessToken!)))
            );
        }

    }


    private addAccessToken(req:HttpRequest<any>,accessToken:string){
        return req.clone({
            setHeaders:{
                 Authorization: `Bearer ${accessToken}`
            }});
    }

}