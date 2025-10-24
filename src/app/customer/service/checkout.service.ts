import { Injectable } from '@angular/core';
import { PaymentStepperDialogComponent } from '../components/payment-stepper-dialog/payment-stepper-dialog.component';
import { CartService } from 'src/app/services/cart/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    private dialog: MatDialog,
    private cartService: CartService
  ) {}

  openStepperDialog() {
    const cartItems = this.cartService.getCart();
    const totalPrice = this.cartService.getTotalPrice();
     // Sửa: Thêm kiểm tra null và giá trị mặc định
    const shippingFee = localStorage.getItem('shippingFee') ? JSON.parse(localStorage.getItem('shippingFee')!) : 0;
    const discountAmount = localStorage.getItem('discountAmount') ? JSON.parse(localStorage.getItem('discountAmount')!) : 0;
    const finalAmount = localStorage.getItem('finalAmount') ? JSON.parse(localStorage.getItem('finalAmount')!) : 0;
    const customerId = UserstorageService.getUserId();
    const customerName = UserstorageService.getUserName();
    const customerEmail = UserstorageService.getUserEmail();

    const dialogRef = this.dialog.open(PaymentStepperDialogComponent, {
      width: '500px',
      data: {
        customerId: customerId,
        customerName:customerName,
        customerEmail:customerEmail,
        cartItems: cartItems,
        totalPrice: totalPrice,
        shippingFee: shippingFee,
        discountAmount: discountAmount,
        finalAmount: finalAmount
      }
    });

    // Xóa các giá trị đã lưu sau khi sử dụng
    localStorage.removeItem('shippingFee');
    localStorage.removeItem('discountAmount');
    localStorage.removeItem('finalAmount');
    return dialogRef.afterClosed();
  }


  

}
