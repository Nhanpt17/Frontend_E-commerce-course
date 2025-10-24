import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { UserstorageService } from '../storage/userstorage.service';
import { environment } from 'src/environments/environment';

const BASIC_URL=environment.BASIC_URL;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  
  //private accessTokenSubject = new BehaviorSubject<string | null>(null);
  
  constructor(private http: HttpClient,private userstorageService:UserstorageService) { }

  register(signupRequest:any):Observable<any>{
    return this.http.post(BASIC_URL+"sign-up",signupRequest);
  }

  login(loginRequest:any):Observable<any>{
    const headers = new HttpHeaders().set('Content-Type','application/json');
    
    return this.http.post(BASIC_URL+'authenticate',loginRequest,{headers, observe:'response'}).pipe(
      map((res)=> {
        const accessToken = res.headers.get('authorization')?.substring(7);
        const refreshToken = res.headers.get('Refresh-Token');
        const user = res.body;
        console.log("accesstoken: "+accessToken);
        console.log("refreshtoken: "+refreshToken);
        if(accessToken && refreshToken &&user ){
          this.userstorageService.saveAccessToken(accessToken);
          this.userstorageService.saveRefreshToken(refreshToken);
          this.userstorageService.saveUser(user);
          
          return true;
        }
        return false;
      }

      )
    );
  }

  getUserInfo(){
    return this.http.get<any>(BASIC_URL+'cookie', { withCredentials: true }).pipe(
      map((res) =>{
        const accessToken:any =  res.accessToken;
        const refreshToken:any =  res.refreshToken;
        const avatar :string = res.picture || null;
        const user:any = {userId : Number(res.userId), role:res.role, email:res.email, name: res.name, picture: res.picture};
        console.log("accesstoken: "+accessToken);
        console.log("refreshtoken: "+refreshToken);
        if(accessToken && refreshToken && user){
          this.userstorageService.saveAccessToken(accessToken);
          this.userstorageService.saveRefreshToken(refreshToken);
          this.userstorageService.saveUser(user);
          
          return res;
        }
        return "có lỗi rồi bạn ơi";

      }

      )
    );

  }

  forgotPassword(email:string):Observable<any>{
    return this.http.post(BASIC_URL+'reset/forgot-password',email);
  }

  resetPassword(token:string, newPassword:string):Observable<any>{
    return this.http.post(BASIC_URL+'reset/reset-password',{token, newPassword});
  }
  
  validateToken(token:string):Observable<any>{
    return this.http.post(BASIC_URL+'reset/validate-reset-token',token);
  }

  refreshToken():Observable<any>{
    
    return this.http.post(BASIC_URL+'reset/refresh-token',{refreshToken: UserstorageService.getRefreshToken()}).pipe(
      tap((res:any)=>{
        console.log('accessToken moi:', res.accessToken);
        this.userstorageService.saveAccessToken(res.accessToken);
        //this.accessTokenSubject.next(res.accessToken);
      }),
      catchError(err=>{
        UserstorageService.signOut();
        console.log("refresh token het han roi hoac sai roi ban oi");
        return throwError(()=> err);
      })
    );
  }
  
  getUserById(id:number):Observable<any>{
    return  this.http.get(BASIC_URL+`user/${id}`);
  }

}
