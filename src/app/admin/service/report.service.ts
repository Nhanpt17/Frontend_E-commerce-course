import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private BASIC_URL = environment.BASIC_URL;
  constructor(private http: HttpClient) { }

  
  getRevenueReport(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(this.BASIC_URL+`api/admin/reports/revenue`, { params });
  }
}
