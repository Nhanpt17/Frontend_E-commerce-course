import { MatSnackBar } from '@angular/material/snack-bar';
import { Voucher } from './../../../models/voucher.model';
import { VoucherService } from './../../../services/voucher/voucher.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
//import { Voucher } from 'src/app/models/voucher.model';

@Component({
  selector: 'app-voucher-form-dialog',
  templateUrl: './voucher-form-dialog.component.html',
  styleUrls: ['./voucher-form-dialog.component.css']
})
export class VoucherFormDialogComponent implements OnInit {

  voucherForm!: FormGroup;
  isEditMode = false;
  discountTypes = [
    { value: 'PERCENTAGE', display: 'Phần trăm (%)' },
    { value: 'SHIPPING_PERCENTAGE', display: 'Phí vận chuyển - Phần trăm (%)' },
    { value: 'FIXED_AMOUNT', display: 'Số tiền cố định' }
  ];
  voucherTypes = [
    { value: true, display: 'Public (Đổi bằng điểm)' },
    { value: false, display: 'Private (Dùng mã trực tiếp)' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private voucherService: VoucherService,
    public dialogRef: MatDialogRef<VoucherFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; voucher?: Voucher }
  ) {
    this.isEditMode = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initForm();

    if (this.isEditMode && this.data.voucher) {
      this.patchFormWithVoucherData(this.data.voucher);
    }
  }

  initForm(): void {

    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());


    this.voucherForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      description: ['', Validators.maxLength(200)],
      discountType: ['PERCENTAGE', Validators.required],
      discountValue: [0, [Validators.required, Validators.min(1)]],
      minimumOrderValue: [0, Validators.min(0)],
      startDate: [today, Validators.required],
      endDate: [nextMonth, Validators.required],
      maxUsage: [null],
      active: [true],
      public: [false, Validators.required],
      pointsRequired: [0, [Validators.min(0)]]
    });

    // Thêm validation cho giá trị giảm giá

    this.voucherForm.get('discountType')!.valueChanges.subscribe(type => {
      const discountValueControl = this.voucherForm.get('discountValue');
      if (discountValueControl) {
        if (type === 'PERCENTAGE'||type === 'SHIPPING_PERCENTAGE') {
          discountValueControl.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(100)
          ]);
        } else {
          discountValueControl.setValidators([
            Validators.required,
            Validators.min(1)
          ]);
        }
        discountValueControl.updateValueAndValidity();
      }


    });

    // Thêm validation cho điểm yêu cầu
    this.voucherForm.get('public')!.valueChanges.subscribe(isPublic => {
      const pointsControl = this.voucherForm.get('pointsRequired');
      if (pointsControl) {

        if (isPublic) {
          pointsControl.setValidators([Validators.required, Validators.min(1)]);
        } else {
          pointsControl.setValidators([Validators.min(0)]);
        }
        pointsControl.updateValueAndValidity();
      }

    });
  }


  patchFormWithVoucherData(voucher: Voucher): void {
    this.voucherForm.patchValue({
      code: voucher.code,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minimumOrderValue: voucher.minimumOrderValue,
      startDate: new Date(voucher.startDate),
      endDate: new Date(voucher.endDate),
      maxUsage: voucher.maxUsage,
      active: voucher.active,
      public: voucher.public,
      pointsRequired: voucher.pointsRequired
    });
  }

  onSubmit(): void {
    if (this.voucherForm.invalid) {
      return;
    }

    const formValue = this.voucherForm.value;

    const startDate = new Date(formValue.startDate);
    const endDate = new Date(formValue.endDate);

    if (startDate > endDate) {
      this.snackBar.open('Ngày bắt đầu phải trước ngày kết thúc', 'Close', { duration: 3000 });
      return;
    }

    const voucherData: Voucher = {
      ...formValue,
      startDate: this.formatLocalDate(formValue.startDate),
      endDate: this.formatLocalDate(formValue.endDate),
      currentUsage: this.isEditMode ? this.data.voucher?.currentUsage : 0
    };

    if (this.isEditMode) {
      this.voucherService.updateVoucher(Number(this.data.voucher?.id), voucherData).subscribe({
        next: () => {
         
          this.dialogRef.close(true);

        },
        error: (err) => {
         
          const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 })

        },
      });
    }
    else {
      this.voucherService.createVoucher(voucherData).subscribe({
        next: () => {
          this.dialogRef.close(true);

        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
          this.snackBar.open(errorMessage, 'Close', { duration: 3000 })

        },
      });
    }


    
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private padZero(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }


}



