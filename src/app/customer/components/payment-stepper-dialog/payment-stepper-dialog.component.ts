import { Router } from '@angular/router';
import { MomoService } from './../../service/momo.service';
import { OrderService } from './../../service/order.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoongService } from '../../service/goong.service';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';



@Component({
  selector: 'app-payment-stepper-dialog',
  templateUrl: './payment-stepper-dialog.component.html',
  styleUrls: ['./payment-stepper-dialog.component.css']
})
export class PaymentStepperDialogComponent implements OnInit {
  // Dữ liệu các bước
  phoneNumber: string = '';
  address: string = '';
  paymentMethod: string = '';
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;


// Biến cho Goong autocomplete
  predictions: any[] = [];
  isLoadingAddress = false;
  selectedPlace: any = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<PaymentStepperDialogComponent>,
    private _formBuilder: FormBuilder,
    private orderService: OrderService,
    private snackbar:MatSnackBar,
    private momoService:MomoService,
    private router:Router,
    private goongService: GoongService
  ) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      phone: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      address: ['', Validators.required],
    });
    this.thirdFormGroup = this._formBuilder.group({
      payment: ['', Validators.required],
    });


     // Lắng nghe thay đổi của địa chỉ để gợi ý
    this.setupAddressAutocomplete();

  }

  // Đóng dialog
  closeDialog(): void {
    this.dialogRef.close();
  }

  // Xử lý lưu thông tin sau khi điền xong
  onSave(): void {
    const orderInfo = {
      phoneNumber: this.phoneNumber,
      address: this.address,
      paymentMethod: this.paymentMethod
    };
    // Lưu hoặc gửi thông tin order đến server
    
    this.dialogRef.close(orderInfo);
  }






  submit() {
    // Kiểm tra từng form
    if (
      this.firstFormGroup.invalid ||
      this.secondFormGroup.invalid ||
      this.thirdFormGroup.invalid
    ) {
      // Đánh dấu tất cả các control là "touched" để hiển thị lỗi
      this.firstFormGroup.markAllAsTouched();
      this.secondFormGroup.markAllAsTouched();
      this.thirdFormGroup.markAllAsTouched();
      return;
    }

    // Nếu hợp lệ thì xử lý submit
    const orderData = {
      customerId: this.data.customerId,
      customerName: this.data.customerName,
      customerEmail: this.data.customerEmail,
      cartItems: this.data.cartItems,
      totalPrice: this.data.totalPrice,
      shippingFee: this.data.shippingFee,
      discountAmount: this.data.discountAmount,
      finalAmount: this.data.finalAmount,
      phone: this.firstFormGroup.value.phone,
      address: this.secondFormGroup.value.address,
      payment: this.thirdFormGroup.value.payment
    };
    console.log('Thông tin giao hàng:', orderData);

    if (this.thirdFormGroup.value.payment == 'cash') {
      this.orderService.createOrder(orderData).subscribe({
        next: (res)=>{
          
          this.dialogRef.close({ success: true, order: res });
          this.snackbar.open('Đặt hàng thành công!','Đóng',{duration:2000});
          this.router.navigate(['/customer/order-history']);
        },
        error:(err)=>{
          console.error('Lỗi khi đặt hàng', err);
          this.dialogRef.close({ success: false, err });
        }
      });
    }else if(this.thirdFormGroup.value.payment == 'momo'){
      // 1. Tạo đơn hàng trạng thái PENDING trước
  this.orderService.createOrder(orderData).subscribe({
    next: (orderRes) => {
      
      // 2. Gọi API thanh toán Momo với orderId từ đơn hàng vừa tạo
      const amount = String(orderRes.finalAmount); // Chuyển sang đơn vị VND (nếu cần)
      this.momoService.createPayment(amount, orderRes.id).subscribe({
        next: (momoRes :any) => {
          if (momoRes && momoRes.payUrl ) {

            
            // 3. Chuyển hướng đến Momo

            window.location.href = momoRes.payUrl;
          }
        },
        error: (momoErr) => {
          const errorMessage = momoErr.error.message || 'Có lỗi xảy ra!';
          this.snackbar.open(errorMessage,'Đóng',{duration:1000});
         
          this.dialogRef.close({ success: false, err: momoErr });
        }
      });
    },
    error: (orderErr) => {
      const errorMessage = orderErr.error.message || 'Có lỗi xảy ra!';
      this.snackbar.open(errorMessage,'Đóng',{duration:1000});
      this.dialogRef.close({ success: false, err: orderErr });
    }
  });
    }

    // this.dialogRef.close(orderData);
    // Gửi dữ liệu, đóng dialog, v.v...
  }



  


   setupAddressAutocomplete() {
    this.secondFormGroup.get('address')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (value && typeof value === 'string' && value.length > 2) {
          this.isLoadingAddress = true;
          return this.goongService.autocomplete(value);
        }
        this.predictions = [];
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isLoadingAddress = false;
        if (response && response.predictions) {
          this.predictions = response.predictions;
        } else {
          this.predictions = [];
        }
      },
      error: (error) => {
        this.isLoadingAddress = false;
        console.error('Lỗi khi gọi API Goong:', error);
        this.predictions = [];
      }
    });
  }


  // Khi user chọn một địa chỉ từ danh sách gợi ý
  selectAddress(prediction: any) {
    this.secondFormGroup.patchValue({
      address: prediction.description
    });
    
    // Lấy chi tiết địa điểm để có tọa độ (nếu cần)
    this.goongService.getPlaceDetail(prediction.place_id).subscribe({
      next: (response) => {
        if (response && response.result) {
          this.selectedPlace = {
            ...response.result,
            description: prediction.description,
            placeId: prediction.place_id
          };
          console.log('Chi tiết địa điểm:', this.selectedPlace);
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy chi tiết địa điểm:', error);
      }
    });
    
    this.predictions = [];
  }


   // Hiển thị text cho autocomplete
  displayAddress(value: any): string {
    return value && typeof value === 'object' ? value.description : value;
  }

}
