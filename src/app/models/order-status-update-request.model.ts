import { OrderStatus } from './order-status.enum';

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}

export interface InventoryCheckResponse {
    available: boolean;
    message: string;
  }
