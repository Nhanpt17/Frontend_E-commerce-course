import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { OrderService } from 'src/app/customer/service/order.service';
import { DeliveryAssignmentDialogComponent } from 'src/app/shared/delivery-assignment-dialog/delivery-assignment-dialog.component';
import { ConfirmCusDialogComponent } from 'src/app/shared/dialogs/confirm-cus-dialog/confirm-cus-dialog.component';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit{
  
  displayedColumns: string[] = ['id', 'customer', 'total', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  totalOrders = 0;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }


  

  ngOnInit(): void {
    this.loadOrders();
  }

  
  


 

  loadOrders(): void {

    this.isLoading = true;
    const params = {
      page: this.paginator?.pageIndex || 0,
      size: this.paginator?.pageSize || 10
    };

    this.orderService.getAllOrdersForStaff(params).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.content; // Tuỳ API trả về
        this.totalOrders = response.totalElements;
       
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Tải dữ liệu đơn hàng thất bại', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  refreshOrders(){
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = 10;
    }
    this.loadOrders();
  
   }

  onPageChange(event: any): void {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.loadOrders();
  }

  openCancelDialog(order: any): void {
    const dialogRef = this.dialog.open(ConfirmCusDialogComponent, {
      width: '500px',
      data: { title: "Hủy đơn hàng",
        message:'Bạn có chắc muốn hủy đơn hàng này?',
        showCancel: true,
        cancelText:"Hủy bỏ",
        confirmText:'Xác nhận hủy'
       }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.cancelOrderByStaff(order.id).subscribe({
          next: () => {
            this.snackBar.open('Đã hủy đơn hàng thành công', 'Đóng', { duration: 3000 });
            this.loadOrders(); // Tải lại danh sách sau khi hủy thành công

          },
          error: (err) => {
            
            this.snackBar.open('Lỗi khi hủy đơn hàng: ' + err.message, 'Đóng', { duration: 3000 });
            
          }
        });
      }
     
    });
  }

  OpenAssignDelivery(order: any): void {
    const dialogRef = this.dialog.open(DeliveryAssignmentDialogComponent, {
      width: '400px',
      data: { orderId: order.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOrders();
        this.snackBar.open("Phân công giao thành công",'Đóng',{duration:1000});
      }
      
    });
  }

  assignDelivery(order: any): void {
    this.orderService.checkInventory(order.id).subscribe({
      next: (result) => {
        if (result.available) {
          this.OpenAssignDelivery(order);
        } else {
          this.snackBar.open(result.message || 'Inventory not available', 'Close', { duration: 3000 });
        }
      },
      error: () => this.snackBar.open('Error checking inventory', 'Close', { duration: 3000 })
    });
  }

  getStatusText(status: string): string {
    const statusText: {[key: string]: string} = {
      'PENDING': 'Chờ xử lý',
      'PLACED': 'Đã đặt hàng',
      'DELIVERING': 'Đang giao hàng',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusText[status] || status;
  }
  
  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

}
