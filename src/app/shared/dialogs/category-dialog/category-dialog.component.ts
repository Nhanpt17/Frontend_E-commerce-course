import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from 'src/app/admin/service/admin.service';

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.css']
})
export class CategoryDialogComponent implements OnInit{

  categoryForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]]
    });

    if (this.data && this.data.categoryId) {
      this.isEditMode = true;
      this.getCategoryById(this.data.categoryId);
    }
  }

  getCategoryById(categoryId: number) {
    this.adminService.getCategoryById(categoryId).subscribe(res => {
      this.categoryForm.patchValue({
        id: res.id,
        name: res.name,
        description: res.description
      });
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }

    const categoryData = this.categoryForm.value;

    if (this.isEditMode) {
      this.adminService.updateCategory(categoryData).subscribe({
        next: () => {
          this.snackBar.open('Cập nhật danh mục thành công!', 'Đóng', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Có lỗi xảy ra khi cập nhật!';
          this.snackBar.open(errorMessage, 'Đóng', { duration: 3000, panelClass: 'error-snackbar' });
        }
      });
    } else {
      this.adminService.addCategory(categoryData).subscribe({
        next: (res) => {
          if (res.id != null) {
            this.snackBar.open('Thêm danh mục thành công!', 'Đóng', { duration: 3000 });
            this.dialogRef.close(true);
          } else {
            this.snackBar.open(res.message, 'Đóng', { duration: 3000, panelClass: 'error-snackbar' });
          }
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Có lỗi xảy ra khi thêm mới!';
          this.snackBar.open(errorMessage, 'Đóng', { duration: 3000, panelClass: 'error-snackbar' });
        }
      });
    }
  }

}
