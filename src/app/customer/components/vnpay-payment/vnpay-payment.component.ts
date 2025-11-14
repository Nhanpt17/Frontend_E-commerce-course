import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { GoongService } from '../../service/goong.service';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-vnpay-payment',
  templateUrl: './vnpay-payment.component.html',
  styleUrls: ['./vnpay-payment.component.css']
})
export class VnpayPaymentComponent implements OnInit {

  loading = false;
  vnpayForm: FormGroup;
  private vnpayApiUrl = environment.BASIC_URL + 'api/vnpay/create-payment'; // Endpoint Backend Spring Boot của bạn

  // ========== THÊM CÁC BIẾN CHO GOONG AUTOCOMPLETE ==========
  predictions: any[] = [];              // Danh sách địa chỉ gợi ý
  isLoadingAddress = false;             // Trạng thái loading khi tìm kiếm
  selectedPlace: any = null;            // Địa điểm đã chọn (có tọa độ)


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<VnpayPaymentComponent>,
    private goongService: GoongService
  ) {
    this.vnpayForm = this.fb.group({
      bankCode: ['default' as string, Validators.required], // Mặc định là '' (chọn tại VNPAY)
      language: ['vn' as string, Validators.required], // Mặc định 'vn',
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9,11}$')]],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Nếu bạn muốn có logic khởi tạo
    this.setupAddressAutocomplete();
  }

  submitVnpayPayment() {

  
    if (this.vnpayForm.invalid || this.totalPrice <= 0) {
      this.snackbar.open('Vui lòng kiểm tra giỏ hàng và chọn phương thức thanh toán và nhập thông tin!', 'Đóng', { duration: 3000 });
      return;
    }

    this.loading = true;

    const formValue = this.vnpayForm.value;

    const requestData = {
      customerId: this.customerId,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      cartItems: this.cartItems,
      totalPrice: this.totalPrice,
      shippingFee: this.shippingFee,
      discountAmount: this.discountAmount,
      finalAmount: this.finalAmount,
      bankCode: formValue.bankCode == 'default'? "" : formValue.bankCode,
      language: formValue.language,
      vnpOrderInfo:'thanh toan don hang thuc uong',
      orderType:'billpayment',
      amount:this.finalAmount,
      txtInvMobile: formValue.phone,
      txtInvAddr1: formValue.address,
      phone: formValue.phone,
      address: formValue.address,
      payment:'vnpay',
      vnp_Inv_Customer: this.customerName,
      vnp_Inv_Email: this.customerEmail,
      vnpBillMobile:formValue.phone,
      vnpBillEmail:this.customerEmail
    };

    console.log('VNPAY API URL:', this.vnpayApiUrl);

    // Gửi POST Request đến Spring Boot Backend
    this.http.post<{ code: string, data: string, Message?: string }>(this.vnpayApiUrl, requestData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.code === '00') {
            // Logic chuyển hướng/mở Popup
            this.handleVnpayRedirect(response.data);
          } else {
            this.snackbar.open(`Lỗi tạo URL VNPAY: ${response.Message}`, 'Đóng', { duration: 4000 });
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Lỗi kết nối API VNPAY:', err);
          this.snackbar.open('Không thể kết nối đến máy chủ thanh toán!', 'Đóng', { duration: 4000 });
        }
      });
  }

  handleVnpayRedirect(vnpayUrl: string) {
    this.dialogRef.close();
    // Logic mở Popup VNPAY hoặc chuyển hướng
    // Bạn cần tìm cách load vnpay.min.js của VNPAY trong Angular
    if ((window as any).vnpay) {
      (window as any).vnpay.open({ width: 768, height: 600, url: vnpayUrl });
    } else {
      window.location.href = vnpayUrl;
    }
  }

  onConfirm(): void {
    if (this.vnpayForm.valid) {
      this.dialogRef.close(this.vnpayForm.value); // trả phone + address về
    }
  }

  onCancel(): void {
    this.dialogRef.close(null); // user bấm hủy
  }

  get customerId() { return this.data?.customerId ?? ''; }
  get customerName() { return this.data?.customerName ?? ''; }
  get customerEmail() { return this.data?.customerEmail ?? ''; }

  get cartItems() { return this.data?.cartItems ?? ''; }
  get totalPrice() { return this.data?.totalPrice ?? 0; }
  get shippingFee() { return this.data?.shippingFee ?? 0; }
  get discountAmount() { return this.data?.discountAmount ?? 0; }
  get finalAmount() { return this.data?.finalAmount ?? 0; }


  // ========== HÀM SETUP GOONG AUTOCOMPLETE ==========
  setupAddressAutocomplete() {
    // Lắng nghe sự thay đổi của ô địa chỉ
    this.vnpayForm.get('address')?.valueChanges.pipe(
      debounceTime(300),           // Đợi 300ms sau khi user ngừng gõ
      distinctUntilChanged(),      // Chỉ gọi API khi giá trị thay đổi
      switchMap(value => {
        // Kiểm tra điều kiện gọi API
        if (value && typeof value === 'string' && value.length > 2) {
          this.isLoadingAddress = true;                    // Bật loading
          return this.goongService.autocomplete(value);    // Gọi API Goong
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

  // ========== HÀM XỬ LÝ KHI USER CHỌN ĐỊA CHỈ TỪ DROPDOWN ==========
  selectAddress(prediction: any) {
    // Điền địa chỉ vào form
    this.vnpayForm.patchValue({
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
