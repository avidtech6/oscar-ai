import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders } from './cors.ts'
import type { ExportRequest, ExportResponse } from './types.ts'
import { generatePdf, generateDocx, generateHtml, generateMarkdown } from './documentGenerators.ts'

// Handle OPTIONS request (CORS preflight)
export function handleOptions(): Response {
  return new Response(null, {
    headers: corsHeaders,
    status: 204
  })
}

// Handle POST request
export async function handlePost(request: Request): Promise<Response> {
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
    const body: ExportRequest = await request.json()
    
    // Validate request
    if (!body.documentType || !body.content || !body.content.title || !body.content.sections) {
      throw new Error('Missing required fields: documentType, content.title, content.sections')
    }
    
    // Generate document based on type
    let documentData: Uint8Array
    let mimeType: string
    let fileExtension: string
    
    switch (body.documentType) {
      case 'pdf':
        documentData = await generatePdf(body.content)
        mimeType = 'application/pdf'
        fileExtension = 'pdf'
        break
      case 'docx':
        documentData = await generateDocx(body.content)
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        fileExtension = 'docx'
        break
      case 'html':
        documentData = await generateHtml(body.content)
        mimeType = 'text/html'
        fileExtension = 'html'
        break
      case 'markdown':
        documentData = await generateMarkdown(body.content)
        mimeType = 'text/markdown'
        fileExtension = 'md'
        break
      default:
        throw new Error(`Unsupported document type: ${body.documentType}`)
    }
    
    // Generate file name
    const fileName = body.fileName || 
      `${body.content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.${fileExtension}`
    
    // Convert to base64 for response
    const base64Data = btoa(String.fromCharCode(...documentData))
    
    // Store in Supabase Storage if needed (optional)
    let documentUrl: string | undefined
    
    if (body.documentType === 'pdf' || body.documentType === 'docx') {
      try {
        // Upload to Supabase Storage
        const filePath = `exports/${user.id}/${fileName}`
        const { error: uploadError } = await supabaseClient.storage
          .from('documents')
          .upload(filePath, documentData, {
            contentType: mimeType,
            upsert: true
          })
        
        if (!uploadError) {
          // Get public URL
          const { data: urlData } = supabaseClient.storage
            .from('documents')
            .getPublicUrl(filePath)
          
          documentUrl = urlData.publicUrl
        }
      } catch (storageError) {
        console.warn('Failed to store document in storage:', storageError)
        // Continue without storage
      }
    }
    
    // Prepare response
    const response: ExportResponse = {
      success: true,
      documentUrl,
      documentData: base64Data,
      fileName,
      fileSize: documentData.length
    }
    
    // Return as JSON with base64 data, or as binary if requested
    const acceptHeader = request.headers.get('Accept')
    const returnBinary = acceptHeader?.includes(mimeType)
    
    if (returnBinary) {
      // Return binary file
      return new Response(documentData, {
        headers: {
          ...corsHeaders,
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': documentData.length.toString()
        }
      })
    } else {
      // Return JSON with base64 data
      return new Response(JSON.stringify(response), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      })
    }
    
  } catch (error: any) {
    console.error('Export error:', error)
    
    const errorResponse: ExportResponse = {
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