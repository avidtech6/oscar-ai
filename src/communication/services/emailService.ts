// Email Service for Communication Hub
// Handles email sending, receiving, and management

import { getSupabase } from '$lib/supabase/client';
import { withRateLimit, SafetyGuardrails } from './rateLimiter';
import type { Email, EmailTemplate, EmailFilter, EmailAttachment } from '../types';

export class EmailService {
  private supabase = getSupabase();

  // Email CRUD Operations
  async getEmails(options: {
    page?: number;
    limit?: number;
    folder?: string;
    search?: string;
    labels?: string[];
  }): Promise<{ emails: Email[]; total: number }> {
    const { page = 1, limit = 50, folder = 'inbox', search, labels } = options;
    const offset = (page - 1) * limit;

    try {
      let query = this.supabase
        .from('emails')
        .select('*', { count: 'exact' })
        .eq('status', folder === 'inbox' ? 'received' : folder)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`subject.ilike.%${search}%,body.ilike.%${search}%,from.ilike.%${search}%`);
      }

      if (labels && labels.length > 0) {
        query = query.contains('labels', labels);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        emails: data as Email[],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  async getEmailById(id: string): Promise<Email | null> {
    try {
      const { data, error } = await this.supabase
        .from('emails')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Email;
    } catch (error) {
      console.error('Error fetching email:', error);
      return null;
    }
  }

  async sendEmail(email: Omit<Email, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<{ success: boolean; data?: Email; error?: string; rateLimit?: any }> {
    try {
      // Get current user ID
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Apply safety guardrails
      const validation = SafetyGuardrails.validateEmailSend({
        to: email.to,
        subject: email.subject,
        body: email.body,
        attachments: email.attachments
      });

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Apply rate limiting
      return await withRateLimit(user.id, 'email_send', async () => {
        const emailToSend = {
          ...email,
          userId: user.id,
          status: 'sent' as const,
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const { data, error } = await this.supabase
          .from('emails')
          .insert([emailToSend])
          .select()
          .single();

        if (error) throw error;

        // TODO: Actually send email via SMTP or email service
        console.log('Email would be sent:', emailToSend);

        return data as Email;
      });
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  }

  async saveDraft(email: Partial<Email>): Promise<Email> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const draft = {
        ...email,
        userId: user.id,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('emails')
        .insert([draft])
        .select()
        .single();

      if (error) throw error;
      return data as Email;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  async updateEmail(id: string, updates: Partial<Email>): Promise<Email> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('emails')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Email;
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }

  async deleteEmail(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('emails')
        .update({ status: 'deleted', updatedAt: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }

  // Email Templates
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('email_templates')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data as EmailTemplate[];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<EmailTemplate> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const templateToCreate = {
        ...template,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('email_templates')
        .insert([templateToCreate])
        .select()
        .single();

      if (error) throw error;
      return data as EmailTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  // Email Filters
  async getFilters(): Promise<EmailFilter[]> {
    try {
      const { data, error } = await this.supabase
        .from('email_filters')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data as EmailFilter[];
    } catch (error) {
      console.error('Error fetching filters:', error);
      return [];
    }
  }

  // Email Stats
  async getEmailStats(): Promise<{
    total: number;
    unread: number;
    sentToday: number;
    receivedToday: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get total emails
      const { count: total } = await this.supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user.id)
        .neq('status', 'deleted');

      // Get unread emails
      const { count: unread } = await this.supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user.id)
        .eq('status', 'received')
        .is('readAt', null);

      // Get emails sent today
      const { count: sentToday } = await this.supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user.id)
        .eq('status', 'sent')
        .gte('sentAt', today.toISOString())
        .lt('sentAt', tomorrow.toISOString());

      // Get emails received today
      const { count: receivedToday } = await this.supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user.id)
        .eq('status', 'received')
        .gte('createdAt', today.toISOString())
        .lt('createdAt', tomorrow.toISOString());

      return {
        total: total || 0,
        unread: unread || 0,
        sentToday: sentToday || 0,
        receivedToday: receivedToday || 0
      };
    } catch (error) {
      console.error('Error fetching email stats:', error);
      return { total: 0, unread: 0, sentToday: 0, receivedToday: 0 };
    }
  }

  // Helper Methods
  async markAsRead(emailId: string): Promise<void> {
    await this.updateEmail(emailId, {
      readAt: new Date().toISOString()
    });
  }

  async applyLabel(emailId: string, label: string): Promise<void> {
    const email = await this.getEmailById(emailId);
    if (!email) return;

    const labels = [...new Set([...email.labels, label])];
    await this.updateEmail(emailId, { labels });
  }

  async moveToFolder(emailId: string, folder: string): Promise<void> {
    await this.updateEmail(emailId, { status: folder as any });
  }
}

// Export singleton instance
export const emailService = new EmailService();