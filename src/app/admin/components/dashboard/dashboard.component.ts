import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from './../../service/admin.service';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit,AfterViewInit{

  displayedColumns: string[] = ['stt','image', 'name', 'description', 'price','stock', 'category', 'actions'];
  products: any =[];
  dataSource = new MatTableDataSource<any>(this.products);
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 20];
  length = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private adminService: AdminService, private snackBar :MatSnackBar, private dialog: MatDialog){

  }
  ngOnInit(): void {
    this.getAllProducts();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }


  
  getDisplayedIndex(index: number): number {
    return index + 1 + (this.paginator?.pageIndex * this.paginator?.pageSize || 0);
  }

  handlePageEvent(event: any) {
    this.length = event.length;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  getAllProducts(): void {
    this.products = [];
    this.adminService.getAllProducts().subscribe(res => {
      if (Array.isArray(res)) {  // Kiểm tra res là mảng không
       
        this.products = res;
        this.dataSource.data = this.products;
        this.length = this.products.length; // Cập nhật tổng số items
      } else {
        
        this.snackBar.open('Lỗi khi tải dữ liệu sản phẩm', 'Đóng', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  
  getStockStatusClass(stock: number): string {
    if (stock <= 10) return 'stock-low';
    if (stock <= 50) return 'stock-medium';
    return 'stock-high';
  }

  getStockColor(stock: number): string {
    if (stock <= 10) return 'warn';
    if (stock <= 50) return 'accent';
    return 'primary';
  }

  getStockPercentage(stock: number): number {
    // Giả sử mức tồn kho tối đa là 200 để tính phần trăm
    return Math.min(stock, 200);
  }

  deleteProduct(productId:number):void{
    

    this.adminService.deleteProduct(productId).subscribe(res=>{
      if(res.status === 204){
        this.snackBar.open('Xóa sản phẩm thành công!','Đóng',{duration:3000});
        this.getAllProducts();
      }
      else{
        this.snackBar.open(res.message,'Đóng',{duration:3000, panelClass:'error-snackbar'});
      }
    });
  }
  

  openConfirmDialog(productId:number) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: { message: 'Bạn có chắc chắn muốn xóa không?' }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.deleteProduct(productId);
        }
      });
    }

}
