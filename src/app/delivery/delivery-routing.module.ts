import { DeliveryOrdersComponent } from './delivery-orders/delivery-orders.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryComponent } from './delivery.component';
import { DeliveryOrderDetailComponent } from './delivery-order-detail/delivery-order-detail.component';
import { DeliveryHistoryComponent } from './delivery-history/delivery-history.component';

const routes: Routes = [
  { path: '', component: DeliveryOrdersComponent },
  { path: 'history', component: DeliveryHistoryComponent },
  { path: ':id', component: DeliveryOrderDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryRoutingModule { }
