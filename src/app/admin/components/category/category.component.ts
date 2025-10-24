import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AdminService } from './../../service/admin.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CategoryDialogComponent } from 'src/app/shared/dialogs/category-dialog/category-dialog.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit{
 

  displayedColumns: string[] = ['stt', 'name', 'description',  'actions'];
  categories: any =[];

  constructor(private adminService:AdminService, private router:Router, private snackBar:MatSnackBar, private dialog:MatDialog){}
  ngOnInit(): void {
    this.getAllCategories();
  }

  openCategoryDialog(categoryId?: number): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      data: { categoryId: categoryId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllCategories();
        this.snackBar.open(
          categoryId ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công', 
          'Đóng', 
          { duration: 3000 }
        );
      }
    });
  }


  deleteCategory(categoryId:number){
    this.adminService.deleteCategory(categoryId).subscribe({
      
      next: (res) => {
        this.snackBar.open('Xóa danh mục thành công!', 'Đóng', { duration: 3000 });
        this.getAllCategories();
    },
      error: (err) => {
        const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
        this.snackBar.open(errorMessage, 'Đóng', { duration: 3000, panelClass: 'error-snackbar' });
    }

    });
  }

  getAllCategories(){
    this.adminService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res;
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
        this.snackBar.open(errorMessage, 'Đóng', { 
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  openConfirmDialog(categoryId:number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: 'Bạn có chắc chắn muốn xóa không?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCategory(categoryId);
      }
    });
  }


}
