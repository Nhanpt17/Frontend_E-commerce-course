import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  getFourNewProduct() {
    throw new Error('Method not implemented.');
  }
  private BASIC_URL = environment.BASIC_URL;

  constructor(private http:HttpClient, private router:Router) { }

  getAllProducts():Observable<any>{
    return this.http.get(this.BASIC_URL+'api/products');
  }

  getProductById(productId:number):Observable<any>{
      return this.http.get(this.BASIC_URL+`api/products/${productId}`);
  }

   getAllCategories():Observable<any>{
      return this.http.get(this.BASIC_URL+'api/products/categories');
  }

  getProductByCategoryId(categoryId:number):Observable<any>{
    return this.http.get(this.BASIC_URL+`api/products/category/${categoryId}`);
  }

  getLimitProductByCategoryId(categoryId:number,limit:number):Observable<any>{
    return this.http.get(this.BASIC_URL+`api/products/category/limit/${categoryId}`);
  }


  viewProductDetails(productId:number, categoryId:number){
    this.router.navigate(['/product-detail',productId, categoryId]);
  
  }

  getFourNewProdct():Observable<any>{
    return this.http.get(this.BASIC_URL+'api/products/top/four');
  }

}
