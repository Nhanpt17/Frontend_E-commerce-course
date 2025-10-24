import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularMaterialModule } from '../AngularMaterialModule';
import { PostProductComponent } from './components/post-product/post-product.component';
import { UpdateProductComponent } from './components/update-product/update-product.component';
import { CategoryComponent } from './components/category/category.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { VoucherManagementComponent } from './components/voucher-management/voucher-management.component';
import { RevenueReportComponent } from './components/revenue-report/revenue-report.component';


@NgModule({
  declarations: [
    AdminComponent,
    DashboardComponent,
    PostProductComponent,
    UpdateProductComponent,
    CategoryComponent,
    ConfirmDialogComponent,
    VoucherManagementComponent,
    RevenueReportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularMaterialModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
