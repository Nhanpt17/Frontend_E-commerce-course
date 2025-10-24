import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffComponent } from './staff.component';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { InventoryComponent } from './inventory/inventory.component';

const routes: Routes = [
  { path: '', component: OrderListComponent  },
  { path: 'inventory', component: InventoryComponent  },
  { path: ':id', component: OrderDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
