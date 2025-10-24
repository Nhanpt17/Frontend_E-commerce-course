import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Voucher } from 'src/app/models/voucher.model';
import { VoucherService } from 'src/app/services/voucher/voucher.service';
import { VoucherFormDialogComponent } from 'src/app/shared/dialogs/voucher-form-dialog/voucher-form-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-voucher-management',
  templateUrl: './voucher-management.component.html',
  styleUrls: ['./voucher-management.component.css']
})
export class VoucherManagementComponent implements OnInit{
  displayedColumns: string[] = ['code', 'description', 'discount', 'dates', 'usage', 'status', 'actions'];
  dataSource = new MatTableDataSource<Voucher>();

  constructor(
    private voucherService: VoucherService,
    private dialog: MatDialog,
    private snackBar:MatSnackBar
  ) {}

  ngOnInit(): void {
     this.loadVouchers();
  }

  loadVouchers(): void {
    this.voucherService.getAllVouchers().subscribe(vouchers => {
      this.dataSource.data = vouchers;
      
    });
  }

  isVoucherActive(voucher: Voucher): boolean {
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);
    return now >= startDate && now <= endDate;
  }

  openAddDialog(): void {
    
    const dialogRef = this.dialog.open(VoucherFormDialogComponent, {
      width: '600px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        
        this.loadVouchers();
        this.snackBar.open('Tạo voucher thành công', 'Close', { duration: 2000 })

      }
    });
  }

  openEditDialog(voucher: Voucher): void {
    const dialogRef = this.dialog.open(VoucherFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', voucher }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
       
        this.loadVouchers();
        this.snackBar.open('Cập nhật voucher thành công', 'Close', { duration: 2000 })

        
      }
    });
  }

  deleteVoucher(id: number): void {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: 'Bạn có chắc chắn muốn xóa voucher này?'
      }
      });

      confirmDialog.afterClosed().subscribe(result => {
        if (result) {
          this.voucherService.deleteVoucher(id).subscribe(() => {
            this.loadVouchers();
          });
        }
      });
  }

  toggleStatus(voucher: Voucher): void {
    const updatedVoucher = { ...voucher, active: !voucher.active };
    this.voucherService.updateVoucher(voucher.id, updatedVoucher).subscribe(() => {
      this.loadVouchers();
    });
  }

}
