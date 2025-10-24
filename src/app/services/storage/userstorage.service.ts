
import { Injectable } from '@angular/core';

const ACCESS_TOKEN='coffee-access-token';
const REFRESH_TOKEN = 'coffee-refresh-token';
const USER='coffee-user';



@Injectable({
  providedIn: 'root'
})
export class UserstorageService {

  constructor() { }

  public saveAccessToken(accessToken:string):void{
    window.localStorage.removeItem(ACCESS_TOKEN);
    window.localStorage.setItem(ACCESS_TOKEN,accessToken);
  }

  public saveRefreshToken(refreshToken:string):void{
    window.localStorage.removeItem(REFRESH_TOKEN);
    window.localStorage.setItem(REFRESH_TOKEN,refreshToken);
  }

  public saveUser(user:any):void{
    window.localStorage.removeItem(USER);
    window.localStorage.setItem(USER,JSON.stringify(user));
  }

  public static getAccessToken(): string|null{
    return localStorage.getItem(ACCESS_TOKEN);
  }

  static getRefreshToken(): string|null{
    return localStorage.getItem(REFRESH_TOKEN);
  }

  

  static getUser(): any{
    const userData = localStorage.getItem(USER);
    return userData? JSON.parse(userData) :null;
  }

  static getUserId(): string{
    const userData = this.getUser();

    if(userData == null){
      return '';
    }
    return userData.userId;

  }

  static getUserRole(): string{
    const userData = this.getUser();

    if(userData == null){
      return '';
    }
    return userData.role;

  }

  static getUserName(): string{
    const userData = this.getUser();

    if(userData == null){
      return '';
    }
    return userData.name;

  }

  static getUserEmail(): string{
    const userData = this.getUser();

    if(userData == null){
      return '';
    }
    return userData.email;

  }
  static getUserPicture(): string{
    const userData = this.getUser();

    if(userData == null){
      return '';
    }
    return userData.picture;

  }

  


  static isAdminLoggedIn(): boolean{
    if(this.getAccessToken()==null || this.getRefreshToken()==null){
      return false;
    }
    const role: string = this.getUserRole();
    return role =="ADMIN";
  }

  static isCustomerLoggedIn(): boolean{
    if(this.getAccessToken()==null || this.getRefreshToken()==null){
      return false;
    }
    const role: string = this.getUserRole();
    return role =="CUSTOMER";
  }

  static isStaffLoggedIn(): boolean {
    if(this.getAccessToken()==null || this.getRefreshToken()==null){
      return false;
    }
    const role: string = this.getUserRole();
    return role == "STAFF";
  }
  
  static isDeliveryLoggedIn(): boolean {
    if(this.getAccessToken()==null || this.getRefreshToken()==null){
      return false;
    }
    const role: string = this.getUserRole();
    return role == "DELIVERY";
  }

  
  static isLoggedIn():boolean{
    if(this.getAccessToken()==null || this.getRefreshToken()==null){
      return false;
    }
    
    const role: string = this.getUserRole();
    if(role) return true;
    
    return false;
  }

  static signOut(): void{
    window.localStorage.removeItem(ACCESS_TOKEN);
    window.localStorage.removeItem(REFRESH_TOKEN);
    window.localStorage.removeItem(USER);
    window.localStorage.removeItem('fromCheckout');
    window.localStorage.removeItem('redirectUrl');
    window.localStorage.removeItem('shippingFee');
    window.localStorage.removeItem('discountAmount');
    window.localStorage.removeItem('finalAmount');
    
    
  }

}
