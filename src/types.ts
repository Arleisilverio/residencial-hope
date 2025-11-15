export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  avatar_url: string;
  move_in_date: string;
  role: 'admin' | 'tenant'; // Adicionando a role
}

export interface Apartment {
  number: number;
  status: 'available' | 'occupied';
  tenant_id: string | null;
  tenant: Profile | null;
  monthly_rent: number | null;
}