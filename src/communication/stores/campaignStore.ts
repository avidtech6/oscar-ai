// Campaign Store for Communication Hub
// Manages campaign state and actions

import { writable, derived } from 'svelte/store';
import { campaignService } from '../services/campaignService';
import type { Campaign, CampaignRecipient, RecipientList } from '../types';

// Campaign state
interface CampaignState {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  recipientLists: RecipientList[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: CampaignState = {
  campaigns: [],
  currentCampaign: null,
  recipientLists: [],
  isLoading: false,
  error: null
};

// Create store
function createCampaignStore() {
  const { subscribe, set, update } = writable<CampaignState>(initialState);

  return {
    subscribe,

    // Load campaigns
    async loadCampaigns(options?: { status?: Campaign['status']; search?: string }) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const { campaigns } = await campaignService.getCampaigns({
          page: 1,
          limit: 100,
          ...options
        });
        
        update(state => ({
          ...state,
          campaigns,
          isLoading: false
        }));
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load campaigns'
        }));
      }
    },

    // Load recipient lists
    async loadRecipientLists() {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const recipientLists = await campaignService.getRecipientLists();
        
        update(state => ({
          ...state,
          recipientLists,
          isLoading: false
        }));
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load recipient lists'
        }));
      }
    },

    // Set current campaign
    setCurrentCampaign(campaign: Campaign | null) {
      update(state => ({ ...state, currentCampaign: campaign }));
    },

    // Create campaign
    async createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'sentCount' | 'openedCount' | 'clickedCount'>) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const newCampaign = await campaignService.createCampaign(campaignData);
        
        update(state => ({
          ...state,
          campaigns: [newCampaign, ...state.campaigns],
          currentCampaign: newCampaign,
          isLoading: false
        }));
        
        return newCampaign;
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create campaign'
        }));
        throw error;
      }
    },

    // Update campaign
    async updateCampaign(id: string, updates: Partial<Campaign>) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const updatedCampaign = await campaignService.updateCampaign(id, updates);
        
        update(state => ({
          ...state,
          campaigns: state.campaigns.map(campaign =>
            campaign.id === id ? updatedCampaign : campaign
          ),
          currentCampaign: state.currentCampaign?.id === id ? updatedCampaign : state.currentCampaign,
          isLoading: false
        }));
        
        return updatedCampaign;
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update campaign'
        }));
        throw error;
      }
    },

    // Delete campaign
    async deleteCampaign(id: string) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        await campaignService.deleteCampaign(id);
        
        update(state => ({
          ...state,
          campaigns: state.campaigns.filter(campaign => campaign.id !== id),
          currentCampaign: state.currentCampaign?.id === id ? null : state.currentCampaign,
          isLoading: false
        }));
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete campaign'
        }));
        throw error;
      }
    },

    // Schedule campaign
    async scheduleCampaign(id: string, scheduledFor: Date) {
      return this.updateCampaign(id, {
        status: 'scheduled',
        scheduledFor
      });
    },

    // Start campaign
    async startCampaign(id: string) {
      return this.updateCampaign(id, {
        status: 'sending',
        sentAt: new Date()
      });
    },

    // Cancel campaign
    async cancelCampaign(id: string) {
      return this.updateCampaign(id, {
        status: 'cancelled'
      });
    },

    // Complete campaign
    async completeCampaign(id: string) {
      return this.updateCampaign(id, {
        status: 'completed',
        completedAt: new Date()
      });
    },

    // Create recipient list
    async createRecipientList(listData: Omit<RecipientList, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const newList = await campaignService.createRecipientList(listData);
        
        update(state => ({
          ...state,
          recipientLists: [newList, ...state.recipientLists],
          isLoading: false
        }));
        
        return newList;
      } catch (error) {
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create recipient list'
        }));
        throw error;
      }
    },

    // Reset state
    reset() {
      set(initialState);
    }
  };
}

export const campaignStore = createCampaignStore();

// Derived stores
export const draftCampaigns = derived(campaignStore, $store =>
  $store.campaigns.filter(campaign => campaign.status === 'draft')
);

export const scheduledCampaigns = derived(campaignStore, $store =>
  $store.campaigns.filter(campaign => campaign.status === 'scheduled')
);

export const activeCampaigns = derived(campaignStore, $store =>
  $store.campaigns.filter(campaign => campaign.status === 'sending')
);

export const completedCampaigns = derived(campaignStore, $store =>
  $store.campaigns.filter(campaign => campaign.status === 'completed')
);

export const campaignStats = derived(campaignStore, $store => {
  const campaigns = $store.campaigns;
  
  return {
    total: campaigns.length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    active: campaigns.filter(c => c.status === 'sending').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    cancelled: campaigns.filter(c => c.status === 'cancelled').length
  };
});