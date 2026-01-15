
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalDebt: number;
  lastPaymentDate?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  amount: number;
  type: 'DEBT' | 'PAYMENT';
  description: string;
  date: string;
}

export interface SummaryStats {
  totalReceivable: number;
  activeCustomers: number;
  recentCollections: number;
}
