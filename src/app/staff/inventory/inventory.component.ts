import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product/product.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit{
  selectedCategory: any = { id: null, name: 'Tất cả' };
  categories: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  paginatedProducts: any[] = [];
  pageSize: number = 10;
  currentPage: number = 0;
  searchTerm: string = '';
  displayedColumns: string[] = ['image', 'name', 'category', 'price', 'stock'];

  // Thống kê
  totalProducts: number = 0;
  outOfStockProducts: number = 0;
  lowStockProducts: number = 0;

  //tim kiem danh sach viet nam
  removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD') // chuẩn hóa Unicode
      .replace(/[\u0300-\u036f]/g, '') // loại bỏ dấu tiếng Việt
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.getAllCategories();
    this.getAllProducts();
  }

  getAllCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.categories = [{ id: null, name: 'Tất cả' }, ...res];
        } else {
          console.error("API categories response is not an array:", res);
        }
      },
      error: (err) => console.error("Error fetching categories:", err)
    });
  }

  getAllProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          
          this.products = res;
          this.filteredProducts = [...this.products];
          this.updatePagination();
          this.updateInventoryStats();
        } else {
          console.error("API response is not an array:", res);
        }
      },
      error: (err) => console.error("Error fetching products:", err)
    });
  }

  filterProducts(): void {
    if (this.selectedCategory.id === null) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        product => product.categoryId === this.selectedCategory.id
      );
    }

    
    this.applySearch(); // Áp dụng cả tìm kiếm nếu có
    this.currentPage = 0;
    this.updatePagination();
    this.updateInventoryStats();
  }

  applySearch(): void {
    if (!this.searchTerm) {
      if (this.selectedCategory.id === null) {
        this.filteredProducts = [...this.products];
      } else {
        this.filteredProducts = this.products.filter(
          product => product.categoryId === this.selectedCategory.id
        );
      }
    } else {
      //const term = this.searchTerm.toLowerCase();
      const term = this.removeVietnameseTones(this.searchTerm.toLowerCase());

      this.filteredProducts = this.products.filter(product =>{
        const name = this.removeVietnameseTones(product.name.toLowerCase());
        return name.includes(term)
          && (this.selectedCategory.id === null || product.categoryId === this.selectedCategory.id)
      } 
     
        );
    }
    this.currentPage = 0;
    this.updatePagination();
    this.updateInventoryStats();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Không xác định';
  }

  updatePagination(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(start, end);
  }

  pageChanged(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagination();
  }

  updateInventoryStats(): void {
    this.totalProducts = this.filteredProducts.length;
    this.outOfStockProducts = this.filteredProducts.filter(p => p.stock <= 0).length;
    this.lowStockProducts = this.filteredProducts.filter(p => p.stock > 0 && p.stock <= 5).length;
  }
}
