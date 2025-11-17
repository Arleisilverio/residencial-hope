// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { tenantId } = await req.json()

    if (!tenantId) {
      return new Response(JSON.stringify({ error: 'O ID do inquilino é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Deletar arquivos de documentos do Storage
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('documents')
      .list(tenantId);

    if (listError) console.error(`Erro ao listar documentos:`, listError.message);
    if (files && files.length > 0) {
      const filePaths = files.map(file => `${tenantId}/${file.name}`);
      const { error: removeError } = await supabaseAdmin.storage.from('documents').remove(filePaths);
      if (removeError) console.error(`Erro ao remover documentos:`, removeError.message);
    }
    
    // 2. Deletar avatar do Storage
    const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('avatar_url')
        .eq('id', tenantId)
        .single();

    if (profileData && profileData.avatar_url) {
        try {
            const avatarPath = new URL(profileData.avatar_url).pathname.split('/avatars/')[1];
            if (avatarPath) {
                await supabaseAdmin.storage.from('avatars').remove([avatarPath]);
            }
        } catch (e) {
            console.error('Erro ao processar ou deletar avatar:', e.message);
        }
    }

    // 3. Deletar dados relacionados (reclamações, notificações, etc.)
    const tablesToDeleteFrom = ['complaints', 'notifications', 'payment_requests'];
    for (const table of tablesToDeleteFrom) {
        const { error } = await supabaseAdmin.from(table).delete().eq('tenant_id', tenantId);
        if (error) console.error(`Erro ao deletar da tabela ${table}:`, error.message);
    }

    // 4. Atualizar o apartamento para 'vago'
    const { error: apartmentError } = await supabaseAdmin
      .from('apartments')
      .update({
        tenant_id: null,
        status: 'available',
        rent_status: null,
        next_due_date: null,
        payment_request_pending: false,
        amount_paid: null,
        remaining_balance: null,
        monthly_rent: null, // Limpa o valor do aluguel anterior
      })
      .eq('tenant_id', tenantId);

    if (apartmentError) {
      throw new Error(`Erro ao desocupar apartamento: ${apartmentError.message}`);
    }

    // 5. Deletar o usuário do sistema de autenticação (isso deletará o perfil em cascata)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(tenantId);

    if (deleteUserError) {
      throw new Error(`Erro ao deletar usuário: ${deleteUserError.message}`);
    }

    return new Response(JSON.stringify({ message: 'Inquilino e todos os seus dados foram removidos com sucesso.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro na função delete-tenant:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})