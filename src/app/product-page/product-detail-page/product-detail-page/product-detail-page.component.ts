import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from './../../../services/product/product.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from 'src/app/customer/service/review.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { UserstorageService } from 'src/app/services/storage/userstorage.service';

@Component({
  selector: 'app-product-detail-page',
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.css'],
  styles: [`
    .error-snackbar {
      background-color: #f44336 !important;
      color: white !important;
    }
  `]
})
export class ProductDetailPageComponent implements OnInit {
  productId!: number;
  categoryId!: number;
  product: any = {};
  relatedProducts: any[] = [];
  quantity: number = 1;
  totalPrice: number = this.product.price;
  reviewForm!: FormGroup;
  selectedRating: number = 0;
  reviews: any[] = [];
  averageRating: number = 0;
  reviewCount: number = 0;
  isAuthenticated: boolean = false;
  showCommentSection: boolean = false;
  @ViewChild('quantityInput') quantityInput!: ElementRef;
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private reviewService: ReviewService,
    private router: Router,
    private fb: FormBuilder
  ) {

    this.reviewForm = fb.group({
      comment: ['', Validators.required]
    });
  }

  // ngOnInit(): void {
  //   this.isAuthenticated = UserstorageService.isCustomerLoggedIn();
    
  //   this.route.paramMap.subscribe(params => {
  //     this.productId = Number(params.get('id'));
  //     this.categoryId = Number(params.get('categoryId'));

  //     // Tại đây, bạn có thể gọi API hoặc thực hiện các hành động khác sử dụng productId và categoryId
     

  //     this.getRelatedProducts(this.categoryId, 3);
  //     this.getProductById(this.productId);
  //     this.loadReviews();
  //     this.loadReviewStats();
      
  //   });



  // }
  
  ngOnInit(): void {
  this.isAuthenticated = UserstorageService.isCustomerLoggedIn();

  this.route.paramMap.subscribe(params => {
    const slug = params.get('slug'); // VD: ca-phe-trung-nguyen-123 hoặc ca-phe-trung-nguyen

    if (slug) {
      const parts = slug.split('-');
      const maybeId = Number(parts[parts.length - 1]);

      if (!isNaN(maybeId)) {
        // ✅ Có ID trong URL → load bình thường
        this.loadProductById(maybeId);

        // ✅ Xóa ID khỏi thanh địa chỉ
        const newSlug = this.slugify(parts.slice(0, -1).join('-'));
        history.replaceState({}, '', `/product/${newSlug}`);
      } else {
        // ❌ Không có ID trong URL (người dùng copy link)
        // → thử tìm sản phẩm theo slug từ cache (localStorage)
        const cached = localStorage.getItem('lastViewedProduct');
        if (cached) {
          const product = JSON.parse(cached);
          if (this.slugify(product.name) === slug) {
            this.product = product;
            this.loadProductById(product.id);
            this.getRelatedProducts(product.categoryId, 3);
            return;
          }
        }

        // Nếu cache không có, fallback → gọi API getAll và tìm thủ công
        this.productService.getAllProducts().subscribe(all => {
          const product = all.find((p: any) => this.slugify(p.name) === slug);
          if (product) {
            this.loadProductById(product.id);
          } else {
            console.error('Không tìm thấy sản phẩm theo slug:', slug);
          }
        });
      }
    }
  });
}

loadProductById(id: number) {
  this.productService.getProductById(id).subscribe(res => {
    this.product = res;
    this.categoryId = res.categoryId;
    this.getRelatedProducts(this.categoryId, 3);
    this.loadReviews();
    this.loadReviewStats();
    this.quantity = 1;
    this.updateTotalPrice();

    // 🔒 Lưu vào cache để xử lý khi copy link
    localStorage.setItem('lastViewedProduct', JSON.stringify(res));
  });
}




  loadReviews(): void {
    
    this.reviewService.getLimitProductReviews(this.productId,5).subscribe({
      next: (res) => {
        
        this.reviews = res;
      },
      error: (err) => {
        console.error("Error fetching reviews: ", err);
      }
    })
  }

  loadReviewStats(): void {
    this.reviewService.getProductReviewStats(this.productId).subscribe({
      next: (res) => {
        
        this.averageRating = res.averageRating || 0;
        this.reviewCount = res.reviewCount || 0;
      },
      error: (err) => {
        console.error("Error fetching review stats: ", err);
      }
    });
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  submitReview(): void {
    if (this.selectedRating === 0) {
      this.snackBar.open('Vui lòng chọn số sao đánh giá', 'Đóng', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const userId = UserstorageService.getUserId(); // Lấy userId từ localStorage
    if (!userId) {
      this.snackBar.open('Vui lòng đăng nhập để đánh giá', 'Đóng', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const reviewData = {
      productId: this.productId,
      userId: +userId, // Chuyển thành number
      rating: this.selectedRating,
      comment: this.reviewForm.value.comment
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: (res) => {
        this.snackBar.open('Đánh giá của bạn đã được gửi!', 'Đóng', {
          duration: 3000
        });
        this.loadReviews();
        this.loadReviewStats();
        this.reviewForm.reset();
        this.selectedRating = 0;
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Có lỗi xảy ra!';
        this.snackBar.open(errorMessage, 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }



  increaseQuantity() {
    if (this.quantity < this.product.stock) this.quantity++;
    this.updateTotalPrice();
  }

  decreaseQuantity() {
    if (this.quantity > 1) this.quantity--;
    this.updateTotalPrice();
  }

  addToCart2Parameter(product: any, quantity: number) {

    if (product.stock <= 0) {
      this.snackBar.open('Sản phẩm đã hết hàng', 'Đóng', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.cartService.addToCart2Para(product, quantity);
    
  }

  buyNow2Parameter(product: any, quantity: number) {
    if (product.stock <= 0) return;

    this.cartService.addToCart2Para(product, quantity,1);
    this.router.navigate(["/cart"]);
  }

  updateTotalPrice() {
    this.totalPrice = this.product.price * this.quantity;
    console.log(`sl: ${this.totalPrice}`);
  }

  getRelatedProducts(categoryId: number, limit: number) {

    this.productService.getLimitProductByCategoryId(categoryId, limit).subscribe({
      next: (res) => {
       
        this.relatedProducts = res;
        this.relatedProducts = this.relatedProducts.filter(item => item.id !== this.productId);

      },
      error: (err) => {
        console.error("Error fetching product by category: ", err)
      }
    });
  }

  getProductById(productId: number) {
    this.productService.getProductById(productId).subscribe({
      next: (res) => {
        this.product = res;
        
        this.updateTotalPrice();
      },
      error: (err) => {
        console.error("Error fetching product by category: ", err)
      }
    });

  }
  // viewProductDetails(productId: number, categoryId: number) {
  //   this.productService.viewProductDetails(productId, categoryId);

  // }
   //Thay thế:
viewProductDetails(product: any) {
  const slug = this.slugify(product.name) + '-' + product.id;
  
  this.router.navigate(['/product', slug]).then(() => {
    // Cuộn lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load lại dữ liệu sản phẩm mới
    this.getProductById(product.id);
    this.getRelatedProducts(product.categoryId, 3);
    this.loadReviews();
    this.loadReviewStats();
  });
}

// Hàm chuyển tên sản phẩm thành slug thân thiện
slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')                     // tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '')      // xóa dấu
    .replace(/đ/g, 'd')                    // chuyển đ thường
    .replace(/Đ/g, 'd')                    // chuyển Đ hoa thành d
    .replace(/[^a-zA-Z0-9]+/g, '-')       // thay ký tự đặc biệt bằng '-'
    .replace(/^-+/, '')                    // xóa '-' ở đầu
    .replace(/-+$/, '')                    // xóa '-' ở cuối
    .replace(/--+/g, '-')                  // chuyển '--' liên tiếp thành '-'
    .toLowerCase();                        // chuyển toàn bộ thành chữ thường
}


  buyNow(product: any) {
    this.cartService.addToCart(product);
    this.router.navigate(["/cart"]);
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }

  toggleCommentSection(): void {
    this.showCommentSection = !this.showCommentSection;
  }

  validateQuantity(value: any) {
    const parsedValue = Number(value);
    if (isNaN(parsedValue) || parsedValue < 1) {
      this.quantity = 1;
      

    } else {
      this.quantity = Math.min(parsedValue, this.product.stock);
      

    }
    // Gán lại vào input để UI cập nhật
    this.quantityInput.nativeElement.value = this.quantity;

    this.updateTotalPrice();
  }

  preventInvalidInput(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (
      !/^\d$/.test(event.key) && 
      !allowedKeys.includes(event.key)
    ) {
      event.preventDefault();
    }
  }
}
