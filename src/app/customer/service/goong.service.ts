import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoongService {

   private baseUrl = 'https://rsapi.goong.io';

  constructor(private http: HttpClient) {}

  // Autocomplete - gợi ý địa chỉ
  autocomplete(input: string, location?: string): Observable<any> {
    const params: any = {
      api_key: environment.goongApiKey,
      input: input
    };
    
    if (location) {
      params.location = location;
    }

    return this.http.get(`${this.baseUrl}/Place/AutoComplete`, { params });
  }

  // Place Detail - lấy chi tiết địa điểm
  getPlaceDetail(placeId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/Place/Detail`, {
      params: {
        api_key: environment.goongApiKey,
        place_id: placeId
      }
    });
  }

  // Geocoding - chuyển địa chỉ thành tọa độ
  geocode(address: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/Geocode`, {
      params: {
        api_key: environment.goongApiKey,
        address: address
      }
    });
  }
}
