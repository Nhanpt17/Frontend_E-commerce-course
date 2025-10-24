import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PostProductComponent } from './components/post-product/post-product.component';
import { UpdateProductComponent } from './components/update-product/update-product.component';
import { CategoryComponent } from './components/category/category.component';
import { VoucherManagementComponent } from './components/voucher-management/voucher-management.component';
import { RevenueReportComponent } from './components/revenue-report/revenue-report.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'analytics', component: RevenueReportComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'voucher', component: VoucherManagementComponent },
  { path: 'product', component: PostProductComponent },
  { path: 'product/:id', component: UpdateProductComponent },
  { path: '', component: AdminComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
