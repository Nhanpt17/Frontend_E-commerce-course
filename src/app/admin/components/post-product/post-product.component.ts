import { AdminService } from './../../service/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-product',
  templateUrl: './post-product.component.html',
  styleUrls: ['./post-product.component.css']
})
export class PostProductComponent implements OnInit {
  productForm !: FormGroup
  categories: any = [];
  selectedFile!: File | null;
  imagePreview!: string | ArrayBuffer | null;
  imageUrl: string = '';  // Lưu URL ảnh từ Cloudinary
  uploading: boolean = false; // trạng thái đang upload
  

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackbar: MatSnackBar,
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      categoryId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(1000)]],
      stock: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
      description: ['']
    });

    this.getAllCategories();
  }

  previewImage() {
    if (!this.selectedFile) {
      return; // Nếu không có file nào được chọn, thoát luôn
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result; // gan du lieu cho anh
    }
    reader.readAsDataURL(this.selectedFile);
  }

  onFileSelected(event: any) {
     this.selectedFile = event.target.files[0]; // lay file dau tien
     this.previewImage();
     if(this.selectedFile){
     
      this.uploadImage(this.selectedFile);
     }
    
  }


  uploadImage(file :File){
    this.uploading = true;

    const formData = new FormData();
    formData.append('file', file);
    this.adminService.uploadImage(formData).subscribe({
      next: (response) => {
        this.imageUrl = response.url;  // Lấy URL từ object response
        
        this.uploading = false;
      },
      error: (error) => {
        console.error('Lỗi upload ảnh: ', error);
        this.uploading = false;
      }
    });
  }


  getAllCategories(): void {

    this.adminService.getAllCategories().subscribe(res => {

      this.categories = res;
    })
  }

  addProduct(): void {
    if (this.productForm.valid) {


      if(this.uploading){
        this.snackbar.open('Ảnh đang được tải lên, vui lòng chờ trong giây lát...', 'Đóng', {
          duration: 3000,
          panelClass: ['warning-snackbar'] // Thêm class CSS tùy chỉnh nếu cần
        });
        return;
      }

      const productData = {
        imgUrl: this.imageUrl, // link ảnh đã upload lên Cloudinary
        categoryId: this.productForm.get('categoryId')?.value,
        name: this.productForm.get('name')?.value,
        description: this.productForm.get('description')?.value,
        price: this.productForm.get('price')?.value,
        stock: this.productForm.get('stock')?.value
      };


      this.adminService.addProduct(productData).subscribe({

        next: () => {
          this.snackbar.open('Thêm sản phẩm thành công!', 'Đóng', { duration: 3000 });
          this.router.navigate(['admin/dashboard'])
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Có lỗi xảy ra khi thêm sản phẩm!';
          this.snackbar.open(errorMessage, 'Đóng', { duration: 3000, panelClass: 'error-snackbar' });
        }

      });

    }
    
  }


}
