import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Point, Voucher } from 'src/app/models/voucher.model';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';
import { VoucherService } from 'src/app/services/voucher/voucher.service';
import { RedeemVoucherComponent } from 'src/app/shared/dialogs/redeem-voucher/redeem-voucher.component';

@Component({
  selector: 'app-voucher-center',
  templateUrl: './voucher-center.component.html',
  styleUrls: ['./voucher-center.component.css']
})
export class VoucherCenterComponent implements OnInit{
  publicVouchers: Voucher[] = [];
  myVouchers: Voucher[] = [];
  customerPoints: Point | null = null;
  customerId = Number(UserstorageService.getUserId());

  isLoading = false;
  error: string | null = null;

  constructor(
    private voucherService: VoucherService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
     this.loadData();
  }

  loadData(): void {
    this.voucherService.getPublicVouchers().subscribe({
      next: (vouchers) => {
        this.publicVouchers = vouchers;
        this.isLoading = false;
      },
      error: (err) => {
       
        this.error = 'Không thể tải phiếu giảm giá khả dụng. Vui lòng thử lại sau.';
        this.isLoading = false;
        this.showErrorSnackbar(this.error);
      }
    });

    this.voucherService.getCustomerVouchers(this.customerId).subscribe({
      next: (vouchers) => {
        this.myVouchers = vouchers;
      },
      error: (err) => {
       
        this.showErrorSnackbar('Không thể tải phiếu giảm giá của bạn. Vui lòng thử lại sau.');
      }
    });

    this.voucherService.getCustomerPoints(this.customerId).subscribe({
      next: (points) => {
        this.customerPoints = points;
      },
      error: (err) => {
       
        this.showErrorSnackbar('Không thể tải số dư điểm của bạn.');
      }
    });
  }

  openRedeemDialog(voucher: Voucher): void {
    const dialogRef = this.dialog.open(RedeemVoucherComponent, {
      width: '500px',
      data: { 
        voucher,
        customerPoints: this.customerPoints
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.showSuccessSnackbar('Đổi phiếu giảm giá thành công!!');
        this.loadData();
      }
    });
  }
  
  private showSuccessSnackbar(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

}
