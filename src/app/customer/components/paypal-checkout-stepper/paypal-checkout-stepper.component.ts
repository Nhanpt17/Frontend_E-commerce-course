import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { GoongService } from '../../service/goong.service';

@Component({
  selector: 'app-paypal-checkout-stepper',
  templateUrl: './paypal-checkout-stepper.component.html',
  styleUrls: ['./paypal-checkout-stepper.component.css']
})
export class PaypalCheckoutStepperComponent implements OnInit{
 infoForm: FormGroup;


 // ========== THÊM CÁC BIẾN MỚI CHO GOONG ==========
  predictions: any[] = [];              // Danh sách địa chỉ gợi ý
  isLoadingAddress = false;             // Trạng thái loading
  selectedPlace: any = null;            // Địa điểm đã chọn (có tọa độ)

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PaypalCheckoutStepperComponent>,
    private goongService: GoongService
  ) {
    this.infoForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9,11}$')]],
      address: ['', Validators.required]
    });
  }

  // ========== THÊM ngOnInit ĐỂ SETUP AUTOCOMPLETE ==========
  ngOnInit() {
    this.setupAddressAutocomplete();
  }

  onConfirm(): void {
    if (this.infoForm.valid) {
      
      this.dialogRef.close(this.infoForm.value); // trả phone + address về
    }
  }

  onCancel(): void {
    this.dialogRef.close(null); // user bấm hủy
  }


  // ========== HÀM SETUP AUTOCOMPLETE (GIỐNG NHƯ ĐÃ GIẢI THÍCH) ==========
  setupAddressAutocomplete() {
    // Lắng nghe người dùng gõ vào ô địa chỉ
    this.infoForm.get('address')?.valueChanges.pipe(
      debounceTime(300),           // Đợi 300ms sau khi user ngừng gõ
      distinctUntilChanged(),      // Chỉ gọi API khi giá trị thay đổi
      switchMap(value => {
        // Kiểm tra điều kiện gọi API
        if (value && typeof value === 'string' && value.length > 2) {
          this.isLoadingAddress = true;                    // Bật loading
          return this.goongService.autocomplete(value);    // Gọi API
        }
        // Nếu không đủ điều kiện → xóa gợi ý
        this.predictions = [];
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        this.isLoadingAddress = false;  // Tắt loading
        // Nếu có kết quả → lưu vào predictions
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

  // ========== HÀM XỬ LÝ KHI USER CHỌN ĐỊA CHỈ ==========
  selectAddress(prediction: any) {
    // Điền địa chỉ vào form
    this.infoForm.patchValue({
      address: prediction.description
    });

    // Gọi API lấy chi tiết (để có tọa độ)
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

    // Đóng dropdown
    this.predictions = [];
  }

}
