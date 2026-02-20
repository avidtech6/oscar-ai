/**
 * Phase 17: Content Intelligence & Blog Post Engine
 * Scheduling Engine - Recurrence
 * 
 * Recurrence pattern handling and next occurrence calculation.
 */

import type {
  ScheduleItem,
  RecurrencePattern,
  DayOfWeek
} from './types';

/**
 * Recurrence Handler
 */
export class RecurrenceHandler {
  /**
   * Calculate next recurrence date
   */
  public calculateNextRecurrence(item: ScheduleItem): Date | null {
    if (item.recurrence === 'none' || !item.recurrenceEnds) {
      return null;
    }

    const currentDate = item.scheduledFor;
    const nextDate = new Date(currentDate);

    switch (item.recurrence) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case 'custom':
        return this.calculateCustomRecurrence(item);
      default:
        return null;
    }

    // Check if next date is before recurrence ends
    if (nextDate > item.recurrenceEnds) {
      return null;
    }

    return nextDate;
  }

  /**
   * Calculate custom recurrence
   */
  private calculateCustomRecurrence(item: ScheduleItem): Date | null {
    if (!item.recurrenceCustom && !item.recurrenceDays) {
      return null;
    }

    const currentDate = item.scheduledFor;
    const nextDate = new Date(currentDate);

    // Handle cron expression
    if (item.recurrenceCustom && this.isCronExpression(item.recurrenceCustom)) {
      return this.calculateNextCronOccurrence(item.recurrenceCustom, currentDate);
    }

    // Handle day-based recurrence
    if (item.recurrenceDays && item.recurrenceDays.length > 0) {
      return this.calculateNextDayRecurrence(item, currentDate);
    }

    return null;
  }

  /**
   * Calculate next day-based recurrence
   */
  private calculateNextDayRecurrence(item: ScheduleItem, currentDate: Date): Date | null {
    if (!item.recurrenceDays || item.recurrenceDays.length === 0) {
      return null;
    }

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayIndex = currentDate.getDay();
    const currentDayName = daysOfWeek[currentDayIndex] as DayOfWeek;
    
    // Find current day in schedule
    const currentDayIndexInSchedule = item.recurrenceDays.indexOf(currentDayName);
    
    if (currentDayIndexInSchedule === -1) {
      // Current day not in schedule, find next scheduled day
      return this.findNextScheduledDay(item.recurrenceDays, currentDate);
    }
    
    // Find next scheduled day
    let nextDayIndex = currentDayIndexInSchedule + 1;
    let nextDate = new Date(currentDate);
    
    if (nextDayIndex >= item.recurrenceDays.length) {
      // Wrap to beginning of next week
      nextDayIndex = 0;
      nextDate.setDate(nextDate.getDate() + 7); // Move to next week
    }
    
    const nextDayName = item.recurrenceDays[nextDayIndex];
    const targetDayIndex = daysOfWeek.indexOf(nextDayName);
    
    // Calculate days to add
    let daysToAdd = targetDayIndex - currentDayIndex;
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    
    // Check if next date is before recurrence ends
    if (item.recurrenceEnds && nextDate > item.recurrenceEnds) {
      return null;
    }
    
    return nextDate;
  }

  /**
   * Find next scheduled day
   */
  private findNextScheduledDay(scheduledDays: DayOfWeek[], fromDate: Date): Date {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayIndex = fromDate.getDay();
    
    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(fromDate);
      checkDate.setDate(checkDate.getDate() + i);
      const checkDayIndex = checkDate.getDay();
      const checkDayName = daysOfWeek[checkDayIndex] as DayOfWeek;
      
      if (scheduledDays.includes(checkDayName)) {
        return checkDate;
      }
    }
    
    // Should never reach here if scheduledDays is not empty
    const nextDate = new Date(fromDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }

  /**
   * Check if string is a cron expression
   */
  private isCronExpression(expression: string): boolean {
    // Simple cron expression validation
    const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    return cronRegex.test(expression);
  }

  /**
   * Calculate next cron occurrence
   */
  private calculateNextCronOccurrence(cronExpression: string, fromDate: Date): Date | null {
    // Simplified cron parser - in production, use a proper cron library
    try {
      const parts = cronExpression.split(' ');
      if (parts.length !== 5) {
        return null;
      }
      
      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      
      // Start from next minute
      const nextDate = new Date(fromDate);
      nextDate.setMinutes(nextDate.getMinutes() + 1);
      nextDate.setSeconds(0, 0);
      
      // Try to find next occurrence within reasonable bounds
      for (let i = 0; i < 10000; i++) { // Limit iterations
        if (this.matchesCronPart(nextDate.getMinutes(), minute) &&
            this.matchesCronPart(nextDate.getHours(), hour) &&
            this.matchesCronPart(nextDate.getDate(), dayOfMonth) &&
            this.matchesCronPart(nextDate.getMonth() + 1, month) &&
            this.matchesCronPart(nextDate.getDay(), dayOfWeek)) {
          return nextDate;
        }
        
        // Move to next minute
        nextDate.setMinutes(nextDate.getMinutes() + 1);
      }
    } catch (error) {
      console.error('Error parsing cron expression:', error);
    }
    
    return null;
  }

  /**
   * Check if value matches cron part
   */
  private matchesCronPart(value: number, cronPart: string): boolean {
    if (cronPart === '*') {
      return true;
    }
    
    // Handle step values (e.g., */5)
    if (cronPart.startsWith('*/')) {
      const step = parseInt(cronPart.substring(2));
      if (!isNaN(step) && step > 0) {
        return value % step === 0;
      }
    }
    
    // Handle ranges (e.g., 1-5)
    if (cronPart.includes('-')) {
      const [start, end] = cronPart.split('-').map(Number);
      return value >= start && value <= end;
    }
    
    // Handle lists (e.g., 1,3,5)
    if (cronPart.includes(',')) {
      const values = cronPart.split(',').map(Number);
      return values.includes(value);
    }
    
    // Handle single value
    const cronValue = parseInt(cronPart);
    return !isNaN(cronValue) && value === cronValue;
  }

  /**
   * Generate recurrence description
   */
  public getRecurrenceDescription(item: ScheduleItem): string {
    if (item.recurrence === 'none') {
      return 'Does not repeat';
    }
    
    const descriptions: Record<RecurrencePattern, string> = {
      'none': 'Does not repeat',
      'daily': 'Daily',
      'weekly': 'Weekly',
      'biweekly': 'Every two weeks',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly',
      'custom': 'Custom schedule'
    };
    
    let description = descriptions[item.recurrence] || 'Custom';
    
    // Add day information for custom weekly schedules
    if (item.recurrence === 'custom' && item.recurrenceDays && item.recurrenceDays.length > 0) {
      const dayNames = item.recurrenceDays.map(day => 
        day.charAt(0).toUpperCase() + day.slice(1)
      );
      description = `Weekly on ${dayNames.join(', ')}`;
    }
    
    // Add end date if specified
    if (item.recurrenceEnds) {
      description += ` until ${item.recurrenceEnds.toLocaleDateString()}`;
    }
    
    return description;
  }

  /**
   * Get all future occurrences
   */
  public getFutureOccurrences(item: ScheduleItem, limit: number = 10): Date[] {
    if (item.recurrence === 'none') {
      return [item.scheduledFor];
    }
    
    const occurrences: Date[] = [item.scheduledFor];
    let currentItem = { ...item };
    
    for (let i = 0; i < limit - 1; i++) {
      const nextDate = this.calculateNextRecurrence(currentItem);
      if (!nextDate) {
        break;
      }
      
      occurrences.push(nextDate);
      
      // Update current item for next iteration
      currentItem = {
        ...currentItem,
        scheduledFor: nextDate
      };
    }
    
    return occurrences;
  }

  /**
   * Check if date is a recurrence of the item
   */
  public isRecurrenceDate(item: ScheduleItem, date: Date): boolean {
    if (item.recurrence === 'none') {
      return item.scheduledFor.getTime() === date.getTime();
    }
    
    // Check if date matches recurrence pattern
    const occurrences = this.getFutureOccurrences(item, 100); // Check up to 100 occurrences
    return occurrences.some(occurrence => 
      occurrence.getFullYear() === date.getFullYear() &&
      occurrence.getMonth() === date.getMonth() &&
      occurrence.getDate() === date.getDate()
    );
  }

  /**
   * Create recurrence rule string (RFC 5545)
   */
  public createRecurrenceRule(item: ScheduleItem): string {
    if (item.recurrence === 'none') {
      return '';
    }
    
    const rules: string[] = ['RRULE:'];
    
    switch (item.recurrence) {
      case 'daily':
        rules.push('FREQ=DAILY');
        break;
      case 'weekly':
        rules.push('FREQ=WEEKLY');
        if (item.recurrenceDays && item.recurrenceDays.length > 0) {
          const dayMap: Record<DayOfWeek, string> = {
            'sunday': 'SU',
            'monday': 'MO',
            'tuesday': 'TU',
            'wednesday': 'WE',
            'thursday': 'TH',
            'friday': 'FR',
            'saturday': 'SA'
          };
          const byDay = item.recurrenceDays.map(day => dayMap[day]).join(',');
          rules.push(`BYDAY=${byDay}`);
        }
        break;
      case 'biweekly':
        rules.push('FREQ=WEEKLY;INTERVAL=2');
        break;
      case 'monthly':
        rules.push('FREQ=MONTHLY');
        break;
      case 'quarterly':
        rules.push('FREQ=MONTHLY;INTERVAL=3');
        break;
      case 'yearly':
        rules.push('FREQ=YEARLY');
        break;
      case 'custom':
        if (item.recurrenceCustom) {
          return item.recurrenceCustom;
        }
        break;
    }
    
    // Add end date
    if (item.recurrenceEnds) {
      const until = item.recurrenceEnds.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      rules.push(`UNTIL=${until}`);
    }
    
    return rules.join(';');
  }

  /**
   * Parse recurrence rule string
   */
  public parseRecurrenceRule(rule: string): Partial<ScheduleItem> {
    if (!rule) {
      return { recurrence: 'none' };
    }
    
    // Handle cron expressions
    if (this.isCronExpression(rule)) {
      return {
        recurrence: 'custom',
        recurrenceCustom: rule
      };
    }
    
    // Handle RRULE format
    if (rule.startsWith('RRULE:')) {
      const params = new URLSearchParams(rule.substring(6).replace(/;/g, '&'));
      const freq = params.get('FREQ');
      const interval = params.get('INTERVAL');
      const byDay = params.get('BYDAY');
      const until = params.get('UNTIL');
      
      const result: Partial<ScheduleItem> = {};
      
      // Map frequency
      if (freq === 'DAILY') {
        result.recurrence = 'daily';
      } else if (freq === 'WEEKLY') {
        result.recurrence = interval === '2' ? 'biweekly' : 'weekly';
      } else if (freq === 'MONTHLY') {
        result.recurrence = interval === '3' ? 'quarterly' : 'monthly';
      } else if (freq === 'YEARLY') {
        result.recurrence = 'yearly';
      }
      
      // Map days
      if (byDay) {
        const dayMap: Record<string, DayOfWeek> = {
          'SU': 'sunday',
          'MO': 'monday',
          'TU': 'tuesday',
          'WE': 'wednesday',
          'TH': 'thursday',
          'FR': 'friday',
          'SA': 'saturday'
        };
        result.recurrenceDays = byDay.split(',').map(day => dayMap[day]).filter(Boolean) as DayOfWeek[];
      }
      
      // Map end date
      if (until) {
        // Parse ISO-like date from RRULE format
        const year = parseInt(until.substring(0, 4));
        const month = parseInt(until.substring(4, 6)) - 1;
        const day = parseInt(until.substring(6, 8));
        const hour = parseInt(until.substring(9, 11)) || 0;
        const minute = parseInt(until.substring(11, 13)) || 0;
        const second = parseInt(until.substring(13, 15)) || 0;
        
        result.recurrenceEnds = new Date(year, month, day, hour, minute, second);
      }
      
      return result;
    }
    
    return { recurrence: 'none' };
  }
}