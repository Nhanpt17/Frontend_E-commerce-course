import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './AngularMaterialModule';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ForgetPasswordComponent } from './login/forget-password/forget-password.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { TokenInterceptor } from './services/token.interceptor';
import { ProductPageComponent } from './product-page/product-page.component';
import { ProductDetailPageComponent } from './product-page/product-detail-page/product-detail-page/product-detail-page.component';
import { CartComponent } from './cart/cart.component';
import { MatPaginatorIntlVietnamese } from './product-page/mat-paginator-intl';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { RedeemVoucherComponent } from './shared/dialogs/redeem-voucher/redeem-voucher.component';
import { VoucherFormDialogComponent } from './shared/dialogs/voucher-form-dialog/voucher-form-dialog.component';
import { UnauthorizedPageComponent } from './shared/unauthorized-page/unauthorized-page.component';
import { DeliveryAssignmentDialogComponent } from './shared/delivery-assignment-dialog/delivery-assignment-dialog.component';
import { CategoryDialogComponent } from './shared/dialogs/category-dialog/category-dialog.component';
import { ConfirmCusDialogComponent } from './shared/dialogs/confirm-cus-dialog/confirm-cus-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    
    ProductPageComponent,
    ProductDetailPageComponent,
    CartComponent,
    RedeemVoucherComponent,
    VoucherFormDialogComponent,
    UnauthorizedPageComponent,
    DeliveryAssignmentDialogComponent,
    CategoryDialogComponent,
    ConfirmCusDialogComponent,
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor,multi:true}, // Thêm interceptor
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlVietnamese }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
