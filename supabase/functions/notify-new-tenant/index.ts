// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// URL do webhook do n8n fornecida pelo usuário
const N8N_WEBHOOK_URL = 'https://n8n.motoboot.com.br/webhook-test/ae4721e5-1e74-48cb-9625-ec1e94f89ebb';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Cliente Admin para buscar dados do perfil (Service Role Key)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, apartmentNumber, temporaryPassword } = await req.json()

    if (!userId || !apartmentNumber || !temporaryPassword) {
      return new Response(JSON.stringify({ error: 'Dados incompletos para notificação.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Busca o perfil completo do novo inquilino
    // Adicionamos um pequeno atraso para garantir que o trigger do Supabase tenha criado o perfil
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('Erro ao buscar perfil após 1s:', profileError);
        // Se o perfil não for encontrado, ainda podemos enviar os dados básicos para o n8n
        // e deixar o n8n lidar com a falha ou tentar novamente.
        // Vamos continuar, mas logar o erro.
    }

    // 2. Prepara o payload para o n8n
    const n8nPayload = {
      event: 'new_tenant_registered',
      tenant_id: userId,
      apartment_number: apartmentNumber,
      temporary_password: temporaryPassword, // Incluímos a senha temporária
      profile: profileData, // Dados completos do perfil (pode ser null se profileError ocorreu)
      timestamp: new Date().toISOString(),
    };

    // 3. Envia o payload para o webhook do n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
        console.error(`Falha ao acionar o n8n: ${n8nResponse.statusText}`);
    }

    return new Response(JSON.stringify({ message: 'Notificação de novo inquilino enviada ao n8n.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro na função notify-new-tenant:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})