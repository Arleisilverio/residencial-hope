export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  avatar_url: string;
  move_in_date: string;
  role: 'admin' | 'tenant';
  apartment_number: number | null;
}

export type RentStatus = 'paid' | 'pending' | 'overdue' | 'partial' | null;

export interface Apartment {
  number: number;
  status: 'available' | 'occupied';
  tenant_id: string | null;
  tenant: Profile | null;
  monthly_rent: number | null;
  rent_status: RentStatus;
  next_due_date: string | null;
  pending_complaints_count?: number;
  payment_request_pending: boolean;
  amount_paid: number | null;
  remaining_balance: number | null;
}

export interface Complaint {
  id: string;
  tenant_id: string;
  apartment_number: number | null;
  category: string;
  description: string;
  attachments?: string[];
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  category: string;
  description: string;
  amount: number;
  transaction_date: string;
  receipt_url?: string;
  created_at: string;
}

export interface AppLog {
  id: string;
  created_at: string;
  level: 'info' | 'error' | 'warning';
  source: string;
  message: string;
  details?: any;
}