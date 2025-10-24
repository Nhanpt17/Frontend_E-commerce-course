
export interface Voucher {
    id: number;
    code: string;
    description: string;
    discountValue: number;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'| 'SHIPPING_PERCENTAGE';
    minimumOrderValue: number;
    startDate: string;
    endDate: string;
    maxUsage?: number;
    currentUsage: number;
    active: boolean;
    public: boolean;
    pointsRequired:number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CustomerVoucher {
    id: number;
    customerId: number;
    voucher: Voucher;
    used: boolean;
    usedAt?: string;
    createdAt: string;
  }
  
  export interface Point {
    id: number;
    customerId: number;
    balance: number;
    lastUpdated: string;
  }