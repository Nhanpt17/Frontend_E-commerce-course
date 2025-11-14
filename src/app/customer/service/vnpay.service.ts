import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VnpayService {

 private BASIC_URL = environment.BASIC_URL;
   
   constructor(private http: HttpClient) { }
   createPayment(amount:string,systemOrderId:number){
     return this.http.post(this.BASIC_URL+`api/momo/create?amount=${amount}&systemOrderId=${systemOrderId}`,{});
   }
   
   handleAfterPayment(resultCode:number,systemOrderId:number,momoTransactionId:string){
     return this.http.post(this.BASIC_URL+`api/momo/handle/after-payment?resultCode=${resultCode}&systemOrderId=${systemOrderId}&momoTransactionId=${momoTransactionId}`,{});
 
   }

    handleVnpayIpn(fullUrl: string): Observable<string> {
    // Just send the full URL with all query params intact
    return this.http.post<string>(this.BASIC_URL+`api/vnpay/vnpay-ipn${fullUrl}`, null, {
      responseType: 'text' as 'json'
    });
  }

}
