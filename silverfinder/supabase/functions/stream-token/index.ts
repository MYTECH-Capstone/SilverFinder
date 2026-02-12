import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as djwt from "https://deno.land/x/djwt@v2.8/mod.ts" // Native Deno JWT

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const apiKey = Deno.env.get('STREAM_API_KEY')
    const apiSecret = Deno.env.get('STREAM_API_SECRET')

    if (!apiKey || !apiSecret) throw new Error('Missing Stream Keys')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    console.log(`Creating manual token for: ${user.id}`)

    // NATIVE DENO TOKEN GENERATION
    const encoder = new TextEncoder()
    const keyBuffer = encoder.encode(apiSecret)
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )

    const token = await djwt.create(
      { alg: "HS256", typ: "JWT" },
      { user_id: user.id }, // putting user_id in payload from supa table
      cryptoKey
    )

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Function error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

/* // this version worked with generating a token but still failed w loading
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Added ?bundle to ensure all dependencies are included
import { StreamChat } from "https://esm.sh/stream-chat@8.40.0?bundle"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const apiKey = Deno.env.get('STREAM_API_KEY')
    const apiSecret = Deno.env.get('STREAM_API_SECRET')

    // 1. Check if Secrets actually exist in the environment
    if (!apiKey || !apiSecret) {
      console.error("CRITICAL: Secrets missing from Deno environment")
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 2. Initialize Supabase to verify the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      console.error("Auth Error:", authError?.message)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log(`Generating token for user: ${user.id}`)

    // 3. Create the Stream client and sign the token
    const serverClient = new StreamChat(apiKey, apiSecret)
    
    // We wrap this specifically to catch the 'sign' error
    let token;
    try {
      token = serverClient.createToken(user.id)
    } catch (tokenErr) {
      console.error("Stream Signing Error:", tokenErr.message)
      throw new Error(`Stream failed to sign token: ${tokenErr.message}`)
    }

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Function caught error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
/*import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { StreamChat } from "https://esm.sh/stream-chat@8.40.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = "ft5m392ebj73" 
    const apiSecret = "9rvwgezx6ky23q4fynw8xavkzepd9uhxgh63p5h963hqkcnmmcwtcyxebn86s2f6"

    if (!apiKey || !apiSecret) {
      throw new Error('Stream API keys are missing in Edge Function secrets')
    }

    // Use 'new' instead of 'getInstance' for a fresh instance
    const serverClient = new StreamChat(apiKey, apiSecret)

    // Create Supabase client to verify the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Generate the token
    const token = serverClient.createToken(user.id)

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
/*import { StreamChat } from 'https://esm.sh/stream-chat@8.40.0'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

    if (!user) throw new Error('Unauthorized')

    const serverClient = StreamChat.getInstance(
      Deno.env.get('STREAM_API_KEY')!,
      Deno.env.get('STREAM_API_SECRET')!
    )

    const token = serverClient.createToken(user.id)
    return new Response(JSON.stringify({ token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders })
  }
})*/