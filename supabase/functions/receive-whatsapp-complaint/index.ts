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

    const { phone, categoria, prioridade, resumo, resposta } = await req.json()

    if (!phone) throw new Error("Telefone é obrigatório.")

    // Pega os últimos 8 dígitos do telefone enviado (o que nunca muda no Brasil)
    const phoneSuffix = phone.replace(/\D/g, '').slice(-8);
    
    // Busca o inquilino comparando os últimos 8 dígitos salvos no banco
    // O operador % na busca ilike permite encontrar o sufixo independente do que vem antes
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, apartment_number, full_name')
      .ilike('phone', `%${phoneSuffix}`)
      .eq('role', 'tenant')
      .maybeSingle()

    if (profileError) throw profileError
    
    if (!profile) {
      throw new Error(`Inquilino com final ${phoneSuffix} não encontrado no sistema.`)
    }

    const priorityTag = prioridade?.toUpperCase() || 'MÉDIA';
    const description = `[IA - Prioridade ${priorityTag}] ${resumo}\n\nResposta enviada: ${resposta}`;

    const { error: complaintError } = await supabaseAdmin
      .from('complaints')
      .insert({
        tenant_id: profile.id,
        apartment_number: profile.apartment_number,
        category: categoria || 'reparo',
        description: description,
        status: 'new',
      })

    if (complaintError) throw complaintError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})