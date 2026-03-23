/**
 * Intelligence Analytics interfaces
 * 
 * Defines the interfaces for PHASE_16: Report Intelligence Analytics
 */
export interface AnalyticsMetric {
  /**
   * Metric name
   */
  name: string;

  /**
   * Metric value
   */
  value: number;

  /**
   * Metric type
   */
  type: 'count' | 'sum' | 'average' | 'percentage' | 'rate' | 'duration';

  /**
   * Metric unit
   */
  unit?: string;

  /**
   * Metric timestamp
   */
  timestamp: string;

  /**
   * Metric dimensions
   */
  dimensions: Record<string, any>;

  /**
   * Metric metadata
   */
  metadata: {
    source: string;
    version: string;
    tags: string[];
  };
}

export interface AnalyticsEvent {
  /**
   * Event name
   */
  name: string;

  /**
   * Event properties
   */
  properties: Record<string, any>;

  /**
   * Event timestamp
   */
  timestamp: string;

  /**
   * Event user ID
   */
  userId?: string;

  /**
   * Event session ID
   */
  sessionId?: string;

  /**
   * Event type
   */
  type: 'user_action' | 'system_event' | 'error' | 'performance' | 'business';

  /**
   * Event metadata
   */
  metadata: {
    source: string;
    version: string;
    tags: string[];
  };
}

export interface AnalyticsReport {
  /**
   * Report ID
   */
  reportId: string;

  /**
   * Report name
   */
  name: string;

  /**
   * Report type
   */
  type: 'summary' | 'detailed' | 'trend' | 'comparison' | 'forecast';

  /**
   * Report data
   */
  data: AnalyticsMetric[];

  /**
   * Report filters
   */
  filters: Record<string, any>;

  /**
   * Report time range
   */
  timeRange: {
    start: string;
    end: string;
  };

  /**
   * Report metadata
   */
  metadata: {
    generatedAt: string;
    version: string;
    dataSource: string;
  };

  /**
   * Report insights
   */
  insights: {
    trends: string[];
    anomalies: string[];
    recommendations: string[];
  };
}

export interface AnalyticsQuery {
  /**
   * Query name
   */
  name: string;

  /**
   * Query type
   */
  type: 'metric' | 'event' | 'report' | 'trend';

  /**
   * Query dimensions
   */
  dimensions: string[];

  /**
   * Query metrics
   */
  metrics: string[];

  /**
   * Query filters
   */
  filters: Record<string, any>;

  /**
   * Query time range
   */
  timeRange: {
    start: string;
    end: string;
  };

  /**
   * Query aggregation
   */
  aggregation: 'sum' | 'average' | 'count' | 'min' | 'max' | 'none';

  /**
   * Query grouping
   */
  grouping?: string[];

  /**
   * Query sort
   */
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
}

export interface AnalyticsInsight {
  /**
   * Insight ID
   */
  insightId: string;

  /**
   * Insight type
   */
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'recommendation';

  /**
   * Insight description
   */
  description: string;

  /**
   * Insight confidence
   */
  confidence: number;

  /**
   * Insight data
   */
  data: Record<string, any>;

  /**
   * Insight timestamp
   */
  timestamp: string;

  /**
   * Insight status
   */
  status: 'active' | 'review' | 'dismissed' | 'resolved';

  /**
   * Insight metadata
   */
  metadata: {
    source: string;
    version: string;
    tags: string[];
  };
}

export interface DashboardConfig {
  /**
   * Dashboard ID
   */
  dashboardId: string;

  /**
   * Dashboard name
   */
  name: string;

  /**
   * Dashboard description
   */
  description: string;

  /**
   * Dashboard widgets
   */
  widgets: Array<{
    id: string;
    type: 'metric' | 'event' | 'chart' | 'list' | 'table';
    title: string;
    config: Record<string, any>;
    position: {
      row: number;
      col: number;
      width: number;
      height: number;
    };
  }>;

  /**
   * Dashboard layout
   */
  layout: {
    rows: number;
    columns: number;
    grid: string[][];
  };

  /**
   * Dashboard filters
   */
  filters: Record<string, any>;

  /**
   * Dashboard metadata
   */
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    owner: string;
  };
}

/**
 * Intelligence Analytics class
 * 
 * Implements PHASE_16: Report Intelligence Analytics from the Phase Compliance Package.
 * Provides comprehensive analytics capabilities for the Report Intelligence System.
 */
export class IntelligenceAnalytics {
  /**
   * Metrics storage
   */
  private metrics: Map<string, AnalyticsMetric[]> = new Map();

  /**
   * Events storage
   */
  private events: Map<string, AnalyticsEvent[]> = new Map();

  /**
   * Reports storage
   */
  private reports: Map<string, AnalyticsReport> = new Map();

  /**
   * Insights storage
   */
  private insights: Map<string, AnalyticsInsight> = new Map();

  /**
   * Dashboard configurations
   */
  private dashboards: Map<string, DashboardConfig> = new Map();

  /**
   * Event handlers
   */
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize the Intelligence Analytics system
   */
  constructor() {
    this.initializeDefaultDashboards();
  }

  /**
   * Track a metric
   * @param metric - Metric to track
   * @returns Metric ID
   */
  trackMetric(metric: Omit<AnalyticsMetric, 'timestamp' | 'metadata'>): string {
    const metricId = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullMetric: AnalyticsMetric = {
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'intelligence-analytics',
        version: '1.0.0',
        tags: []
      },
      ...metric
    };

    // Store metric by name
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }
    this.metrics.get(metric.name)!.push(fullMetric);

    // Keep only last 1000 metrics per metric name
    const metrics = this.metrics.get(metric.name)!;
    if (metrics.length > 1000) {
      this.metrics.set(metric.name, metrics.slice(-1000));
    }

    this.emit('metricTracked', fullMetric);
    return metricId;
  }

  /**
   * Get metrics
   * @param filters - Filters for metrics
   * @returns Array of metrics
   */
  getMetrics(filters?: {
    name?: string;
    type?: AnalyticsMetric['type'];
    startDate?: string;
    endDate?: string;
    dimensions?: Record<string, any>;
  }): AnalyticsMetric[] {
    let allMetrics: AnalyticsMetric[] = [];
    
    // Collect all metrics
    this.metrics.forEach(metricList => {
      allMetrics = allMetrics.concat(metricList);
    });

    if (filters) {
      if (filters.name) {
        allMetrics = allMetrics.filter(metric => metric.name === filters.name);
      }
      if (filters.type) {
        allMetrics = allMetrics.filter(metric => metric.type === filters.type);
      }
      if (filters.startDate) {
        allMetrics = allMetrics.filter(metric => metric.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        allMetrics = allMetrics.filter(metric => metric.timestamp <= filters.endDate!);
      }
      if (filters.dimensions) {
        allMetrics = allMetrics.filter(metric => {
          return Object.keys(filters.dimensions!).every(key => 
            metric.dimensions[key] === filters.dimensions![key]
          );
        });
      }
    }

    return allMetrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Track an event
   * @param event - Event to track
   * @returns Event ID
   */
  trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'metadata'>): string {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullEvent: AnalyticsEvent = {
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'intelligence-analytics',
        version: '1.0.0',
        tags: []
      },
      ...event
    };

    // Store event by name
    if (!this.events.has(event.name)) {
      this.events.set(event.name, []);
    }
    this.events.get(event.name)!.push(fullEvent);

    // Keep only last 1000 events per event name
    const events = this.events.get(event.name)!;
    if (events.length > 1000) {
      this.events.set(event.name, events.slice(-1000));
    }

    this.emit('eventTracked', fullEvent);
    return eventId;
  }

  /**
   * Get events
   * @param filters - Filters for events
   * @returns Array of events
   */
  getEvents(filters?: {
    name?: string;
    type?: AnalyticsEvent['type'];
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): AnalyticsEvent[] {
    let allEvents: AnalyticsEvent[] = [];
    
    // Collect all events
    this.events.forEach(eventList => {
      allEvents = allEvents.concat(eventList);
    });

    if (filters) {
      if (filters.name) {
        allEvents = allEvents.filter(event => event.name === filters.name);
      }
      if (filters.type) {
        allEvents = allEvents.filter(event => event.type === filters.type);
      }
      if (filters.userId) {
        allEvents = allEvents.filter(event => event.userId === filters.userId);
      }
      if (filters.startDate) {
        allEvents = allEvents.filter(event => event.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        allEvents = allEvents.filter(event => event.timestamp <= filters.endDate!);
      }
    }

    return allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Create an analytics report
   * @param report - Report to create
   * @returns Report ID
   */
  createReport(report: Omit<AnalyticsReport, 'reportId' | 'metadata'>): string {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullReport: AnalyticsReport = {
      reportId,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        dataSource: 'intelligence-analytics'
      },
      ...report
    };

    this.reports.set(reportId, fullReport);
    this.emit('reportCreated', fullReport);
    return reportId;
  }

  /**
   * Get a report
   * @param reportId - ID of the report to get
   * @returns Analytics report or undefined
   */
  getReport(reportId: string): AnalyticsReport | undefined {
    return this.reports.get(reportId);
  }

  /**
   * Get all reports
   * @param filters - Filters for reports
   * @returns Array of analytics reports
   */
  getReports(filters?: {
    type?: AnalyticsReport['type'];
    startDate?: string;
    endDate?: string;
  }): AnalyticsReport[] {
    let reports = Array.from(this.reports.values());

    if (filters) {
      if (filters.type) {
        reports = reports.filter(report => report.type === filters.type);
      }
      if (filters.startDate) {
        reports = reports.filter(report => report.metadata.generatedAt >= filters.startDate!);
      }
      if (filters.endDate) {
        reports = reports.filter(report => report.metadata.generatedAt <= filters.endDate!);
      }
    }

    return reports.sort((a, b) => 
      new Date(b.metadata.generatedAt).getTime() - new Date(a.metadata.generatedAt).getTime()
    );
  }

  /**
   * Execute an analytics query
   * @param query - Query to execute
   * @returns Query results
   */
  executeQuery(query: AnalyticsQuery): AnalyticsMetric[] {
    const metrics = this.getMetrics({
      startDate: query.timeRange.start,
      endDate: query.timeRange.end
    });

    // Filter by query filters
    let filteredMetrics = metrics.filter(metric => {
      return Object.keys(query.filters).every(key => {
        const filterValue = query.filters[key];
        const metricValue = metric.dimensions[key];
        
        if (Array.isArray(filterValue)) {
          return filterValue.includes(metricValue);
        }
        
        return metricValue === filterValue;
      });
    });

    // Group by dimensions if specified
    if (query.grouping && query.grouping.length > 0) {
      const groupedMetrics: Map<string, AnalyticsMetric[]> = new Map();
      
      filteredMetrics.forEach(metric => {
        const groupKey = query.grouping!.map(dim => metric.dimensions[dim]).join('|');
        
        if (!groupedMetrics.has(groupKey)) {
          groupedMetrics.set(groupKey, []);
        }
        groupedMetrics.get(groupKey)!.push(metric);
      });

      // Aggregate grouped metrics
      filteredMetrics = Array.from(groupedMetrics.values()).map(group => {
        return this.aggregateMetrics(group, query.aggregation);
      });
    }

    // Apply aggregation if not grouped
    if (!query.grouping || query.grouping.length === 0) {
      filteredMetrics = [this.aggregateMetrics(filteredMetrics, query.aggregation)];
    }

    // Filter by query metrics
    if (query.metrics.length > 0) {
      filteredMetrics = filteredMetrics.filter(metric => 
        query.metrics.includes(metric.name)
      );
    }

    // Sort results
    if (query.sort && query.sort.length > 0) {
      filteredMetrics.sort((a, b) => {
        for (const sort of query.sort!) {
          const aValue = a.dimensions[sort.field] || a.value;
          const bValue = b.dimensions[sort.field] || b.value;
          
          if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredMetrics;
  }

  /**
   * Generate insights from metrics
   * @param metricName - Name of the metric to analyze
   * @param timeRange - Time range for analysis
   * @returns Array of insights
   */
  generateInsights(metricName: string, timeRange: { start: string; end: string }): AnalyticsInsight[] {
    const metrics = this.getMetrics({
      name: metricName,
      startDate: timeRange.start,
      endDate: timeRange.end
    });

    const insights: AnalyticsInsight[] = [];

    // Generate trend insights
    const trendInsight = this.analyzeTrend(metrics);
    if (trendInsight) {
      insights.push(trendInsight);
    }

    // Generate anomaly insights
    const anomalyInsights = this.analyzeAnomalies(metrics);
    insights.push(...anomalyInsights);

    // Generate correlation insights
    const correlationInsights = this.analyzeCorrelations(metrics);
    insights.push(...correlationInsights);

    return insights;
  }

  /**
   * Create or update a dashboard
   * @param dashboard - Dashboard configuration
   * @returns Dashboard ID
   */
  createOrUpdateDashboard(dashboard: Omit<DashboardConfig, 'dashboardId' | 'metadata'>): string {
    const dashboardId = `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullDashboard: DashboardConfig = {
      dashboardId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        owner: 'system'
      },
      ...dashboard
    };

    this.dashboards.set(dashboardId, fullDashboard);
    this.emit('dashboardUpdated', fullDashboard);
    return dashboardId;
  }

  /**
   * Get a dashboard
   * @param dashboardId - ID of the dashboard to get
   * @returns Dashboard configuration or undefined
   */
  getDashboard(dashboardId: string): DashboardConfig | undefined {
    return this.dashboards.get(dashboardId);
  }

  /**
   * Get all dashboards
   * @returns Array of dashboard configurations
   */
  getDashboards(): DashboardConfig[] {
    return Array.from(this.dashboards.values());
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

  /**
   * Aggregate metrics
   * @param metrics - Metrics to aggregate
   * @param aggregation - Aggregation type
   * @returns Aggregated metric
   */
  private aggregateMetrics(metrics: AnalyticsMetric[], aggregation: AnalyticsQuery['aggregation']): AnalyticsMetric {
    if (metrics.length === 0) {
      return {
        name: 'empty',
        value: 0,
        type: 'count',
        timestamp: new Date().toISOString(),
        dimensions: {},
        metadata: {
          source: 'intelligence-analytics',
          version: '1.0.0',
          tags: []
        }
      };
    }

    const firstMetric = metrics[0];
    let value: number;

    switch (aggregation) {
      case 'sum':
        value = metrics.reduce((sum, metric) => sum + metric.value, 0);
        break;
      case 'average':
        value = metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length;
        break;
      case 'min':
        value = Math.min(...metrics.map(metric => metric.value));
        break;
      case 'max':
        value = Math.max(...metrics.map(metric => metric.value));
        break;
      case 'count':
        value = metrics.length;
        break;
      default:
        value = firstMetric.value;
    }

    return {
      name: firstMetric.name,
      value,
      type: firstMetric.type,
      timestamp: new Date().toISOString(),
      dimensions: this.mergeDimensions(metrics),
      metadata: {
        source: 'intelligence-analytics',
        version: '1.0.0',
        tags: ['aggregated']
      }
    };
  }

  /**
   * Merge dimensions from multiple metrics
   * @param metrics - Metrics to merge dimensions from
   * @returns Merged dimensions
   */
  private mergeDimensions(metrics: AnalyticsMetric[]): Record<string, any> {
    const merged: Record<string, any> = {};
    
    metrics.forEach(metric => {
      Object.keys(metric.dimensions).forEach(key => {
        if (!merged[key] || merged[key] === metric.dimensions[key]) {
          merged[key] = metric.dimensions[key];
        } else {
          merged[key] = 'multiple';
        }
      });
    });

    return merged;
  }

  /**
   * Analyze trend in metrics
   * @param metrics - Metrics to analyze
   * @returns Trend insight or undefined
   */
  private analyzeTrend(metrics: AnalyticsMetric[]): AnalyticsInsight | undefined {
    if (metrics.length < 2) {
      return undefined;
    }

    // Simple trend analysis - compare first and last values
    const firstMetric = metrics[0];
    const lastMetric = metrics[metrics.length - 1];
    
    const change = lastMetric.value - firstMetric.value;
    const changePercentage = (change / firstMetric.value) * 100;
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    let description: string;
    
    if (Math.abs(changePercentage) < 5) {
      trend = 'stable';
      description = `Metric ${firstMetric.name} has remained stable with a ${changePercentage.toFixed(2)}% change`;
    } else if (changePercentage > 0) {
      trend = 'increasing';
      description = `Metric ${firstMetric.name} is increasing by ${changePercentage.toFixed(2)}%`;
    } else {
      trend = 'decreasing';
      description = `Metric ${firstMetric.name} is decreasing by ${Math.abs(changePercentage).toFixed(2)}%`;
    }

    return {
      insightId: `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'trend',
      description,
      confidence: 0.8,
      data: {
        trend,
        change,
        changePercentage,
        firstValue: firstMetric.value,
        lastValue: lastMetric.value
      },
      timestamp: new Date().toISOString(),
      status: 'active',
      metadata: {
        source: 'intelligence-analytics',
        version: '1.0.0',
        tags: ['trend', 'automated']
      }
    };
  }

  /**
   * Analyze anomalies in metrics
   * @param metrics - Metrics to analyze
   * @returns Array of anomaly insights
   */
  private analyzeAnomalies(metrics: AnalyticsMetric[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    
    if (metrics.length < 10) {
      return insights;
    }

    // Simple anomaly detection - identify values that deviate significantly from the mean
    const values = metrics.map(metric => metric.value);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length);
    
    const threshold = 2 * stdDev; // 2 standard deviations
    
    metrics.forEach(metric => {
      const deviation = Math.abs(metric.value - mean);
      
      if (deviation > threshold) {
        insights.push({
          insightId: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'anomaly',
          description: `Metric ${metric.name} has an anomalous value of ${metric.value} (deviation: ${deviation.toFixed(2)})`,
          confidence: 0.9,
          data: {
            value: metric.value,
            mean,
            deviation,
            threshold,
            timestamp: metric.timestamp
          },
          timestamp: new Date().toISOString(),
          status: 'active',
          metadata: {
            source: 'intelligence-analytics',
            version: '1.0.0',
            tags: ['anomaly', 'automated']
          }
        });
      }
    });

    return insights;
  }

  /**
   * Analyze correlations between metrics
   * @param metrics - Metrics to analyze
   * @returns Array of correlation insights
   */
  private analyzeCorrelations(metrics: AnalyticsMetric[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    
    // Simple correlation analysis - this would be more sophisticated in a real implementation
    const metricNames = Array.from(this.metrics.keys());
    
    if (metricNames.length < 2) {
      return insights;
    }

    // Check for potential correlations between different metric types
    for (let i = 0; i < metricNames.length; i++) {
      for (let j = i + 1; j < metricNames.length; j++) {
        const name1 = metricNames[i];
        const name2 = metricNames[j];
        
        const metrics1 = this.getMetrics({ name: name1 });
        const metrics2 = this.getMetrics({ name: name2 });
        
        if (metrics1.length > 0 && metrics2.length > 0) {
          insights.push({
            insightId: `correlation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'correlation',
            description: `Potential correlation detected between ${name1} and ${name2}`,
            confidence: 0.6,
            data: {
              metric1: name1,
              metric2: name2,
              count1: metrics1.length,
              count2: metrics2.length
            },
            timestamp: new Date().toISOString(),
            status: 'active',
            metadata: {
              source: 'intelligence-analytics',
              version: '1.0.0',
              tags: ['correlation', 'automated']
            }
          });
        }
      }
    }

    return insights;
  }

  /**
   * Initialize default dashboards
   */
  private initializeDefaultDashboards(): void {
    // Default intelligence dashboard
    this.createOrUpdateDashboard({
      name: 'Intelligence Overview',
      description: 'Overview of intelligence system metrics and performance',
      widgets: [
        {
          id: 'metrics-summary',
          type: 'metric',
          title: 'Metrics Summary',
          config: {
            metricNames: ['processing_time', 'accuracy', 'compliance_score'],
            aggregation: 'average'
          },
          position: { row: 0, col: 0, width: 6, height: 4 }
        },
        {
          id: 'events-timeline',
          type: 'event',
          title: 'Events Timeline',
          config: {
            eventTypes: ['user_action', 'system_event'],
            timeRange: { hours: 24 }
          },
          position: { row: 0, col: 6, width: 6, height: 4 }
        },
        {
          id: 'performance-chart',
          type: 'chart',
          title: 'Performance Trends',
          config: {
            metricName: 'processing_time',
            timeRange: { days: 7 },
            chartType: 'line'
          },
          position: { row: 1, col: 0, width: 12, height: 6 }
        }
      ],
      layout: {
        rows: 2,
        columns: 12,
        grid: [
          ['metrics-summary', 'events-timeline'],
          ['performance-chart', 'performance-chart']
        ]
      },
      filters: {}
    });

    // Default compliance dashboard
    this.createOrUpdateDashboard({
      name: 'Compliance Dashboard',
      description: 'Compliance monitoring and reporting dashboard',
      widgets: [
        {
          id: 'compliance-score',
          type: 'metric',
          title: 'Compliance Score',
          config: {
            metricNames: ['compliance_score'],
            aggregation: 'average'
          },
          position: { row: 0, col: 0, width: 4, height: 4 }
        },
        {
          id: 'violations-list',
          type: 'list',
          title: 'Recent Violations',
          config: {
            limit: 10,
            sortBy: 'timestamp',
            sortOrder: 'desc'
          },
          position: { row: 0, col: 4, width: 8, height: 4 }
        },
        {
          id: 'compliance-trends',
          type: 'chart',
          title: 'Compliance Trends',
          config: {
            metricName: 'compliance_score',
            timeRange: { days: 30 },
            chartType: 'line'
          },
          position: { row: 1, col: 0, width: 12, height: 6 }
        }
      ],
      layout: {
        rows: 2,
        columns: 12,
        grid: [
          ['compliance-score', 'violations-list'],
          ['compliance-trends', 'compliance-trends']
        ]
      },
      filters: {}
    });
  }
}