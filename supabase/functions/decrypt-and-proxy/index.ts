// Supabase Edge Function: decrypt-and-proxy
// Decrypts API keys and proxies requests to AI providers
// Never exposes decrypted keys to the client

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

// AI Provider configurations
const PROVIDER_CONFIGS = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    headers: (apiKey: string) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    })
  },
  google: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    headers: (apiKey: string) => ({
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json'
    })
  },
  azure: {
    baseUrl: (resourceName: string, deploymentId: string) => 
      `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentId}`,
    headers: (apiKey: string) => ({
      'api-key': apiKey,
      'Content-Type': 'application/json'
    })
  },
  grok: {
    baseUrl: 'https://api.x.ai/v1',
    headers: (apiKey: string) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  }
}

// Request interface
interface ProxyRequest {
  keyId: string
  provider: keyof typeof PROVIDER_CONFIGS
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  azureConfig?: {
    resourceName: string
    deploymentId: string
  }
}

// Response interface
interface ProxyResponse {
  success: boolean
  data?: any
  error?: string
  status?: number
  provider?: string
}

// Decrypt API key using environment secret
async function decryptApiKey(encryptedKey: string, iv: string): Promise<string> {
  try {
    // Get encryption key from environment
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY')
    if (!encryptionKey) {
      throw new Error('Encryption key not configured')
    }

    // Convert from base64
    const encryptedData = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0))
    const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
    
    // Import encryption key
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(encryptionKey),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    
    // Decrypt the key
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivData
      },
      key,
      encryptedData
    )
    
    // Convert to string
    return new TextDecoder().decode(decryptedBuffer)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt API key')
  }
}

// Get API key from database
async function getApiKey(keyId: string, userId: string): Promise<{
  encryptedKey: string
  iv: string
  provider: string
  azureConfig?: {
    resourceName: string
    deploymentId: string
  }
}> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const { data, error } = await supabaseClient
    .from('api_keys')
    .select('encrypted_key, iv, provider, model_family')
    .eq('id', keyId)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  
  if (error) {
    throw new Error(`API key not found: ${error.message}`)
  }
  
  // Parse Azure config from model_family if needed
  let azureConfig
  if (data.provider === 'azure' && data.model_family) {
    try {
      azureConfig = JSON.parse(data.model_family)
    } catch {
      // If not JSON, assume it's just the deployment ID
      azureConfig = { deploymentId: data.model_family }
    }
  }
  
  return {
    encryptedKey: data.encrypted_key,
    iv: data.iv,
    provider: data.provider,
    azureConfig
  }
}

// Proxy request to AI provider
async function proxyToProvider(
  provider: keyof typeof PROVIDER_CONFIGS,
  apiKey: string,
  request: ProxyRequest
): Promise<Response> {
  const config = PROVIDER_CONFIGS[provider]
  
  // Build URL
  let url: string
  if (provider === 'azure' && request.azureConfig) {
    url = config.baseUrl(request.azureConfig.resourceName, request.azureConfig.deploymentId)
    url += request.endpoint.startsWith('/') ? request.endpoint : `/${request.endpoint}`
    url += '?api-version=2023-12-01-preview'
  } else {
    url = `${config.baseUrl}${request.endpoint.startsWith('/') ? request.endpoint : `/${request.endpoint}`}`
  }
  
  // Build headers
  const headers = {
    ...config.headers(apiKey),
    ...request.headers
  }
  
  // Make request
  const response = await fetch(url, {
    method: request.method,
    headers,
    body: request.body ? JSON.stringify(request.body) : undefined
  })
  
  return response
}

// Handle OPTIONS request (CORS preflight)
function handleOptions(): Response {
  return new Response(null, {
    headers: corsHeaders,
    status: 204
  })
}

// Handle POST request
async function handlePost(request: Request): Promise<Response> {
  try {
    // Get user ID from JWT
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Verify JWT and get user
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseClient.auth.getUser(jwt)
    
    if (error || !user) {
      throw new Error('Invalid authentication')
    }
    
    // Parse request body
    const body: ProxyRequest = await request.json()
    
    // Validate request
    if (!body.keyId || !body.provider || !body.endpoint || !body.method) {
      throw new Error('Missing required fields: keyId, provider, endpoint, method')
    }
    
    // Get encrypted API key from database
    const keyData = await getApiKey(body.keyId, user.id)
    
    // Decrypt API key
    const apiKey = await decryptApiKey(keyData.encryptedKey, keyData.iv)
    
    // Update usage count
    await supabaseClient.rpc('increment_key_usage', { key_id: body.keyId })
    
    // Proxy request to provider
    const providerResponse = await proxyToProvider(
      body.provider as keyof typeof PROVIDER_CONFIGS,
      apiKey,
      {
        ...body,
        azureConfig: keyData.azureConfig
      }
    )
    
    // Get response data
    const responseData = await providerResponse.text()
    
    // Parse JSON if possible
    let parsedData
    try {
      parsedData = JSON.parse(responseData)
    } catch {
      parsedData = responseData
    }
    
    // Return response
    const proxyResponse: ProxyResponse = {
      success: providerResponse.ok,
      data: parsedData,
      status: providerResponse.status,
      provider: body.provider
    }
    
    if (!providerResponse.ok) {
      proxyResponse.error = `Provider error: ${providerResponse.status} ${providerResponse.statusText}`
    }
    
    return new Response(JSON.stringify(proxyResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: providerResponse.ok ? 200 : 400
    })
    
  } catch (error: any) {
    console.error('Proxy error:', error)
    
    const errorResponse: ProxyResponse = {
      success: false,
      error: error.message || 'Internal server error'
    }
    
    return new Response(JSON.stringify(errorResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    })
  }
}

// Main handler
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    })
  }
  
  // Handle POST request
  return handlePost(req)
})