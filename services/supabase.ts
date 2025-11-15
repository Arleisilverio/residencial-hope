// NOTE: This is a MOCK file to simulate Supabase.
// In a real project, you would install `@supabase/supabase-js`
// and initialize the client like this:
/*
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/

import { ADMIN_EMAIL } from '../constants';
import { UserProfile, Apartment, Complaint, Notification, Payment, RentStatus } from '../types';

// --- MOCK DATABASE ---
const users: UserProfile[] = [
  { id: 'admin-user-id', email: ADMIN_EMAIL, full_name: 'Arlei Silvério', phone: '11 98765-4321', role: 'admin', avatar_url: 'https://picsum.photos/id/1005/200/200', apartment_number: null, move_in_date: '2020-01-01' },
  { id: 'tenant-1-id', email: 'joao.silva@email.com', full_name: 'João da Silva', phone: '11 91234-5678', role: 'tenant', avatar_url: 'https://picsum.photos/id/1011/200/200', apartment_number: 1, move_in_date: '2023-05-10' },
  { id: 'tenant-2-id', email: 'maria.souza@email.com', full_name: 'Maria Souza', phone: '21 98888-7777', role: 'tenant', avatar_url: null, apartment_number: 2, move_in_date: '2022-11-20' },
  { id: 'tenant-3-id', email: 'carlos.pereira@email.com', full_name: 'Carlos Pereira', phone: '31 99999-0000', role: 'tenant', avatar_url: 'https://picsum.photos/id/1012/200/200', apartment_number: 7, move_in_date: '2024-01-15' },
];

const apartments: Apartment[] = Array.from({ length: 14 }, (_, i) => ({
    number: i + 1,
    monthly_rent: i < 6 ? 1600 : 1800,
    status: 'occupied',
    tenant_id: null,
    rent_status: (['paid', 'pending', 'overdue', 'partial'] as const)[i % 4],
    next_due_date: '2025-11-05',
    payment_request_pending: i === 1,
}));

apartments[0].tenant_id = 'tenant-1-id';
apartments[1].tenant_id = 'tenant-2-id';
apartments[6].tenant_id = 'tenant-3-id';
apartments.forEach((apt, i) => {
    if (i > 2 && i !== 6) {
        apt.status = 'available';
    }
});


// Add tenants to apartments
apartments.forEach(ap => {
    const tenant = users.find(u => u.id === ap.tenant_id);
    if (tenant) {
        ap.tenant_id = tenant.id;
        ap.tenant = tenant;
    }
});


let complaints: Complaint[] = [
    { id: 'comp-1', tenant_id: 'tenant-1-id', apartment_number: 1, category: 'hidraulica', description: 'Vazamento na pia da cozinha.', attachments: [], status: 'in_progress', created_at: new Date().toISOString() }
];

let notifications: Notification[] = [
    { id: 'notif-1', tenant_id: 'tenant-1-id', title: 'Pagamento Confirmado', message: 'Seu pagamento do aluguel foi recebido. Obrigado!', icon: 'check', read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'notif-2', tenant_id: 'tenant-1-id', title: 'Lembrete de Vencimento', message: 'Seu aluguel vence em 5 dias.', icon: 'bell', read: true, dismissible: true, created_at: new Date(Date.now() - 5 * 86400000).toISOString() }
];

// --- MOCK API ---
const mockLatency = (ms: number) => new Promise(res => setTimeout(res, ms));

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }: any) {
      await mockLatency(500);
      const user = users.find(u => u.email === email);
      if (user) { // In a real scenario, you'd check the password
        const session = { user: { id: user.id, email: user.email }, access_token: 'mock_token' };
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        return { data: { session }, error: null };
      }
      return { data: { session: null }, error: { message: 'Invalid credentials' } };
    },
    async signOut() {
      await mockLatency(200);
      localStorage.removeItem('supabase.auth.token');
      return { error: null };
    },
    async getSession() {
      await mockLatency(50);
      const sessionStr = localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        return { data: { session: JSON.parse(sessionStr) }, error: null };
      }
      return { data: { session: null }, error: null };
    },
    async signUp({ email, password, options }: any) {
        await mockLatency(500);
        if (users.some(u => u.email === email)) {
            return { data: { user: null }, error: { message: 'Usuário com este e-mail já existe.' } };
        }
        const apartment = apartments.find(a => a.number === options.data.apartment_number);
        if (!apartment) {
            return { data: { user: null }, error: { message: 'Número do apartamento inválido.' } };
        }
        if (apartment.tenant_id) {
            return { data: { user: null }, error: { message: 'Este apartamento já está ocupado.' } };
        }

        const newUser: UserProfile = {
            id: `tenant-${users.length + 1}-id`,
            email,
            full_name: options.data.full_name,
            phone: '',
            role: 'tenant',
            avatar_url: null,
            apartment_number: options.data.apartment_number,
            move_in_date: new Date().toISOString(),
        };
        users.push(newUser);

        apartment.tenant_id = newUser.id;
        apartment.tenant = newUser;
        apartment.status = 'occupied';

        const session = { user: { id: newUser.id, email: newUser.email }, access_token: 'mock_token' };
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));

        return { data: { user: newUser, session }, error: null };
    },
    async resetPasswordForEmail(email: string) {
        await mockLatency(800);
        const userExists = users.some(u => u.email === email);
        if (!userExists) {
            // In a real app, you wouldn't reveal if the user exists.
            // For our mock, we'll just proceed as if it was successful.
            console.log(`Password reset requested for non-existent user: ${email}`);
        } else {
            console.log(`Password reset email sent to ${email}`);
        }
        return { data: {}, error: null };
    }
  },
  from: (table: string) => ({
    select(query: string = '*') {
        const queryBuilder = {
            _filters: [] as {field: string, value: any}[],
            eq: function(field: string, value: any) {
                this._filters.push({ field, value });
                return this;
            },
            then: async function(resolve: (value: any) => void) {
                await mockLatency(300);
                
                let sourceData: any[] = [];
                if (table === 'users') {
                    sourceData = users;
                } else if (table === 'apartments') {
                    sourceData = apartments.map(ap => ({...ap, tenant: users.find(u => u.id === ap.tenant_id) || null }));
                } else if (table === 'complaints') {
                    sourceData = complaints;
                } else if (table === 'notifications') {
                    sourceData = notifications;
                } else {
                     resolve({ data: [], error: { message: `Table ${table} not found` } });
                     return;
                }

                let filteredData = sourceData;
                if (this._filters.length > 0) {
                    this._filters.forEach(filter => {
                        filteredData = filteredData.filter(item => item[filter.field] === filter.value);
                    });
                }
                
                resolve({ data: filteredData, error: null });
            }
        };
        return queryBuilder;
    },
    update(newData: any) {
      return {
        eq: async (field: string, value: any) => {
          await mockLatency(400);
          console.log(`Updating ${table} where ${field} = ${value} with`, newData);
          if (table === 'apartments') {
              const index = apartments.findIndex(a => a[field as keyof Apartment] === value);
              if (index !== -1) {
                  apartments[index] = { ...apartments[index], ...newData };
                  return { data: [apartments[index]], error: null };
              }
          }
          if (table === 'users') {
             const index = users.findIndex(u => u[field as keyof UserProfile] === value);
             if (index !== -1) {
                  users[index] = { ...users[index], ...newData };
                  return { data: [users[index]], error: null };
             }
          }
          return { data: null, error: { message: 'Record not found' } };
        }
      };
    },
    async insert(newData: any) {
        await mockLatency(400);
        const newItem = { ...newData, id: `new-id-${Math.random()}`, created_at: new Date().toISOString() };
        console.log(`Inserting into ${table}`, newItem);
        if (table === 'complaints') {
            complaints.push(newItem as Complaint);
        }
        if (table === 'notifications') {
            notifications.push(newItem as Notification);
        }
        if (table === 'payment_requests') {
             const apt = apartments.find(a => a.number === newData.apartment_number);
             if (apt) apt.payment_request_pending = true;
        }
        return { data: [newItem], error: null };
    },
  }),
  channel: (name: string) => ({
      on: (event: any, filter: any, callback: any) => ({
          subscribe: () => {
               console.log(`Mock channel subscription to ${name}`);
               const subscription = {
                  unsubscribe: () => console.log(`Mock channel unsubscribe from ${name}`)
               };
               return subscription;
          }
      })
  }),
  removeChannel: (channel: any) => {
      console.log('Removing mock channel');
      if (channel && typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      }
  },
  storage: {
      from: (bucket: string) => ({
          async upload(path: string, file: File) {
              await mockLatency(1000);
              console.log(`Uploading ${file.name} to ${bucket}/${path}`);
              const publicURL = `https://picsum.photos/seed/${Math.random()}/200`;
              return { data: { publicUrl: publicURL }, error: null };
          }
      })
  }
};