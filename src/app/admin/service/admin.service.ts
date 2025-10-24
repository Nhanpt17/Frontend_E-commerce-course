import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';
import { environment } from 'src/environments/environment';

const BASIC_URL = environment.BASIC_URL;

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http:HttpClient) { }

  


  addCategory(categoryDto:any):Observable<any>{
    return this.http.post(BASIC_URL+'api/admin/category',categoryDto);
  }
  
  getAllCategories():Observable<any>{
    return this.http.get(BASIC_URL+'api/admin/categories');
  }


  updateCategory(categoryDto:any):Observable<any>{
    return this.http.put(BASIC_URL+'api/admin/update-category',categoryDto);
  }

  deleteCategory(categoryId:number):Observable<any>{
    return this.http.delete(BASIC_URL+`api/admin/category/${categoryId}`,{
      observe: 'response' // <-- Quan trọng, để lấy status code
    });
  }

  uploadImage(file:any):Observable<any>{
    return this.http.post(BASIC_URL+'api/file-upload',file);
  }

  addProduct(productDto:any):Observable<any>{
    return this.http.post(BASIC_URL+'api/admin/product',productDto);
  }

  

  updateProduct(productId:number,productDto:any):Observable<any>{
    return this.http.put(BASIC_URL+`api/admin/update-product/${productId}`,productDto);
  }


  getAllProducts():Observable<any>{
    return this.http.get(BASIC_URL+'api/admin/products');
  }

  getProductById(productId:number):Observable<any>{
    return this.http.get(BASIC_URL+`api/admin/product/${productId}`);
  }


  deleteProduct(productId:number):Observable<any>{
    return this.http.delete(BASIC_URL+`api/admin/product/${productId}`,{
      observe: 'response' // <-- Quan trọng, để lấy status code
    });

    
  }

  getCategoryById(categoryId: number):Observable<any>{
    return this.http.get(BASIC_URL+`api/admin/category/${categoryId}`);
  }


  private createAuthorizationHeader():HttpHeaders{
    return new HttpHeaders().set(
      'Authorization','Bearer '+ UserstorageService.getAccessToken()
    );
  }

  private createRefreshTokenHeader():HttpHeaders{
    return new HttpHeaders().set(
      'Refresh-Token',UserstorageService.getAccessToken()||''
    );
  }

  private createHeader():HttpHeaders{
    return new HttpHeaders()
    .set('Authorization', 'Bearer ' + UserstorageService.getAccessToken())
    .set('Refresh-Token',UserstorageService.getAccessToken()||'');
    
  }

}
