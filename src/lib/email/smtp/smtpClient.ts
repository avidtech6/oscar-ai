/**
 * SMTP Client Wrapper (nodemailer)
 * Provides a clean, promise-based interface for SMTP operations
 * 
 * Note: This is a placeholder implementation. In production, install nodemailer:
 * npm install nodemailer
 */

import { SmtpConnectionState } from './smtpTypes';
import type { 
  SmtpConnectionConfig, 
  EmailMessage, 
  SendEmailOptions, 
  SendEmailResult,
  SmtpConnectionStatus,
  OAuth2Config,
  SmtpAuthConfig
} from './smtpTypes';

// Mock types for development
interface MockTransport {
  sendMail(message: any, callback: (error: any, info: any) => void): void;
  verify(callback: (error: any, success: boolean) => void): void;
  close(): void;
}

interface MockNodemailer {
  createTransport(config: any): MockTransport;
}

// Mock nodemailer for development
class MockNodemailerImpl {
  createTransport(config: any): MockTransport {
    return {
      sendMail: (message, callback) => {
        setTimeout(() => {
          callback(null, {
            messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            response: '250 OK',
            envelope: {
              from: message.from,
              to: Array.isArray(message.to) ? message.to : [message.to]
            },
            accepted: Array.isArray(message.to) ? message.to : [message.to],
            rejected: []
          });
        }, 100);
      },
      verify: (callback) => {
        setTimeout(() => callback(null, true), 50);
      },
      close: () => {}
    };
  }
}

export class SmtpClient {
  private transport: MockTransport | null = null;
  private status: SmtpConnectionStatus = {
    state: SmtpConnectionState.DISCONNECTED
  };
  private nodemailer: MockNodemailerImpl;

  constructor(private config: SmtpConnectionConfig) {
    this.nodemailer = new MockNodemailerImpl();
  }

  /**
   * Create and verify SMTP transport
   */
  async connect(): Promise<void> {
    try {
      this.updateStatus(SmtpConnectionState.CONNECTING);
      
      // Create transport
      const transportConfig = this.createTransportConfig();
      this.transport = this.nodemailer.createTransport(transportConfig);
      
      // Verify connection
      await this.verifyConnection();
      
      this.updateStatus(SmtpConnectionState.CONNECTED);
    } catch (error) {
      this.updateStatus(SmtpConnectionState.ERROR, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transport) {
      throw new Error('Transport not initialized');
    }

    return new Promise((resolve, reject) => {
      this.transport!.verify((error, success) => {
        if (error) {
          this.updateStatus(SmtpConnectionState.ERROR, error.message);
          reject(error);
        } else {
          this.updateStatus(SmtpConnectionState.AUTHENTICATED);
          resolve(success);
        }
      });
    });
  }

  /**
   * Send email
   */
  async sendEmail(message: EmailMessage, options: SendEmailOptions = {}): Promise<SendEmailResult> {
    if (!this.transport) {
      await this.connect();
    }

    // Validate message
    const validation = this.validateMessage(message);
    if (!validation.valid) {
      return {
        success: false,
        accepted: [],
        rejected: Array.isArray(message.to) ? message.to.map(t => typeof t === 'string' ? t : t.address) : [typeof message.to === 'string' ? message.to : message.to.address],
        error: validation.errors.join(', ')
      };
    }

    return new Promise((resolve, reject) => {
      this.transport!.sendMail({
        from: this.formatAddress(message.from),
        to: this.formatAddresses(message.to),
        cc: message.cc ? this.formatAddresses(message.cc) : undefined,
        bcc: message.bcc ? this.formatAddresses(message.bcc) : undefined,
        replyTo: message.replyTo ? this.formatAddresses(message.replyTo) : undefined,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments,
        headers: message.headers,
        priority: message.priority,
        messageId: message.messageId,
        inReplyTo: message.inReplyTo,
        references: message.references
      }, (error: any, info: any) => {
        if (error) {
          this.updateStatus(SmtpConnectionState.ERROR, error.message);
          reject(error);
        } else {
          this.updateStatus(SmtpConnectionState.AUTHENTICATED);
          resolve({
            success: true,
            messageId: info.messageId,
            response: info.response,
            envelope: info.envelope,
            accepted: info.accepted,
            rejected: info.rejected,
            pending: info.pending
          });
        }
      });
    });
  }

  /**
   * Close SMTP connection
   */
  async disconnect(): Promise<void> {
    if (this.transport) {
      this.transport.close();
      this.transport = null;
    }
    
    this.updateStatus(SmtpConnectionState.DISCONNECTED);
  }

  /**
   * Get current connection status
   */
  getStatus(): SmtpConnectionStatus {
    return { ...this.status };
  }

  /**
   * Check if connected and authenticated
   */
  isConnected(): boolean {
    return this.transport !== null && 
           this.status.state === SmtpConnectionState.AUTHENTICATED;
  }

  /**
   * Create OAuth2 transport (placeholder)
   */
  async createOAuth2Transport(oauthConfig: OAuth2Config): Promise<void> {
    // In a real implementation, this would create an OAuth2 transport
    // For now, just update status
    this.updateStatus(SmtpConnectionState.CONNECTED);
    
    // Mock OAuth2 transport
    const transportConfig = {
      service: 'gmail', // Example
      auth: {
        type: 'OAuth2',
        user: oauthConfig.user,
        clientId: oauthConfig.clientId,
        clientSecret: oauthConfig.clientSecret,
        refreshToken: oauthConfig.refreshToken,
        accessToken: oauthConfig.accessToken
      }
    };
    
    this.transport = this.nodemailer.createTransport(transportConfig);
    await this.verifyConnection();
  }

  // Private methods

  private updateStatus(state: SmtpConnectionState, error?: string): void {
    this.status = {
      state,
      lastActivity: new Date(),
      error
    };
  }

  private createTransportConfig(): any {
    const config: any = {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth,
      tls: this.config.tls,
      pool: this.config.pool,
      maxConnections: this.config.maxConnections,
      rateLimit: this.config.rateLimit,
      timeout: this.config.timeout || 30000
    };

    if (this.config.requireTLS) {
      config.requireTLS = true;
    }

    return config;
  }

  private validateMessage(message: EmailMessage): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!message.from) {
      errors.push('Missing "from" address');
    }

    if (!message.to) {
      errors.push('Missing "to" address(es)');
    }

    if (!message.subject?.trim()) {
      errors.push('Missing or empty subject');
    }

    if (!message.text && !message.html) {
      errors.push('Missing message body (both text and html are empty)');
    }

    // Validate email format (simple check)
    const validateEmailFormat = (email: any): boolean => {
      if (typeof email === 'string') {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }
      if (email && typeof email === 'object' && email.address) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.address);
      }
      return false;
    };

    // Validate from address
    if (message.from && !validateEmailFormat(message.from)) {
      errors.push('Invalid "from" email format');
    }

    // Validate recipients
    const recipients = Array.isArray(message.to) ? message.to : [message.to];
    for (const recipient of recipients) {
      if (!validateEmailFormat(recipient)) {
        errors.push(`Invalid recipient email format: ${JSON.stringify(recipient)}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private formatAddress(address: string | { name?: string; address: string }): string {
    if (typeof address === 'string') {
      return address;
    }
    if (address.name) {
      return `"${address.name}" <${address.address}>`;
    }
    return address.address;
  }

  private formatAddresses(addresses: string | { name?: string; address: string } | Array<string | { name?: string; address: string }>): string | string[] {
    if (Array.isArray(addresses)) {
      return addresses.map(addr => this.formatAddress(addr));
    }
    return this.formatAddress(addresses);
  }
}