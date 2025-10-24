import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Review } from 'src/app/models/review.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private BASE_URL = environment.BASIC_URL;
  constructor(private http:HttpClient) { }
  createReview(review: Review): Observable<Review> {
    return this.http.post<Review>(this.BASE_URL+'api/customer/reviews', review);
  }


  getProductReviews(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}api/customer/reviews/product/${productId}`);
  }

  getLimitProductReviews(productId: number,limit: number): Observable<any[]> {
    const params = {
      productId: productId,
      limit: limit
    };

    return this.http.get<any[]>(`${this.BASE_URL}api/customer/reviews/limit-product`,
      {params}
    );
  }

  getProductReviewStats(productId: number): Observable<{averageRating: number, reviewCount: number}> {
    return this.http.get<{averageRating: number, reviewCount: number}>(`${this.BASE_URL}api/customer/reviews/product/${productId}/stats`);
  }
}
