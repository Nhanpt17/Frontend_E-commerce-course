import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private BASE_URL = environment.BASIC_URL;

  constructor(private http: HttpClient) { }

  getDeliveryStaff(): Observable<any[]> {
    return this.http.get<any[]>(this.BASE_URL+'api/staff/delivery');
  }
}
