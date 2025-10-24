import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../service/admin.service';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css']
})
export class UpdateProductComponent implements OnInit{

  productId!:string|null;

  productForm !: FormGroup
  categories : any=[];
  selectedFile!: File | null;
  imagePreview!: string | ArrayBuffer | null;
  imageUrl: string = ''; // Lưu URL ảnh từ Cloudinary
  uploading: boolean = false; // trạng thái đang upload
  existingImage: string | null = null;

  constructor(private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackbar:MatSnackBar,
    private adminService: AdminService){}

  ngOnInit(): void {
      this.route.paramMap.subscribe(params=>{
        this.productId = params.get('id');
        
      });

      this.productForm = this.formBuilder.group({
        categoryId:['',[Validators.required]],
        name:['',[Validators.required,Validators.minLength(3)]],
        price: ['', [Validators.required, Validators.min(1000)]],
        stock: ['', [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
        description:['']
      });
  
      this.getAllCategories();
      this.getProductById(Number(this.productId));
  }

  getProductById(id:number):void{
    this.adminService.getProductById(id).subscribe(res =>{
       // Cập nhật giá trị vào form
       console.log('product: ', res);
       this.productForm.patchValue({
        categoryId: res.categoryId,
        name: res.name,
        price: res.price,
        stock: res.stock,
        description: res.description
        
      });
       // Lưu URL ảnh hiện tại
       this.imageUrl = res.imgUrl;
       this.imagePreview = res.imgUrl;
     
    
    });
  }

  previewImage(){
    if (!this.selectedFile) {
      
      return; // Nếu không có file nào được chọn, thoát luôn
    }

    const reader = new FileReader();
    reader.onload=()=>{
      this.imagePreview = reader.result; // gan du lieu cho anh
    }
    reader.readAsDataURL(this.selectedFile);
  }

  onFileSelected(event: any){
    this.selectedFile = event.target.files[0]; // lay file dau tien
    this.previewImage();
    if (this.selectedFile) {
      this.uploadImage(this.selectedFile);
    }
  }

  uploadImage(file: File) {
    this.uploading = true;

    const formData = new FormData();
    formData.append('file', file);
    this.adminService.uploadImage(formData).subscribe({
      next: (response) => {
        this.imageUrl = response.url;
        this.uploading = false;
      },
      error: (error) => {
        console.error('Lỗi upload ảnh: ', error);
        this.snackbar.open('Lỗi khi tải ảnh lên', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.uploading = false;
      }
    });
  }

  getAllCategories():void{
   
    this.adminService.getAllCategories().subscribe(res=>{
      
      this.categories = res;
    })
  }

  updateProduct():void{
    if(this.productForm.valid){

      if (this.uploading) {
        this.snackbar.open('Ảnh đang được tải lên, vui lòng chờ...', 'Đóng', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        return;
      }

      // Nếu không có ảnh mới được chọn và cũng không có ảnh hiện tại
      if (!this.imageUrl) {
        this.snackbar.open('Vui lòng chọn ảnh cho sản phẩm', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      const productData = {
        id: this.productId,
        imgUrl: this.imageUrl,
        categoryId: this.productForm.get('categoryId')?.value,
        name: this.productForm.get('name')?.value,
        description: this.productForm.get('description')?.value,
        price: this.productForm.get('price')?.value,
        stock: this.productForm.get('stock')?.value
      };

       
      this.adminService.updateProduct(Number(this.productId),productData).subscribe({
        next: () => {
          this.snackbar.open('Cập nhật sản phẩm thành công!', 'Đóng', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['admin/dashboard']);
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm!';
          this.snackbar.open(errorMessage, 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });

    }
    
  }


  

}
