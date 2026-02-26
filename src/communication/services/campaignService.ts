// Campaign Service for Communication Hub
// Handles campaign creation, management, and analytics

import { getSupabase } from '$lib/supabase/client';
import type { Campaign, CampaignRecipient, RecipientList } from '../types';

export class CampaignService {
  private supabase = getSupabase();

  // Campaign CRUD Operations
  async getCampaigns(options: {
    page?: number;
    limit?: number;
    status?: Campaign['status'];
    search?: string;
  }): Promise<{ campaigns: Campaign[]; total: number }> {
    const { page = 1, limit = 20, status, search } = options;
    const offset = (page - 1) * limit;

    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = this.supabase
        .from('campaigns')
        .select('*', { count: 'exact' })
        .eq('userId', user.id)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        campaigns: data as Campaign[],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    try {
      const { data, error } = await this.supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Campaign;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }

  async createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'sentCount' | 'openedCount' | 'clickedCount'>): Promise<Campaign> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const campaignToCreate = {
        ...campaign,
        userId: user.id,
        sentCount: 0,
        openedCount: 0,
        clickedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Cast to any to bypass Supabase type issues
      const { data, error } = await (this.supabase as any)
        .from('campaigns')
        .insert([campaignToCreate])
        .select()
        .single();

      if (error) throw error;
      
      // Convert back to Campaign type
      const result: Campaign = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
        sentAt: data.sentAt ? new Date(data.sentAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined
      };
      
      return result;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Cast to any to bypass Supabase type issues
      const { data, error } = await (this.supabase as any)
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Convert back to Campaign type
      const result: Campaign = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
        sentAt: data.sentAt ? new Date(data.sentAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined
      };
      
      return result;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  // Campaign Actions
  async scheduleCampaign(id: string, scheduledFor: Date): Promise<Campaign> {
    try {
      return await this.updateCampaign(id, {
        status: 'scheduled',
        scheduledFor: scheduledFor  // Use Date object directly
      });
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      throw error;
    }
  }

  async startCampaign(id: string): Promise<Campaign> {
    try {
      // In a real implementation, this would trigger the actual sending process
      return await this.updateCampaign(id, {
        status: 'sending',
        sentAt: new Date()  // Use Date object directly
      });
    } catch (error) {
      console.error('Error starting campaign:', error);
      throw error;
    }
  }

  async cancelCampaign(id: string): Promise<Campaign> {
    try {
      return await this.updateCampaign(id, {
        status: 'cancelled'
      });
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      throw error;
    }
  }

  async completeCampaign(id: string): Promise<Campaign> {
    try {
      return await this.updateCampaign(id, {
        status: 'completed',
        completedAt: new Date()  // Use Date object directly
      });
    } catch (error) {
      console.error('Error completing campaign:', error);
      throw error;
    }
  }

  // Recipient Management
  async getCampaignRecipients(campaignId: string): Promise<CampaignRecipient[]> {
    try {
      const { data, error } = await this.supabase
        .from('campaign_recipients')
        .select('*')
        .eq('campaignId', campaignId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data as CampaignRecipient[];
    } catch (error) {
      console.error('Error fetching campaign recipients:', error);
      return [];
    }
  }

  async addRecipientToCampaign(campaignId: string, recipient: Omit<CampaignRecipient, 'id' | 'campaignId'>): Promise<CampaignRecipient> {
    try {
      const recipientToAdd = {
        ...recipient,
        campaignId,
        createdAt: new Date().toISOString()
      };

      // Cast to any to bypass Supabase type issues
      const { data, error } = await (this.supabase as any)
        .from('campaign_recipients')
        .insert([recipientToAdd])
        .select()
        .single();

      if (error) throw error;
      
      // Convert back to CampaignRecipient type
      const result: CampaignRecipient = {
        ...data,
        createdAt: new Date(data.createdAt),
        sentAt: data.sentAt ? new Date(data.sentAt) : undefined,
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
        openedAt: data.openedAt ? new Date(data.openedAt) : undefined,
        clickedAt: data.clickedAt ? new Date(data.clickedAt) : undefined
      };
      
      return result;
    } catch (error) {
      console.error('Error adding recipient to campaign:', error);
      throw error;
    }
  }

  async updateRecipientStatus(recipientId: string, status: CampaignRecipient['status']): Promise<CampaignRecipient> {
    try {
      // Cast to any to bypass Supabase type issues
      const { data, error } = await (this.supabase as any)
        .from('campaign_recipients')
        .update({ status })
        .eq('id', recipientId)
        .select()
        .single();

      if (error) throw error;
      
      // Convert back to CampaignRecipient type
      const result: CampaignRecipient = {
        ...data,
        createdAt: new Date(data.createdAt),
        sentAt: data.sentAt ? new Date(data.sentAt) : undefined,
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
        openedAt: data.openedAt ? new Date(data.openedAt) : undefined,
        clickedAt: data.clickedAt ? new Date(data.clickedAt) : undefined
      };
      
      return result;
    } catch (error) {
      console.error('Error updating recipient status:', error);
      throw error;
    }
  }

  // Recipient Lists
  async getRecipientLists(): Promise<RecipientList[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('recipient_lists')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      
      // Convert back to RecipientList type
      return data.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      })) as RecipientList[];
    } catch (error) {
      console.error('Error fetching recipient lists:', error);
      return [];
    }
  }

  async createRecipientList(list: Omit<RecipientList, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<RecipientList> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const listToCreate = {
        ...list,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Cast to any to bypass Supabase type issues
      const { data, error } = await (this.supabase as any)
        .from('recipient_lists')
        .insert([listToCreate])
        .select()
        .single();

      if (error) throw error;
      
      // Convert back to RecipientList type
      const result: RecipientList = {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      };
      
      return result;
    } catch (error) {
      console.error('Error creating recipient list:', error);
      throw error;
    }
  }

  // Campaign Analytics
  async getCampaignStats(campaignId: string): Promise<{
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
  }> {
    try {
      const recipients = await this.getCampaignRecipients(campaignId);
      
      const stats = {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      };

      recipients.forEach(recipient => {
        if (recipient.status === 'sent' || recipient.status === 'delivered' || 
            recipient.status === 'opened' || recipient.status === 'clicked') {
          stats.sent++;
        }
        if (recipient.status === 'delivered' || recipient.status === 'opened' || recipient.status === 'clicked') {
          stats.delivered++;
        }
        if (recipient.status === 'opened' || recipient.status === 'clicked') {
          stats.opened++;
        }
        if (recipient.status === 'clicked') {
          stats.clicked++;
        }
        if (recipient.status === 'bounced') {
          stats.bounced++;
        }
        if (recipient.status === 'unsubscribed') {
          stats.unsubscribed++;
        }
      });

      const openRate = stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0;
      const clickRate = stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0;

      return {
        ...stats,
        openRate: parseFloat(openRate.toFixed(2)),
        clickRate: parseFloat(clickRate.toFixed(2))
      };
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        openRate: 0,
        clickRate: 0
      };
    }
  }

  async getOverallCampaignStats(): Promise<{
    totalCampaigns: number;
    activeCampaigns: number;
    scheduledCampaigns: number;
    completedCampaigns: number;
    averageOpenRate: number;
    averageClickRate: number;
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: campaigns, error } = await this.supabase
        .from('campaigns')
        .select('*')
        .eq('userId', user.id);

      if (error) throw error;

      const campaignList = campaigns as Campaign[];
      
      const stats = {
        totalCampaigns: campaignList.length,
        activeCampaigns: campaignList.filter(c => c.status === 'sending').length,
        scheduledCampaigns: campaignList.filter(c => c.status === 'scheduled').length,
        completedCampaigns: campaignList.filter(c => c.status === 'completed').length,
        averageOpenRate: 0,
        averageClickRate: 0
      };

      // Calculate average rates from completed campaigns
      const completedCampaigns = campaignList.filter(c => c.status === 'completed');
      if (completedCampaigns.length > 0) {
        const totalOpenRate = completedCampaigns.reduce((sum, campaign) => {
          const openRate = campaign.recipientCount > 0 ? (campaign.openedCount / campaign.recipientCount) * 100 : 0;
          return sum + openRate;
        }, 0);
        
        const totalClickRate = completedCampaigns.reduce((sum, campaign) => {
          const clickRate = campaign.recipientCount > 0 ? (campaign.clickedCount / campaign.recipientCount) * 100 : 0;
          return sum + clickRate;
        }, 0);

        stats.averageOpenRate = parseFloat((totalOpenRate / completedCampaigns.length).toFixed(2));
        stats.averageClickRate = parseFloat((totalClickRate / completedCampaigns.length).toFixed(2));
      }

      return stats;
    } catch (error) {
      console.error('Error fetching overall campaign stats:', error);
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        scheduledCampaigns: 0,
        completedCampaigns: 0,
        averageOpenRate: 0,
        averageClickRate: 0
      };
    }
  }
}

// Export singleton instance
export const campaignService = new CampaignService();