import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  constructor(private http: HttpClient) { }

  usdRate = 25000;
  private apiUrl = 'https://open.er-api.com/v6/latest/USD';
  private cacheKey = 'usdRateCache';

  async getUsdRate(): Promise<number> {
    const cached = localStorage.getItem(this.cacheKey);

    if (cached) {
      const { rate, timestamp } = JSON.parse(cached);
      const oneDay = 24 * 60 * 60 * 1000;

      // nếu cache chưa quá 1 ngày thì dùng luôn
      if (Date.now() - timestamp < oneDay) {
        console.log('💾 Dùng cache:', rate);
        this.usdRate = rate;
        return rate;
      }
    }

    try {
      const response: any = await firstValueFrom(this.http.get(this.apiUrl));
      const newRate = response?.rates?.VND ?? 25000;

      // lưu cache kèm thời gian
      localStorage.setItem(
        this.cacheKey,
        JSON.stringify({ rate: newRate, timestamp: Date.now() })
      );

      console.log('🌐 Cập nhật tỷ giá mới:', newRate);
      this.usdRate = newRate;
      return newRate;
    } catch (error) {
      console.error('⚠️ Lỗi khi lấy tỷ giá, dùng fallback:', error);
      return this.usdRate;
    }
  }
}
