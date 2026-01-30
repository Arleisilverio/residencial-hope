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

    // O n8n vai mandar o JSON: { phone, categoria, prioridade, resumo, resposta }
    const { phone, categoria, prioridade, resumo, resposta } = await req.json()

    if (!phone) throw new Error("Telefone é obrigatório para identificar o inquilino.")

    // Busca o inquilino comparando os últimos 11 dígitos do telefone (padrão Brasil)
    const phoneSuffix = phone.replace(/\D/g, '').slice(-11);
    
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, apartment_number, full_name')
      .ilike('phone', `%${phoneSuffix}%`)
      .eq('role', 'tenant')
      .maybeSingle()

    if (profileError) throw profileError
    
    if (!profile) {
      throw new Error(`Inquilino com telefone terminado em ${phoneSuffix} não encontrado.`)
    }

    // Insere a reclamação marcada como vinda da IA para o painel do ADM
    const priorityTag = prioridade?.toUpperCase() || 'MÉDIA';
    const description = `[IA - Prioridade ${priorityTag}] ${resumo}\n\nResposta enviada pelo Agente: ${resposta}`;

    const { data: complaint, error: complaintError } = await supabaseAdmin
      .from('complaints')
      .insert({
        tenant_id: profile.id,
        apartment_number: profile.apartment_number,
        category: categoria || 'reparo',
        description: description,
        status: 'new',
      })
      .select()
      .single()

    if (complaintError) throw complaintError

    console.log(`[receive-whatsapp-complaint] Sucesso: Kit ${profile.apartment_number} registrado.`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Solicitação registrada no painel administrativo." 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('[receive-whatsapp-complaint] Erro:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})