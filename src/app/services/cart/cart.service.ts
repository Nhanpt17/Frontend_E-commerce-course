import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
 
  private cart: any[] = [];
  private cartItemCount = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCount.asObservable();

  constructor(private snackbar:MatSnackBar) {}

  getCart(): any[] {
    return this.cart;
  }

  /** Thêm sản phẩm với số lượng truyền vào */
  addToCart2Para(product: any, quantity: number,type?:number) {
    let existingProduct = this.cart.find(item => item.id === product.id);
    let totalQuantity = existingProduct ? existingProduct.quantity + quantity : quantity;

    if (totalQuantity > product.stock) {
      
      this.snackbar.open(`Chỉ còn ${product.stock - (existingProduct?.quantity || 0)} sản phẩm trong kho.`,'Đóng',{duration:3000});

      return;
    }

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      this.cart.push({ ...product, quantity });
    }
    
    if(!type){  
      this.snackbar.open('Thêm sản phẩm vào giỏ hàng thành công!', 'Đóng', {
      duration: 3000, // 3 giây
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['custom-snackbar-success'] // tuỳ chọn CSS
    });}
  
    this.cartItemCount.next(this.cart.length);
  }

  /** Thêm mặc định 1 sản phẩm */
  addToCart(product: any) {
    let existingProduct = this.cart.find(item => item.id === product.id);

    if (existingProduct) {
      if (existingProduct.quantity + 1 > product.stock) {
       
        this.snackbar.open(`Bạn đã đạt số lượng tối đa: ${product.stock}`,'Đóng',{duration:3000});
        return;
      }
      existingProduct.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }

    this.cartItemCount.next(this.cart.length);
  }

  /** Giảm số lượng */
  decreaseQuantity(productId: number) {
    let item = this.cart.find(p => p.id === productId);
    if (item) {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      }
      this.cartItemCount.next(this.cart.length);
    }
  }

  /** Tăng số lượng (nếu không vượt stock) */
  increaseQuantity(productId: number) {
    let item = this.cart.find(p => p.id === productId);
    if (item) {
      if (item.quantity + 1 > item.stock) {
        
        this.snackbar.open(`Bạn đã thêm tối đa số lượng có trong kho: ${item.stock}`,'Đóng',{duration:3000})
        return;
      }
      item.quantity += 1;
    }
  }

  /** Xoá 1 sản phẩm */
  removeFromCart(productId: number) {
    this.cart = this.cart.filter(p => p.id !== productId);
    this.cartItemCount.next(this.cart.length);
  }

  /** Xoá toàn bộ giỏ */
  clearCart() {
    this.cart = [];
    this.cartItemCount.next(this.cart.length);
  }

  /** Tổng tiền */
  getTotalPrice(): number {
    return this.cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  /** Số mặt hàng khác nhau trong giỏ */
  getItemQuantity(): number {
    return this.cart.length;
  }

}
