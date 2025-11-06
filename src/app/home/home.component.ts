import { CartService } from './../services/cart/cart.service';
import { Router } from '@angular/router';
import { AppComponent } from './../app.component';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../services/product/product.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  products!: any[];
  featuredProducts!: any[];
  visible: boolean = this.appComponent.isAdminLoggedIn;

  @ViewChild('productsSection') productsSection!: ElementRef;

  // 💌 Các biến liên quan đến form đăng ký email
  subscriberEmail: string = '';
  subscribeMessage: string = '';

  constructor(
    private appComponent: AppComponent,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private http: HttpClient // 👈 thêm để gửi request đến backend
  ) {}

  ngOnInit(): void {
    this.getFeaturedProducts();
  }

  getAllProducts(): void {
    this.products = [];
    this.productService.getAllProducts().subscribe(res => {
      if (Array.isArray(res)) {
        this.products = res;
      } else {
        console.error("API response is not an array:", res);
      }
    });
  }

  scrollToProducts(): void {
    this.productsSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  getFeaturedProducts(): void {
    this.productService.getFourNewProdct().subscribe(res => {
      if (Array.isArray(res)) {
        this.featuredProducts = res;
      }
    });
  }

  buyNow(product: any) {
    if (product.stock <= 0) return;
    this.cartService.addToCart(product);
    this.router.navigate(["/cart"]);
  }

  addToCart(product: any) {
    if (product.stock <= 0) return;
    this.cartService.addToCart(product);
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
  });
}

  // Hàm chuyển tên sản phẩm thành slug thân thiện
  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD') // loại bỏ dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') // xóa dấu
    .replace(/[^a-z0-9]+/g, '-') // thay ký tự đặc biệt bằng '-'
    .replace(/^-+|-+$/g, ''); // xóa '-' đầu/cuối
}

  // 💌 Gửi email từ form đến backend để lưu vào Mailchimp
  subscribeToNewsletter(): void {
    if (!this.subscriberEmail || !this.validateEmail(this.subscriberEmail)) {
      this.subscribeMessage = '❌ Vui lòng nhập email hợp lệ!';
      return;
    }

    this.http.post('http://localhost:8080/api/mailchimp/subscribe', null, {
      params: { email: this.subscriberEmail }
    }).subscribe({
      next: () => {
        this.subscribeMessage = '✅ Đăng ký thành công! Cảm ơn bạn.';
        this.subscriberEmail = '';
      },
      error: (err) => {
        console.error(err);
        this.subscribeMessage = '⚠️ Có lỗi xảy ra. Vui lòng thử lại.';
      }
    });
  }

  // 🔎 Hàm kiểm tra định dạng email
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }
}
