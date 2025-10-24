import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeliveryRoutingModule } from './delivery-routing.module';
import { DeliveryComponent } from './delivery.component';
import { DeliveryOrdersComponent } from './delivery-orders/delivery-orders.component';
import { DeliveryOrderDetailComponent } from './delivery-order-detail/delivery-order-detail.component';
import { AngularMaterialModule } from '../AngularMaterialModule';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DeliveryHistoryComponent } from './delivery-history/delivery-history.component';


@NgModule({
  declarations: [
    DeliveryComponent,
    DeliveryOrdersComponent,
    DeliveryOrderDetailComponent,
    DeliveryHistoryComponent
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DeliveryRoutingModule
  ]
})
export class DeliveryModule { }
