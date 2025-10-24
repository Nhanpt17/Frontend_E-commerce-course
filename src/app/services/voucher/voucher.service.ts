import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Voucher, CustomerVoucher,Point } from 'src/app/models/voucher.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private BASIC_URL = environment.BASIC_URL;
  private adminApiUrl ='api/admin/vouchers';
  private customerApiUrl ='api/customer/vouchers';

  constructor(private http:HttpClient) { }

  // Admin functions
  createVoucher(voucher: Voucher): Observable<Voucher> {
    return this.http.post<Voucher>(this.BASIC_URL+ this.adminApiUrl, voucher);
  }

  updateVoucher(id: number, voucher: Voucher): Observable<Voucher> {
    return this.http.put<Voucher>(this.BASIC_URL+ this.adminApiUrl+`/${id}`, voucher);
  }

  deleteVoucher(id: number): Observable<void> {
    return this.http.delete<void>(this.BASIC_URL+ this.adminApiUrl+`/${id}`);
  }

  getAllVouchers(): Observable<Voucher[]> {
    return this.http.get<Voucher[]>(this.BASIC_URL+ this.adminApiUrl);
  }

  // Customer functions
  getPublicVouchers(): Observable<Voucher[]> {
    return this.http.get<Voucher[]>(this.BASIC_URL+ this.customerApiUrl+"/public");
  }

  getCustomerVouchers(customerId: number): Observable<Voucher[]> {
    return this.http.get<Voucher[]>(this.BASIC_URL+ this.customerApiUrl+`/my-vouchers?customerId=${customerId}`);
  }

 

  redeemWithPoints(customerId: number, voucherId: number, pointsRequired: number): Observable<Point> {
    return this.http.post<Point>(this.BASIC_URL+ this.customerApiUrl+
      `/redeem-with-points?customerId=${customerId}&voucherId=${voucherId}&pointsRequired=${pointsRequired}`,
      {}
    );
  }

  getCustomerPoints(customerId: number): Observable<Point> {
    return this.http.get<Point>(this.BASIC_URL+ this.customerApiUrl+`/points?customerId=${customerId}`);
  }

   // Áp dụng voucher private (nhập mã)
   applyVoucher(code: string, totalPrice: number, shippingFee: number) {
    return this.http.post<any>(this.BASIC_URL+'vouchers/apply', {
      code,
      totalPrice,
      shippingFee
    });
  }

  // Áp dụng voucher public (đã đổi bằng điểm)
  applyCustomerVoucher(customerId:number,voucherId: number, totalPrice: number, shippingFee: number) {
    
    return this.http.post<any>(this.BASIC_URL+ this.customerApiUrl+'/customer-voucher-apply', {
      customerId,
      voucherId,
      totalPrice,
      shippingFee
    });
  }

  // Lấy danh sách voucher public mà user đã đổi
  getCustomerAvailableVouchers(customerId:number) {
    
    return this.http.get<any[]>(this.BASIC_URL+ this.customerApiUrl+`/customer-vouchers/${customerId}/available`);
  }

  
  markCustomerVoucherAsUsed(customerId:number,voucherId:number) {
    
    return this.http.post<any>(this.BASIC_URL+ this.customerApiUrl+`/mark-used?customerId=${customerId}&voucherId=${voucherId}`,null);
  }
 
  incrementVoucherUsage(voucherCode:string) {
    
    return this.http.post<any>(this.BASIC_URL+ this.customerApiUrl+`/increment-voucher/${voucherCode}`,null);
  }
  
}
