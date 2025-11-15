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
    // 1. Cria um cliente Supabase com o token de autenticação do usuário
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 2. Obtém o usuário a partir do token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError) throw userError

    // 3. Obtém o número do apartamento do corpo da requisição
    const { apartmentNumber } = await req.json()
    if (!apartmentNumber) {
      throw new Error("O número do apartamento é obrigatório.")
    }

    // 4. Cria um cliente admin para realizar a atualização
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 5. Atualiza o apartamento, garantindo que o tenant_id corresponda ao usuário autenticado
    const { error: updateError } = await supabaseAdmin
      .from('apartments')
      .update({ payment_request_pending: true })
      .match({ number: apartmentNumber, tenant_id: user.id }) // Verificação de segurança!

    if (updateError) throw updateError

    return new Response(JSON.stringify({ message: "Solicitação de pagamento enviada com sucesso." }), {
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