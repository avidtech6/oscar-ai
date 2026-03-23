/**
 * Intelligence API interfaces
 * 
 * Defines the interfaces for PHASE_14: Report Intelligence API
 */
export interface ApiRequest {
  /**
   * Request ID
   */
  requestId: string;

  /**
   * API endpoint
   */
  endpoint: string;

  /**
   * HTTP method
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  /**
   * Request headers
   */
  headers: Record<string, string>;

  /**
   * Request parameters
   */
  params: Record<string, any>;

  /**
   * Request body
   */
  body?: any;

  /**
   * Authentication token
   */
  token?: string;

  /**
   * Request metadata
   */
  metadata: {
    timestamp: string;
    userAgent: string;
    ipAddress: string;
    sessionId: string;
  };
}

export interface ApiResponse {
  /**
   * Request ID
   */
  requestId: string;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * Response headers
   */
  headers: Record<string, string>;

  /**
   * Response body
   */
  body: any;

  /**
   * Response metadata
   */
  metadata: {
    timestamp: string;
    duration: number;
    processingTime: number;
    responseSize: number;
  };
}

export interface ApiError {
  /**
   * Error code
   */
  code: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Error details
   */
  details?: Record<string, any>;

  /**
   * HTTP status code
   */
  status: number;

  /**
   * Error timestamp
   */
  timestamp: string;
}

export interface ApiRateLimit {
  /**
   * Rate limit identifier
   */
  identifier: string;

  /**
   * Maximum requests per time period
   */
  maxRequests: number;

  /**
   * Time period in milliseconds
   */
  timeWindow: number;

  /**
   * Current request count
   */
  currentRequests: number;

  /**
   * Reset timestamp
   */
  resetTime: string;

  /**
   * Whether the limit is exceeded
   */
  exceeded: boolean;
}

export interface ApiAuth {
  /**
   * Authentication type
   */
  type: 'bearer' | 'api-key' | 'oauth' | 'basic';

  /**
   * Authentication credentials
   */
  credentials: Record<string, string>;

  /**
   * Token expiration time
   */
  expiresAt?: string;

  /**
   * Whether the authentication is valid
   */
  valid: boolean;
}

/**
 * Intelligence API class
 * 
 * Implements PHASE_14: Report Intelligence API from the Phase Compliance Package.
 * Provides RESTful API endpoints for the Report Intelligence System.
 */
export class IntelligenceApi {
  /**
   * Base API URL
   */
  private baseUrl: string;

  /**
   * API rate limits
   */
  private rateLimits: Map<string, ApiRateLimit> = new Map();

  /**
   * Active requests
   */
  private activeRequests: Map<string, ApiRequest> = new Map();

  /**
   * Event handlers
   */
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Authentication handlers
   */
  private authHandlers: Map<string, Function> = new Map();

  /**
   * Initialize the Intelligence API
   * @param baseUrl - Base API URL
   */
  constructor(baseUrl: string = '/api/intelligence') {
    this.baseUrl = baseUrl;
    this.initializeRateLimits();
    this.initializeAuthHandlers();
  }

  /**
   * Make an API request
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param params - Request parameters
   * @param body - Request body
   * @param headers - Additional headers
   * @param token - Authentication token
   * @returns Promise resolving to API response
   */
  async request(
    endpoint: string,
    method: ApiRequest['method'] = 'GET',
    params: Record<string, any> = {},
    body?: any,
    headers: Record<string, string> = {},
    token?: string
  ): Promise<ApiResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      // Check rate limits
      const rateLimit = this.checkRateLimit(requestId);
      if (rateLimit.exceeded) {
        throw this.createApiError('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', 429);
      }

      // Create request
      const apiRequest: ApiRequest = {
        requestId,
        endpoint,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Intelligence-API-Client',
          ...headers
        },
        params,
        body,
        token,
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          ipAddress: '127.0.0.1', // Would get from actual request
          sessionId: this.getSessionId()
        }
      };

      // Store active request
      this.activeRequests.set(requestId, apiRequest);

      // Trigger request event
      this.emit('request', apiRequest);

      // Authenticate if token provided
      if (token) {
        const auth = await this.authenticate(token);
        if (!auth.valid) {
          throw this.createApiError('AUTHENTICATION_FAILED', 'Authentication failed', 401);
        }
      }

      // Make actual HTTP request
      const response = await this.makeHttpRequest(apiRequest);

      // Update rate limit
      this.updateRateLimit(requestId);

      // Create API response
      const apiResponse: ApiResponse = {
        requestId,
        status: response.status,
        headers: response.headers,
        body: response.data,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          processingTime: response.duration || 0,
          responseSize: JSON.stringify(response.data).length
        }
      };

      // Trigger response event
      this.emit('response', apiResponse);

      // Remove from active requests
      this.activeRequests.delete(requestId);

      return apiResponse;

    } catch (error) {
      // Handle API error
      const apiError = this.createApiError(
        'REQUEST_FAILED',
        error instanceof Error ? error.message : 'Unknown error',
        500
      );

      // Trigger error event
      this.emit('error', apiError);

      // Remove from active requests
      this.activeRequests.delete(requestId);

      throw apiError;
    }
  }

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param params - Request parameters
   * @param headers - Additional headers
   * @param token - Authentication token
   * @returns Promise resolving to API response
   */
  async get(
    endpoint: string,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
    token?: string
  ): Promise<ApiResponse> {
    return this.request(endpoint, 'GET', params, undefined, headers, token);
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param params - Request parameters
   * @param headers - Additional headers
   * @param token - Authentication token
   * @returns Promise resolving to API response
   */
  async post(
    endpoint: string,
    body: any,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
    token?: string
  ): Promise<ApiResponse> {
    return this.request(endpoint, 'POST', params, body, headers, token);
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param params - Request parameters
   * @param headers - Additional headers
   * @param token - Authentication token
   * @returns Promise resolving to API response
   */
  async put(
    endpoint: string,
    body: any,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
    token?: string
  ): Promise<ApiResponse> {
    return this.request(endpoint, 'PUT', params, body, headers, token);
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param params - Request parameters
   * @param headers - Additional headers
   * @param token - Authentication token
   * @returns Promise resolving to API response
   */
  async delete(
    endpoint: string,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
    token?: string
  ): Promise<ApiResponse> {
    return this.request(endpoint, 'DELETE', params, undefined, headers, token);
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param params - Request parameters
   * @param headers - Additional headers
   * @param token - Authentication token
   * @returns Promise resolving to API response
   */
  async patch(
    endpoint: string,
    body: any,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
    token?: string
  ): Promise<ApiResponse> {
    return this.request(endpoint, 'PATCH', params, body, headers, token);
  }

  /**
   * Upload a file
   * @param endpoint - API endpoint
   * @param file - File to upload
   * @param params - Request parameters
   * @param headers - Additional headers
   * @param token - Authentication token
   * @returns Promise resolving to API response
   */
  async uploadFile(
    endpoint: string,
    file: File,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
    token?: string
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(endpoint, 'POST', params, formData, {
      ...headers,
      'Content-Type': 'multipart/form-data'
    }, token);
  }

  /**
   * Download a file
   * @param endpoint - API endpoint
   * @param params - Request parameters
   * @param headers - Additional headers
   * @param token - Authentication token
   * @returns Promise resolving to blob data
   */
  async downloadFile(
    endpoint: string,
    params: Record<string, any> = {},
    headers: Record<string, string> = {},
    token?: string
  ): Promise<Blob> {
    const response = await this.get(endpoint, params, headers, token);
    
    if (response.status !== 200) {
      throw this.createApiError('DOWNLOAD_FAILED', 'File download failed', response.status);
    }

    return new Blob([response.body]);
  }

  /**
   * Get API status
   * @returns Promise resolving to API status
   */
  async getStatus(): Promise<ApiResponse> {
    return this.get('/status');
  }

  /**
   * Get API version
   * @returns Promise resolving to API version
   */
  async getVersion(): Promise<ApiResponse> {
    return this.get('/version');
  }

  /**
   * Get API documentation
   * @returns Promise resolving to API documentation
   */
  async getDocumentation(): Promise<ApiResponse> {
    return this.get('/docs');
  }

  /**
   * Add event handler
   * @param event - Event name
   * @param handler - Event handler function
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove event handler
   * @param event - Event name
   * @param handler - Event handler function to remove
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Add authentication handler
   * @param type - Authentication type
   * @param handler - Authentication handler function
   */
  addAuthHandler(type: ApiAuth['type'], handler: Function): void {
    this.authHandlers.set(type, handler);
  }

  /**
   * Get active requests
   * @returns Array of active requests
   */
  getActiveRequests(): ApiRequest[] {
    return Array.from(this.activeRequests.values());
  }

  /**
   * Get rate limits
   * @returns Array of rate limits
   */
  getRateLimits(): ApiRateLimit[] {
    return Array.from(this.rateLimits.values());
  }

  /**
   * Reset rate limits
   */
  resetRateLimits(): void {
    this.rateLimits.clear();
    this.initializeRateLimits();
  }

  /**
   * Generate request ID
   * @returns Unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get session ID
   * @returns Session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('intelligence-api-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('intelligence-api-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Initialize rate limits
   */
  private initializeRateLimits(): void {
    // Default rate limits
    this.rateLimits.set('default', {
      identifier: 'default',
      maxRequests: 100,
      timeWindow: 60000, // 1 minute
      currentRequests: 0,
      resetTime: new Date(Date.now() + 60000).toISOString(),
      exceeded: false
    });

    // High priority rate limits
    this.rateLimits.set('high-priority', {
      identifier: 'high-priority',
      maxRequests: 1000,
      timeWindow: 60000, // 1 minute
      currentRequests: 0,
      resetTime: new Date(Date.now() + 60000).toISOString(),
      exceeded: false
    });
  }

  /**
   * Initialize authentication handlers
   */
  private initializeAuthHandlers(): void {
    // Bearer token handler
    this.addAuthHandler('bearer', async (token: string) => {
      // Validate bearer token
      return {
        type: 'bearer',
        credentials: { token },
        valid: token.length > 0,
        expiresAt: undefined
      };
    });

    // API key handler
    this.addAuthHandler('api-key', async (apiKey: string) => {
      // Validate API key
      return {
        type: 'api-key',
        credentials: { apiKey },
        valid: apiKey.length > 0,
        expiresAt: undefined
      };
    });
  }

  /**
   * Check rate limit for a request
   * @param requestId - Request ID
   * @returns Rate limit information
   */
  private checkRateLimit(requestId: string): ApiRateLimit {
    const rateLimit = this.rateLimits.get('default')!;
    
    // Check if time window has expired
    if (new Date().getTime() > new Date(rateLimit.resetTime).getTime()) {
      rateLimit.currentRequests = 0;
      rateLimit.resetTime = new Date(Date.now() + rateLimit.timeWindow).toISOString();
    }

    // Check if limit exceeded
    rateLimit.exceeded = rateLimit.currentRequests >= rateLimit.maxRequests;
    
    return rateLimit;
  }

  /**
   * Update rate limit after request
   * @param requestId - Request ID
   */
  private updateRateLimit(requestId: string): void {
    const rateLimit = this.rateLimits.get('default')!;
    rateLimit.currentRequests++;
  }

  /**
   * Create API error
   * @param code - Error code
   * @param message - Error message
   * @param status - HTTP status code
   * @returns API error
   */
  private createApiError(code: string, message: string, status: number): ApiError {
    return {
      code,
      message,
      status,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Authenticate request
   * @param token - Authentication token
   * @returns Authentication result
   */
  private async authenticate(token: string): Promise<ApiAuth> {
    // Try different authentication handlers
    for (const [type, handler] of this.authHandlers) {
      try {
        const result = await handler(token);
        if (result.valid) {
          return result;
        }
      } catch (error) {
        console.error(`Authentication failed for type ${type}:`, error);
      }
    }

    return {
      type: 'bearer',
      credentials: { token },
      valid: false
    };
  }

  /**
   * Make HTTP request
   * @param request - API request
   * @returns HTTP response
   */
  private async makeHttpRequest(request: ApiRequest): Promise<any> {
    const startTime = Date.now();
    
    // Build URL with parameters
    const url = new URL(`${this.baseUrl}${request.endpoint}`);
    Object.keys(request.params).forEach(key => {
      url.searchParams.append(key, request.params[key]);
    });

    // Build headers
    const headers: Record<string, string> = { ...request.headers };
    if (request.token) {
      headers['Authorization'] = `Bearer ${request.token}`;
    }

    // Make request
    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.body ? JSON.stringify(request.body) : undefined
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      duration
    };
  }

  /**
   * Emit an event
   * @param event - Event name
   * @param data - Event data
   */
  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
}