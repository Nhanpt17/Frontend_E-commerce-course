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

  ngOnInit(): void {
    this.isAuthenticated = UserstorageService.isCustomerLoggedIn();
    
    this.route.paramMap.subscribe(params => {
      this.productId = Number(params.get('id'));
      this.categoryId = Number(params.get('categoryId'));

      // Tại đây, bạn có thể gọi API hoặc thực hiện các hành động khác sử dụng productId và categoryId
     

      this.getRelatedProducts(this.categoryId, 3);
      this.getProductById(this.productId);
      this.loadReviews();
      this.loadReviewStats();
      
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
  viewProductDetails(productId: number, categoryId: number) {
    this.productService.viewProductDetails(productId, categoryId);

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
