import { CartService } from "./../services/cart/cart.service";
import { Router } from "@angular/router";

import { AppComponent } from "./../app.component";
import { Component, ElementRef, OnInit, ViewChild, OnDestroy, Renderer2 } from "@angular/core";
import { ProductService } from "../services/product/product.service";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  products!: any[];
  featuredProducts!: any[];
  visible: boolean = this.appComponent.isAdminLoggedIn;

  @ViewChild("productsSection") productsSection!: ElementRef;

  // IDs để quản lý DOM
  private sdkScriptId = "facebook-jssdk";
  private chatDivId = "fb-customer-chat";
  private rootDivId = "fb-root";

  constructor(
    private appComponent: AppComponent,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.getFeaturedProducts();
  }

  openMessenger(): void {
    // Thay 1 trong 2 dòng dưới bằng thông tin của bạn:
    const url = "https://m.me/940224482507614";
    // const url = 'https://m.me/YOUR_PAGE_ID';

    // Mở tab mới (mobile sẽ tự mở app Messenger nếu có)
    window.open(url, "_blank");
  }

  getAllProducts(): void {
    this.products = [];
    this.productService.getAllProducts().subscribe((res) => {
      if (Array.isArray(res)) {
        // Kiểm tra res là mảng không

        this.products = res;
      } else {
        console.error("API response is not an array:", res);
      }
    });
  }

  scrollToProducts(): void {
    this.productsSection.nativeElement.scrollIntoView({ behavior: "smooth" });
  }

  getFeaturedProducts(): void {
    // For now, just take the first 4 products
    this.productService.getFourNewProdct().subscribe((res) => {
      if (Array.isArray(res)) {
        this.featuredProducts = res;
      }
    });
  }

  buyNow(product: any) {
    if (product.stock <= 0) {
      return;
    }
    this.cartService.addToCart(product);
    this.router.navigate(["/cart"]);
  }

  addToCart(product: any) {
    if (product.stock <= 0) {
      return;
    }

    this.cartService.addToCart(product);
  }

  viewProductDetails(productId: number, categoryId: number) {
    this.productService.viewProductDetails(productId, categoryId);
  }
}
