import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StaffRoutingModule } from './staff-routing.module';
import { StaffComponent } from './staff.component';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { AngularMaterialModule } from '../AngularMaterialModule';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InventoryComponent } from './inventory/inventory.component';

@NgModule({
  declarations: [
    StaffComponent,
    OrderListComponent,
    OrderDetailComponent,
    InventoryComponent
  ],
  imports: [

    CommonModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    StaffRoutingModule
  ]
})
export class StaffModule { }
