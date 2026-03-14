// Supabase Edge Function: export-document
// Generates PDF or Word documents from structured data
// Uses WASM libraries for document generation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { handleOptions } from './handlers.ts'

// Main handler
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      status: 405
    })
  }
  
  // Handle POST request
  const { handlePost } = await import('./handlers.ts')
  return handlePost(req)
})