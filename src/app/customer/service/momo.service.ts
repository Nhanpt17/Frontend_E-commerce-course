import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MomoService {

  private BASIC_URL = environment.BASIC_URL;
  
  constructor(private http: HttpClient) { }
  createPayment(amount:string,systemOrderId:number){
    return this.http.post(this.BASIC_URL+`api/momo/create?amount=${amount}&systemOrderId=${systemOrderId}`,{});
  }
  
  handleAfterPayment(resultCode:number,systemOrderId:number,momoTransactionId:string){
    return this.http.post(this.BASIC_URL+`api/momo/handle/after-payment?resultCode=${resultCode}&systemOrderId=${systemOrderId}&momoTransactionId=${momoTransactionId}`,{});

  }

}
