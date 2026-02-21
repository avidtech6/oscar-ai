/**
 * Calendar Service
 * Manages calendar events using Supabase REST API
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$lib/config/keys';

const EVENTS_TABLE_URL = `${SUPABASE_URL}/rest/v1/calendar_events`;
const PROJECTS_TABLE_URL = `${SUPABASE_URL}/rest/v1/projects`;
const CLIENTS_TABLE_URL = `${SUPABASE_URL}/rest/v1/clients`;

/**
 * Calendar event interface matching Supabase schema
 */
export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  event_type: 'site_visit' | 'client_meeting' | 'deadline' | 'team_sync' | 'other';
  color?: string;
  project_id?: string;
  client_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Project interface
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  status: 'active' | 'completed' | 'on_hold';
  created_at?: string;
}

/**
 * Client interface
 */
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
}

/**
 * Fetch all calendar events for the current user
 */
export async function fetchCalendarEvents(): Promise<{
  success: boolean;
  data?: CalendarEvent[];
  error?: string;
}> {
  try {
    const response = await fetch(`${EVENTS_TABLE_URL}?select=*&order=start_time.asc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch calendar events:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data as CalendarEvent[]
    };
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error connecting to Supabase'
    };
  }
}

/**
 * Fetch upcoming events (events starting from today)
 */
export async function fetchUpcomingEvents(limit = 10): Promise<{
  success: boolean;
  data?: CalendarEvent[];
  error?: string;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${EVENTS_TABLE_URL}?select=*&start_time.gte.${today}&order=start_time.asc&limit=${limit}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch upcoming events:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data as CalendarEvent[]
    };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error connecting to Supabase'
    };
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<{
  success: boolean;
  data?: CalendarEvent;
  error?: string;
}> {
  try {
    const response = await fetch(EVENTS_TABLE_URL, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create calendar event:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data[0] as CalendarEvent
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error connecting to Supabase'
    };
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<{
  success: boolean;
  data?: CalendarEvent;
  error?: string;
}> {
  try {
    const response = await fetch(`${EVENTS_TABLE_URL}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update calendar event:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data[0] as CalendarEvent
    };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error connecting to Supabase'
    };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`${EVENTS_TABLE_URL}?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete calendar event:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error connecting to Supabase'
    };
  }
}

/**
 * Fetch all projects
 */
export async function fetchProjects(): Promise<{
  success: boolean;
  data?: Project[];
  error?: string;
}> {
  try {
    const response = await fetch(`${PROJECTS_TABLE_URL}?select=*&order=name.asc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch projects:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data as Project[]
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error connecting to Supabase'
    };
  }
}

/**
 * Fetch all clients
 */
export async function fetchClients(): Promise<{
  success: boolean;
  data?: Client[];
  error?: string;
}> {
  try {
    const response = await fetch(`${CLIENTS_TABLE_URL}?select=*&order=name.asc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch clients:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data as Client[]
    };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error connecting to Supabase'
    };
  }
}

/**
 * Get events for a specific date range
 */
export async function fetchEventsByDateRange(startDate: string, endDate: string): Promise<{
  success: boolean;
  data?: CalendarEvent[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${EVENTS_TABLE_URL}?select=*&start_time.gte.${startDate}&start_time.lte.${endDate}&order=start_time.asc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch events by date range:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data as CalendarEvent[]
    };
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error connecting to Supabase'
    };
  }
}

/**
 * Format event for display
 */
export function formatEventForDisplay(event: CalendarEvent): {
  title: string;
  date: string;
  color: string;
  time: string;
} {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  
  // Format date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let dateStr = '';
  if (startDate.toDateString() === today.toDateString()) {
    dateStr = 'Today';
  } else if (startDate.toDateString() === tomorrow.toDateString()) {
    dateStr = 'Tomorrow';
  } else {
    dateStr = startDate.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  
  // Format time
  const timeStr = startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  
  // Determine color based on event type
  const colorMap: Record<string, string> = {
    'site_visit': 'bg-green-100 text-green-800',
    'client_meeting': 'bg-blue-100 text-blue-800',
    'deadline': 'bg-red-100 text-red-800',
    'team_sync': 'bg-purple-100 text-purple-800',
    'other': 'bg-gray-100 text-gray-800'
  };
  
  return {
    title: event.title,
    date: `${dateStr}, ${timeStr}`,
    color: event.color || colorMap[event.event_type] || 'bg-gray-100 text-gray-800',
    time: timeStr
  };
}