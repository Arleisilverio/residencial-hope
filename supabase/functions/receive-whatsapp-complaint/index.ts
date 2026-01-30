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

    // O n8n vai mandar o JSON que você especificou + o telefone do inquilino
    const { phone, categoria, prioridade, resumo, resposta } = await req.json()

    if (!phone) throw new Error("Telefone é obrigatório para identificar o inquilino.")

    // 1. Formata o telefone para buscar no banco (removendo 55 se o banco não tiver, ou garantindo padrão)
    // Aqui assumimos que o n8n manda o telefone limpo como '5541987922057'
    // Vamos buscar inquilinos que tenham esse telefone (podemos tentar buscar com e sem o prefixo 55)
    
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, apartment_number, full_name')
      .or(`phone.ilike.%${phone.slice(-11)}%`) // Busca pelos últimos 11 dígitos para ser mais flexível
      .eq('role', 'tenant')
      .single()

    if (profileError || !profile) {
      throw new Error(`Inquilino com telefone ${phone} não encontrado.`)
    }

    // 2. Insere a reclamação no banco
    const { data: complaint, error: complaintError } = await supabaseAdmin
      .from('complaints')
      .insert({
        tenant_id: profile.id,
        apartment_number: profile.apartment_number,
        category: categoria || 'reparo',
        // Guardamos o resumo e a prioridade na descrição
        description: `[IA - Prioridade ${prioridade?.toUpperCase() || 'MÉDIA'}] ${resumo}\n\nResposta do Agente: ${resposta}`,
        status: 'new',
      })
      .select()
      .single()

    if (complaintError) throw complaintError

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Solicitação registrada com sucesso!",
      complaint_id: complaint.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Erro na função receive-whatsapp-complaint:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})