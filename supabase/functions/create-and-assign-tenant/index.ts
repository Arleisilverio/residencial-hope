import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, full_name, phone, apartment_number } = await req.json();

    if (!email || !password || !full_name || !apartment_number) {
        return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirma o email
      user_metadata: { full_name, phone, apartment_number },
    });

    if (authError) {
      throw new Error(authError.message);
    }
    
    const newUserId = authData.user.id;

    // O trigger 'handle_new_user' já cria o perfil.
    // 2. Update the apartment to assign the new tenant
    const { error: apartmentError } = await supabaseAdmin
      .from('apartments')
      .update({ tenant_id: newUserId, status: 'occupied' })
      .eq('number', apartment_number);

    if (apartmentError) {
      // Tenta reverter a criação do usuário se a atualização do apartamento falhar
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error(`Falha ao associar apartamento: ${apartmentError.message}`);
    }

    return new Response(JSON.stringify({ message: 'Inquilino criado e associado com sucesso!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});