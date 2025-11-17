export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  avatar_url: string;
  move_in_date: string;
  role: 'admin' | 'tenant'; // Adicionando a role
  apartment_number: number | null; // Adicionando o número do apartamento
}

export type RentStatus = 'paid' | 'pending' | 'overdue' | 'partial' | null;

export interface Apartment {
  number: number;
  status: 'available' | 'occupied';
  tenant_id: string | null;
  tenant: Profile | null;
  monthly_rent: number | null;
  rent_status: RentStatus;
  next_due_date: string | null; // Adicionando a data de vencimento
  pending_complaints_count?: number; // Novo campo para o administrador
  payment_request_pending: boolean; // Adicionando o status de solicitação de pagamento
  amount_paid: number | null; // Novo campo para pagamento parcial
  remaining_balance: number | null; // Novo campo para saldo restante
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