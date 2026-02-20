/**
 * Phase 17: Content Intelligence & Blog Post Engine
 * Content Calendar Component
 * 
 * Visual calendar interface for managing and viewing scheduled content.
 * Supports monthly, weekly, and daily views, drag-and-drop rescheduling,
 * and integration with scheduling engine.
 */

import type {
  ScheduleItem,
  ScheduleItemType,
  ScheduleStatus
} from '../scheduling/types';

/**
 * Calendar view type
 */
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

/**
 * Calendar event (wrapper around schedule item for display)
 */
export interface CalendarEvent {
  id: string;
  scheduleItemId: string;
  title: string;
  description?: string;
  type: ScheduleItemType;
  status: ScheduleStatus;
  
  // Timing
  start: Date;
  end: Date;
  allDay: boolean;
  
  // Display
  color: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  
  // Metadata
  platforms?: string[];
  priority: number;
  hasContent: boolean;
  hasMedia: boolean;
  
  // Original item reference
  item: ScheduleItem;
}

/**
 * Calendar view configuration
 */
export interface CalendarViewConfig {
  view: CalendarView;
  date: Date;
  timezone: string;
  showWeekends: boolean;
  workingHoursOnly: boolean;
  groupByType: boolean;
  groupByPlatform: boolean;
  showCompleted: boolean;
  showCancelled: boolean;
  colorScheme: 'type' | 'status' | 'platform' | 'priority';
}

/**
 * Calendar filter options
 */
export interface CalendarFilter {
  types?: ScheduleItemType[];
  statuses?: ScheduleStatus[];
  platforms?: string[];
  priorities?: number[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchText?: string;
  hasContent?: boolean;
  hasMedia?: boolean;
}

/**
 * Calendar statistics
 */
export interface CalendarStats {
  totalEvents: number;
  byType: Record<ScheduleItemType, number>;
  byStatus: Record<ScheduleStatus, number>;
  byPlatform: Record<string, number>;
  byDay: Record<string, number>;
  upcoming: number;
  overdue: number;
  completed: number;
  density: number; // Events per day average
}

/**
 * Content Calendar
 */
export class ContentCalendar {
  private events: Map<string, CalendarEvent> = new Map();
  private viewConfig: CalendarViewConfig;
  private filters: CalendarFilter = {};

  constructor(config: Partial<CalendarViewConfig> = {}) {
    this.viewConfig = {
      view: config.view || 'month',
      date: config.date || new Date(),
      timezone: config.timezone || 'UTC',
      showWeekends: config.showWeekends ?? true,
      workingHoursOnly: config.workingHoursOnly ?? false,
      groupByType: config.groupByType ?? false,
      groupByPlatform: config.groupByPlatform ?? false,
      showCompleted: config.showCompleted ?? true,
      showCancelled: config.showCancelled ?? false,
      colorScheme: config.colorScheme || 'type'
    };
  }

  /**
   * Initialize calendar with schedule items
   */
  public async initialize(items: ScheduleItem[]): Promise<void> {
    // Convert schedule items to calendar events
    this.events.clear();
    
    items.forEach(item => {
      const event = this.convertToCalendarEvent(item);
      this.events.set(event.id, event);
    });
  }

  /**
   * Get events for current view
   */
  public getEvents(): CalendarEvent[] {
    let events = Array.from(this.events.values());
    
    // Apply filters
    events = this.applyFilters(events);
    
    // Apply view-specific filtering
    events = this.applyViewFiltering(events);
    
    // Sort by start time
    events.sort((a, b) => a.start.getTime() - b.start.getTime());
    
    return events;
  }

  /**
   * Get events for specific date range
   */
  public getEventsForRange(start: Date, end: Date): CalendarEvent[] {
    return this.getEvents().filter(event => 
      event.start < end && event.end > start
    );
  }

  /**
   * Get events for specific day
   */
  public getEventsForDay(date: Date): CalendarEvent[] {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    
    return this.getEventsForRange(start, end);
  }

  /**
   * Get events for specific week
   */
  public getEventsForWeek(date: Date): CalendarEvent[] {
    const start = this.getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    
    return this.getEventsForRange(start, end);
  }

  /**
   * Get events for specific month
   */
  public getEventsForMonth(date: Date): CalendarEvent[] {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    
    return this.getEventsForRange(start, end);
  }

  /**
   * Add or update event
   */
  public async updateEvent(event: CalendarEvent): Promise<void> {
    this.events.set(event.id, event);
  }

  /**
   * Remove event
   */
  public async removeEvent(eventId: string): Promise<boolean> {
    return this.events.delete(eventId);
  }

  /**
   * Move event to new time
   */
  public async moveEvent(eventId: string, newStart: Date, newEnd: Date): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) {
      return false;
    }

    const updatedEvent = {
      ...event,
      start: newStart,
      end: newEnd,
      item: {
        ...event.item,
        scheduledFor: newStart
      }
    };

    this.events.set(eventId, updatedEvent);
    return true;
  }

  /**
   * Change event status
   */
  public async changeEventStatus(eventId: string, status: ScheduleStatus): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) {
      return false;
    }

    const updatedEvent = {
      ...event,
      status,
      item: {
        ...event.item,
        status
      }
    };

    this.events.set(eventId, updatedEvent);
    return true;
  }

  /**
   * Set calendar view
   */
  public setView(view: CalendarView): void {
    this.viewConfig.view = view;
  }

  /**
   * Set calendar date
   */
  public setDate(date: Date): void {
    this.viewConfig.date = date;
  }

  /**
   * Set filters
   */
  public setFilters(filters: CalendarFilter): void {
    this.filters = filters;
  }

  /**
   * Get calendar statistics
   */
  public getStats(): CalendarStats {
    const events = this.getEvents();
    const now = new Date();
    
    const stats: CalendarStats = {
      totalEvents: events.length,
      byType: {} as Record<ScheduleItemType, number>,
      byStatus: {} as Record<ScheduleStatus, number>,
      byPlatform: {} as Record<string, number>,
      byDay: {},
      upcoming: 0,
      overdue: 0,
      completed: 0,
      density: 0
    };

    // Count by type, status, platform
    events.forEach(event => {
      // Count by type
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
      
      // Count by status
      stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;
      
      // Count by platform
      if (event.platforms) {
        event.platforms.forEach(platform => {
          stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
        });
      }
      
      // Count by day of week
      const dayName = event.start.toLocaleDateString('en-US', { weekday: 'long' });
      stats.byDay[dayName] = (stats.byDay[dayName] || 0) + 1;
      
      // Count upcoming, overdue, completed
      if (event.status === 'published' || event.status === 'completed') {
        stats.completed++;
      } else if (event.start < now) {
        stats.overdue++;
      } else {
        stats.upcoming++;
      }
    });

    // Calculate density (events per day)
    if (events.length > 0) {
      const dates = new Set(events.map(e => e.start.toDateString()));
      stats.density = events.length / dates.size;
    }

    return stats;
  }

  /**
   * Export calendar to various formats
   */
  public async export(format: 'ical' | 'csv' | 'json'): Promise<string> {
    const events = this.getEvents();
    
    switch (format) {
      case 'ical':
        return this.exportToICal(events);
      case 'csv':
        return this.exportToCSV(events);
      case 'json':
        return JSON.stringify(events, null, 2);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Import calendar from various formats
   */
  public async import(format: 'ical' | 'csv' | 'json', data: string): Promise<number> {
    let events: CalendarEvent[];
    
    switch (format) {
      case 'ical':
        events = this.importFromICal(data);
        break;
      case 'csv':
        events = this.importFromCSV(data);
        break;
      case 'json':
        events = JSON.parse(data);
        break;
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
    
    // Add imported events
    events.forEach(event => {
      this.events.set(event.id, event);
    });
    
    return events.length;
  }

  /**
   * Get calendar configuration
   */
  public getConfig(): CalendarViewConfig {
    return { ...this.viewConfig };
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    this.events.clear();
    this.filters = {};
  }

  // Private helper methods

  private convertToCalendarEvent(item: ScheduleItem): CalendarEvent {
    const duration = item.estimatedDuration || 60; // Default 60 minutes
    const end = new Date(item.scheduledFor.getTime() + duration * 60000);
    
    // Determine colors based on configuration
    const colors = this.getEventColors(item);
    
    return {
      id: `calendar-${item.id}`,
      scheduleItemId: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      status: item.status,
      start: item.scheduledFor,
      end,
      allDay: duration >= 24 * 60, // 24+ hours considered all-day
      color: colors.color,
      backgroundColor: colors.backgroundColor,
      textColor: colors.textColor,
      borderColor: colors.borderColor,
      platforms: item.publishTo,
      priority: item.priority,
      hasContent: !!item.content,
      hasMedia: this.hasMedia(item),
      item
    };
  }

  private getEventColors(item: ScheduleItem): {
    color: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  } {
    const colorScheme = this.viewConfig.colorScheme;
    
    if (colorScheme === 'type') {
      return this.getColorsByType(item.type);
    } else if (colorScheme === 'status') {
      return this.getColorsByStatus(item.status);
    } else if (colorScheme === 'platform') {
      return this.getColorsByPlatform(item.publishTo?.[0] || 'default');
    } else {
      return this.getColorsByPriority(item.priority);
    }
  }

  private getColorsByType(type: ScheduleItemType): {
    color: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  } {
    const typeColors: Record<ScheduleItemType, string> = {
      'blog-post': '#4CAF50', // Green
      'social-post': '#2196F3', // Blue
      'newsletter': '#9C27B0', // Purple
      'email': '#FF9800', // Orange
      'task': '#607D8B', // Blue Grey
      'reminder': '#FF5722', // Deep Orange
      'meeting': '#3F51B5', // Indigo
      'event': '#E91E63', // Pink
      'campaign': '#00BCD4', // Cyan
      'automation': '#795548' // Brown
    };
    
    const color = typeColors[type] || '#757575';
    
    return {
      color,
      backgroundColor: `${color}20`, // 20% opacity
      textColor: '#212121',
      borderColor: color
    };
  }

  private getColorsByStatus(status: ScheduleStatus): {
    color: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  } {
    const statusColors: Record<ScheduleStatus, string> = {
      'draft': '#9E9E9E', // Grey
      'scheduled': '#2196F3', // Blue
      'queued': '#FF9800', // Orange
      'processing': '#FFC107', // Amber
      'published': '#4CAF50', // Green
      'failed': '#F44336', // Red
      'cancelled': '#607D8B', // Blue Grey
      'archived': '#795548' // Brown
    };
    
    const color = statusColors[status] || '#757575';
    
    return {
      color,
      backgroundColor: `${color}20`, // 20% opacity
      textColor: '#212121',
      borderColor: color
    };
  }

  private getColorsByPlatform(platform: string): {
    color: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  } {
    const platformColors: Record<string, string> = {
      'wordpress': '#21759B',
      'twitter': '#1DA1F2',
      'linkedin': '#0077B5',
      'facebook': '#1877F2',
      'instagram': '#E4405F',
      'default': '#757575'
    };
    
    const color = platformColors[platform.toLowerCase()] || platformColors.default;
    
    return {
      color,
      backgroundColor: `${color}20`, // 20% opacity
      textColor: '#212121',
      borderColor: color
    };
  }

  private getColorsByPriority(priority: number): {
    color: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  } {
    // Priority 1-10, with 10 being highest
    const hue = 120 - (priority * 12); // Green (120) to Red (0)
    const color = `hsl(${hue}, 70%, 50%)`;
    
    return {
      color,
      backgroundColor: `hsl(${hue}, 70%, 90%)`,
      textColor: '#212121',
      borderColor: color
    };
  }

  private hasMedia(item: ScheduleItem): boolean {
    if (!item.content) return false;
    
    // Check for media in content (simplified)
    const contentStr = JSON.stringify(item.content);
    return contentStr.includes('image') || 
           contentStr.includes('video') || 
           contentStr.includes('media') ||
           contentStr.includes('gallery');
  }

  private applyFilters(events: CalendarEvent[]): CalendarEvent[] {
    let filtered = events;

    // Filter by type
    if (this.filters.types && this.filters.types.length > 0) {
      filtered = filtered.filter(event => this.filters.types!.includes(event.type));
    }

    // Filter by status
    if (this.filters.statuses && this.filters.statuses.length > 0) {
      filtered = filtered.filter(event => this.filters.statuses!.includes(event.status));
    } else {
      // Apply default status filters based on view config
      if (!this.viewConfig.showCompleted) {
        filtered = filtered.filter(event => !['published', 'completed'].includes(event.status));
      }
      if (!this.viewConfig.showCancelled) {
        filtered = filtered.filter(event => event.status !== 'cancelled');
      }
    }

    // Filter by platform
    if (this.filters.platforms && this.filters.platforms.length > 0) {
      filtered = filtered.filter(event => 
        event.platforms && event.platforms.some(platform => 
          this.filters.platforms!.includes(platform)
        )
      );
    }

    // Filter by priority
    if (this.filters.priorities && this.filters.priorities.length > 0) {
      filtered = filtered.filter(event => 
        this.filters.priorities!.includes(event.priority)
      );
    }

    // Filter by date range
    if (this.filters.dateRange) {
      filtered = filtered.filter(event => 
        event.start >= this.filters.dateRange!.start && 
        event.end <= this.filters.dateRange!.end
      );
    }

    // Filter by search text
    if (this.filters.searchText) {
      const searchLower = this.filters.searchText.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        (event.description && event.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by content presence
    if (this.filters.hasContent !== undefined) {
      filtered = filtered.filter(event => event.hasContent === this.filters.hasContent);
    }

    // Filter by media presence
    if (this.filters.hasMedia !== undefined) {
      filtered = filtered.filter(event => event.hasMedia === this.filters.hasMedia);
    }

    return filtered;
  }

  private applyViewFiltering(events: CalendarEvent[]): CalendarEvent[] {
    // Apply view-specific filtering
    if (this.viewConfig.workingHoursOnly) {
      events = events.filter(event => this.isDuringWorkingHours(event));
    }

    return events;
  }

  private getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  private isDuringWorkingHours(event: CalendarEvent): boolean {
    // Simplified check - in production, use proper working hours configuration
    const hour = event.start.getHours();
    return hour >= 9 && hour < 17; // 9 AM to 5 PM
  }

  private exportToICal(events: CalendarEvent[]): string {
    // Simplified iCal export
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Content Intelligence//Content Calendar//EN'
    ];

    events.forEach(event => {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${event.id}`,
        `DTSTAMP:${this.formatICalDate(new Date())}`,
        `DTSTART:${this.formatICalDate(event.start)}`,
        `DTEND:${this.formatICalDate(event.end)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `STATUS:${this.mapStatusToICal(event.status)}`,
        `CATEGORIES:${event.type}`,
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  private exportToCSV(events: CalendarEvent[]): string {
    const headers = [
      'ID',
      'Title',
      'Description',
      'Type',
      'Status',
      'Start',
      'End',
      'Platforms',
      'Priority',
      'Has Content',
      'Has Media'
    ];

    const rows = events.map(event => [
      event.id,
      `"${event.title.replace(/"/g, '""')}"`,
      `"${(event.description || '').replace(/"/g, '""')}"`,
      event.type,
      event.status,
      event.start.toISOString(),
      event.end.toISOString(),
      event.platforms?.join(',') || '',
      event.priority.toString(),
      event.hasContent ? 'Yes' : 'No',
      event.hasMedia ? 'Yes' : 'No'
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private importFromICal(data: string): CalendarEvent[] {
    // Simplified iCal import - in production, use a proper iCal parser
    const events: CalendarEvent[] = [];
    const lines = data.split('\n');
    
    let currentEvent: Partial<CalendarEvent> = {};
    let inEvent = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
      } else if (trimmed === 'END:VEVENT') {
        inEvent = false;
        if (currentEvent.id && currentEvent.title) {
          // Convert to CalendarEvent
          const event = this.createEventFromICal(currentEvent);
          if (event) {
            events.push(event);
          }
        }
      } else if (inEvent) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':');
        
        switch (key) {
          case 'UID':
            currentEvent.id = value;
            break;
          case 'SUMMARY':
            currentEvent.title = value;
            break;
          case 'DESCRIPTION':
            currentEvent.description = value;
            break;
          case 'DTSTART':
            currentEvent.start = this.parseICalDate(value);
            break;
          case 'DTEND':
            currentEvent.end = this.parseICalDate(value);
            break;
          case 'CATEGORIES':
            currentEvent.type = value as ScheduleItemType;
            break;
        }
      }
    }

    return events;
  }

  private importFromCSV(data: string): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const lines = data.split('\n');
    
    if (lines.length < 2) return events;
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index].replace(/^"|"$/g, '');
      });
      
      const event = this.createEventFromCSV(row);
      if (event) {
        events.push(event);
      }
    }

    return events;
  }

  private createEventFromICal(data: Partial<CalendarEvent>): CalendarEvent | null {
    if (!data.id || !data.title || !data.start || !data.end) {
      return null;
    }

    // Create a mock ScheduleItem for the CalendarEvent
    const item: ScheduleItem = {
      id: data.id.replace('calendar-', ''),
      type: data.type || 'task',
      title: data.title,
      description: data.description,
      content: undefined,
      status: 'scheduled',
      scheduledFor: data.start,
      timezone: 'UTC',
      recurrence: 'none',
      autoPublish: false,
      requireApproval: false,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: 5,
      retryCount: 0,
      maxRetries: 3,
      successCount: 0,
      failureCount: 0
    };

    return this.convertToCalendarEvent(item);
  }

  private createEventFromCSV(row: Record<string, string>): CalendarEvent | null {
    if (!row.ID || !row.Title || !row.Start || !row.End) {
      return null;
    }

    // Create a mock ScheduleItem for the CalendarEvent
    const item: ScheduleItem = {
      id: row.ID.replace('calendar-', ''),
      type: (row.Type as ScheduleItemType) || 'task',
      title: row.Title,
      description: row.Description,
      content: undefined,
      status: (row.Status as ScheduleStatus) || 'scheduled',
      scheduledFor: new Date(row.Start),
      timezone: 'UTC',
      recurrence: 'none',
      autoPublish: false,
      requireApproval: false,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: parseInt(row.Priority) || 5,
      retryCount: 0,
      maxRetries: 3,
      successCount: 0,
      failureCount: 0,
      publishTo: row.Platforms ? row.Platforms.split(',').filter(Boolean) : undefined
    };

    return this.convertToCalendarEvent(item);
  }

  private formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private parseICalDate(dateStr: string): Date {
    // Simple iCal date parsing
    if (dateStr.includes('T')) {
      return new Date(dateStr);
    } else {
      // Date only
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      return new Date(year, month, day);
    }
  }

  private mapStatusToICal(status: ScheduleStatus): string {
    const map: Record<ScheduleStatus, string> = {
      'draft': 'TENTATIVE',
      'scheduled': 'CONFIRMED',
      'queued': 'CONFIRMED',
      'processing': 'CONFIRMED',
      'published': 'CONFIRMED',
      'failed': 'CANCELLED',
      'cancelled': 'CANCELLED',
      'archived': 'CANCELLED'
    };
    return map[status] || 'CONFIRMED';
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }
}
