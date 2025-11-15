
export type UserRole = 'admin' | 'tenant';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url: string | null;
  apartment_number: number | null;
  move_in_date: string;
}

export type RentStatus = 'paid' | 'pending' | 'overdue' | 'partial';

export interface Apartment {
  number: number;
  monthly_rent: number;
  status: 'occupied' | 'available' | 'maintenance';
  tenant_id: string | null;
  tenant?: UserProfile | null;
  rent_status: RentStatus;
  next_due_date: string;
  payment_request_pending: boolean;
}

export interface Payment {
  id: string;
  apartment_number: number;
  tenant_id: string;
  amount: number;
  type: 'full' | 'partial';
  paid_at: string;
  month: string;
}

export interface Complaint {
  id: string;
  tenant_id: string;
  apartment_number: number;
  category: 'hidraulica' | 'eletrica' | 'estrutura' | 'outros';
  description: string;
  attachments: string[];
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface Notification {
  id: string;
  tenant_id: string;
  title: string;
  message: string;
  icon: 'bell' | 'check' | 'warning';
  read: boolean;
  created_at: string;
  dismissible?: boolean;
}
