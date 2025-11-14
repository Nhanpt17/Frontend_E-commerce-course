import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';
import { HandlePaymentMomoComponent } from './components/handle-payment-momo/handle-payment-momo.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { VoucherCenterComponent } from './components/voucher-center/voucher-center.component';
import { HandlePaymentVnpayComponent } from './components/handle-payment-vnpay/handle-payment-vnpay.component';

const routes: Routes = [
  { path: 'order-history', component: OrderHistoryComponent },
  { path: 'voucher', component: VoucherCenterComponent },
  { path: 'handle-payment-momo', component: HandlePaymentMomoComponent },
  { path: 'handle-payment-vnpay', component: HandlePaymentVnpayComponent },
  { path: '', component: CustomerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
