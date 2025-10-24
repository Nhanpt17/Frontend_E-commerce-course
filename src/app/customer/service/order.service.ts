import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryCheckResponse, OrderStatusUpdateRequest } from 'src/app/models/order-status-update-request.model';
import { OrderStatus } from 'src/app/models/order-status.enum';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private BASIC_URL = environment.BASIC_URL;

  constructor(private http: HttpClient) { }

  createOrder(orderData:any):Observable<any>{
    return this.http.post(this.BASIC_URL+'api/customer/orders',orderData);
  }

  getOrdersByUser(userId: number): Observable<any> {
    return this.http.get<any>(this.BASIC_URL+`api/customer/orders/by-user/${userId}`);
  }

  cancelOrderByStaff(orderId: number): Observable<any> {
    return this.http.put(this.BASIC_URL+`api/staff/${orderId}/cancel-by-staff`,{})
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.http.put(this.BASIC_URL+`api/customer/orders/${orderId}/cancel`,{})
  }

  getAllOrdersForStaff(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.BASIC_URL+'api/staff',{params});
  }

  

  assignDeliveryStaff(orderId: number, staffId: number,deliveryId:number): Observable<any> {
    return this.http.put<any>(this.BASIC_URL+`api/staff/process/${staffId}/assign-delivery/${deliveryId}`,orderId);
  }

  checkInventory(orderId: number): Observable< InventoryCheckResponse > {
    return this.http.get< InventoryCheckResponse >(this.BASIC_URL+`api/staff/check-inventory/${orderId}`);
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<any> {
    const request: OrderStatusUpdateRequest = { status };
    return this.http.put<any>(this.BASIC_URL+`api/delivery/status/${orderId}`, request);
  }
  
  getOrdersByDeliveryStaff(staffId: number): Observable<any[]> {
    return this.http.get<any[]>(this.BASIC_URL+`api/delivery/${staffId}`);
  }
  
  getOrderById(orderId:number):Observable<any>{
    return this.http.get<any>(this.BASIC_URL+`api/order/${orderId}`)
  }

}
