import { ProductDetailPageComponent } from './product-page/product-detail-page/product-detail-page/product-detail-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';
import { ForgetPasswordComponent } from './login/forget-password/forget-password.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ProductPageComponent } from './product-page/product-page.component';
import { CartComponent } from './cart/cart.component';
import { authGuard } from './guards/auth.guard';
import { UnauthorizedPageComponent } from './shared/unauthorized-page/unauthorized-page.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'products', component: ProductPageComponent },
  { path: 'product-detail/:id/:categoryId', component: ProductDetailPageComponent },
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'unauthorized', component: UnauthorizedPageComponent },
  { path: '', component: HomeComponent },
  {
    path: 'cart', component: CartComponent,
    canActivate: [authGuard],
    data: { rolesExclude: ['ADMIN', 'STAFF', 'DELIVERY'] }
  },
  {
    path: 'customer', loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule),
    canActivate: [authGuard],
    data: { roles: ['CUSTOMER'] }
  },
  {
    path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'staff', loadChildren: () => import('./staff/staff.module').then(m => m.StaffModule),
    canActivate: [authGuard],
    data: { roles: ['STAFF', 'ADMIN'] }
  },
  {
    path: 'delivery', loadChildren: () => import('./delivery/delivery.module').then(m => m.DeliveryModule),
    canActivate: [authGuard],
    data: { roles: ['DELIVERY', 'ADMIN'] }
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
