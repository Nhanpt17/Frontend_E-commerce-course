import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { PaymentStepperDialogComponent } from './components/payment-stepper-dialog/payment-stepper-dialog.component';
import { AngularMaterialModule } from '../AngularMaterialModule';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HandlePaymentMomoComponent } from './components/handle-payment-momo/handle-payment-momo.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderDetailDialogComponent } from './components/order-detail-dialog/order-detail-dialog.component';
import { VoucherCenterComponent } from './components/voucher-center/voucher-center.component';


@NgModule({
  declarations: [
    CustomerComponent,
    PaymentStepperDialogComponent,
    HandlePaymentMomoComponent,
    OrderHistoryComponent,
    OrderDetailDialogComponent,
    VoucherCenterComponent
  ],
  imports: [
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    CustomerRoutingModule
  ]
})
export class CustomerModule { }
