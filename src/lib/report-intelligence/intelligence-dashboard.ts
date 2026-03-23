/**
 * Intelligence Dashboard interfaces
 * 
 * Defines the interfaces for PHASE_13: Report Intelligence Dashboard
 */
export interface DashboardWidget {
  /**
   * Unique identifier for the widget
   */
  widgetId: string;

  /**
   * Widget type
   */
  type: 'metric' | 'chart' | 'table' | 'list' | 'progress' | 'alert';

  /**
   * Widget title
   */
  title: string;

  /**
   * Widget position and size
   */
  layout: {
    row: number;
    col: number;
    width: number;
    height: number;
  };

  /**
   * Widget configuration
   */
  config: Record<string, any>;

  /**
   * Widget data
   */
  data: Record<string, any>;

  /**
   * Widget refresh interval in milliseconds
   */
  refreshInterval: number;

  /**
   * Whether the widget is visible
   */
  visible: boolean;

  /**
   * Widget metadata
   */
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastRefreshed?: string;
    version: string;
  };
}

export interface DashboardLayout {
  /**
   * Dashboard identifier
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
  widgets: DashboardWidget[];

  /**
   * Dashboard layout configuration
   */
  layout: {
    rows: number;
    columns: number;
    gap: number;
    responsive: boolean;
  };

  /**
   * Dashboard theme
   */
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };

  /**
   * Dashboard permissions
   */
  permissions: {
    view: string[];
    edit: string[];
    admin: string[];
  };

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

export interface IntelligenceMetrics {
  /**
   * Total documents processed
   */
  totalDocuments: number;

  /**
   * Documents processed successfully
   */
  successfulDocuments: number;

  /**
   * Documents failed to process
   */
  failedDocuments: number;

  /**
   * Average processing time
   */
  averageProcessingTime: number;

  /**
   * Current active tasks
   */
  activeTasks: number;

  /**
   * Completed tasks in the last hour
   */
  tasksCompletedLastHour: number;

  /**
   * Failed tasks in the last hour
   */
  tasksFailedLastHour: number;

  /**
   * System resource usage
   */
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };

  /**
   * Quality metrics
   */
  qualityMetrics: {
    accuracy: number;
    consistency: number;
    completeness: number;
    timeliness: number;
  };

  /**
   * Timestamp of metrics
   */
  timestamp: string;
}

/**
 * Intelligence Dashboard class
 * 
 * Implements PHASE_13: Report Intelligence Dashboard from the Phase Compliance Package.
 * Provides a comprehensive dashboard for monitoring and managing intelligence operations.
 */
export class IntelligenceDashboard {
  /**
   * Dashboard layout configuration
   */
  private layout: DashboardLayout;

  /**
   * Intelligence metrics
   */
  private metrics: IntelligenceMetrics;

  /**
   * Event handlers
   */
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Refresh interval ID
   */
  private refreshIntervalId: number | null = null;

  /**
   * Initialize the Intelligence Dashboard
   * @param layout - Dashboard layout configuration
   */
  constructor(layout: Partial<DashboardLayout> = {}) {
    this.layout = this.initializeLayout(layout);
    this.metrics = this.initializeMetrics();
    this.initializeDefaultWidgets();
  }

  /**
   * Get dashboard layout
   * @returns Dashboard layout
   */
  getLayout(): DashboardLayout {
    return { ...this.layout };
  }

  /**
   * Update dashboard layout
   * @param layout - New layout configuration
   */
  updateLayout(layout: Partial<DashboardLayout>): void {
    this.layout = { ...this.layout, ...layout };
    this.layout.metadata.updatedAt = new Date().toISOString();
    this.emit('layoutUpdated', this.layout);
  }

  /**
   * Add a widget to the dashboard
   * @param widget - Widget to add
   * @returns Success status
   */
  addWidget(widget: Omit<DashboardWidget, 'widgetId' | 'metadata'>): boolean {
    const widgetId = `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullWidget: DashboardWidget = {
      widgetId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      },
      ...widget
    };

    this.layout.widgets.push(fullWidget);
    this.layout.metadata.updatedAt = new Date().toISOString();
    
    this.emit('widgetAdded', fullWidget);
    return true;
  }

  /**
   * Remove a widget from the dashboard
   * @param widgetId - ID of the widget to remove
   * @returns Success status
   */
  removeWidget(widgetId: string): boolean {
    const index = this.layout.widgets.findIndex(w => w.widgetId === widgetId);
    if (index === -1) {
      return false;
    }

    const widget = this.layout.widgets.splice(index, 1)[0];
    this.layout.metadata.updatedAt = new Date().toISOString();
    
    this.emit('widgetRemoved', widget);
    return true;
  }

  /**
   * Update a widget
   * @param widgetId - ID of the widget to update
   * @param updates - Widget updates
   * @returns Success status
   */
  updateWidget(widgetId: string, updates: Partial<DashboardWidget>): boolean {
    const index = this.layout.widgets.findIndex(w => w.widgetId === widgetId);
    if (index === -1) {
      return false;
    }

    this.layout.widgets[index] = {
      ...this.layout.widgets[index],
      ...updates,
      metadata: {
        ...this.layout.widgets[index].metadata,
        updatedAt: new Date().toISOString()
      }
    };

    this.layout.metadata.updatedAt = new Date().toISOString();
    
    this.emit('widgetUpdated', this.layout.widgets[index]);
    return true;
  }

  /**
   * Get widget by ID
   * @param widgetId - ID of the widget to get
   * @returns Widget or undefined
   */
  getWidget(widgetId: string): DashboardWidget | undefined {
    return this.layout.widgets.find(w => w.widgetId === widgetId);
  }

  /**
   * Get all widgets
   * @returns Array of all widgets
   */
  getWidgets(): DashboardWidget[] {
    return [...this.layout.widgets];
  }

  /**
   * Get intelligence metrics
   * @returns Intelligence metrics
   */
  getMetrics(): IntelligenceMetrics {
    return { ...this.metrics };
  }

  /**
   * Update intelligence metrics
   * @param updates - Metric updates
   */
  updateMetrics(updates: Partial<IntelligenceMetrics>): void {
    this.metrics = { ...this.metrics, ...updates };
    this.metrics.timestamp = new Date().toISOString();
    this.emit('metricsUpdated', this.metrics);
  }

  /**
   * Refresh dashboard data
   */
  refresh(): void {
    // Simulate metrics refresh
    this.refreshMetrics();
    
    // Refresh widget data
    this.refreshWidgets();
    
    this.emit('dashboardRefreshed', { metrics: this.metrics, widgets: this.layout.widgets });
  }

  /**
   * Start auto-refresh
   * @param interval - Refresh interval in milliseconds
   */
  startAutoRefresh(interval: number = 30000): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
    
    this.refreshIntervalId = window.setInterval(() => {
      this.refresh();
    }, interval);
    
    this.emit('autoRefreshStarted', interval);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
      this.emit('autoRefreshStopped');
    }
  }

  /**
   * Export dashboard configuration
   * @returns Dashboard configuration as JSON
   */
  exportConfiguration(): string {
    return JSON.stringify({
      layout: this.layout,
      metrics: this.metrics,
      exportTime: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import dashboard configuration
   * @param config - Configuration JSON string
   * @returns Success status
   */
  importConfiguration(config: string): boolean {
    try {
      const parsed = JSON.parse(config);
      
      if (parsed.layout) {
        this.layout = this.initializeLayout(parsed.layout);
      }
      
      if (parsed.metrics) {
        this.metrics = { ...this.initializeMetrics(), ...parsed.metrics };
      }
      
      this.emit('configurationImported', { layout: this.layout, metrics: this.metrics });
      return true;
    } catch (error) {
      console.error('Failed to import dashboard configuration:', error);
      return false;
    }
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
   * Initialize dashboard layout
   * @param layout - Partial layout configuration
   * @returns Complete layout configuration
   */
  private initializeLayout(layout: Partial<DashboardLayout>): DashboardLayout {
    return {
      dashboardId: layout.dashboardId || `dashboard_${Date.now()}`,
      name: layout.name || 'Intelligence Dashboard',
      description: layout.description || 'Report Intelligence System Dashboard',
      widgets: [],
      layout: {
        rows: layout.layout?.rows || 6,
        columns: layout.layout?.columns || 12,
        gap: layout.layout?.gap || 16,
        responsive: layout.layout?.responsive ?? true,
        ...layout.layout
      },
      theme: {
        primaryColor: layout.theme?.primaryColor || '#007bff',
        secondaryColor: layout.theme?.secondaryColor || '#6c757d',
        backgroundColor: layout.theme?.backgroundColor || '#ffffff',
        textColor: layout.theme?.textColor || '#333333',
        ...layout.theme
      },
      permissions: {
        view: layout.permissions?.view || ['*'],
        edit: layout.permissions?.edit || ['admin'],
        admin: layout.permissions?.admin || ['superadmin'],
        ...layout.permissions
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        owner: layout.metadata?.owner || 'system'
      }
    };
  }

  /**
   * Initialize intelligence metrics
   * @returns Initial metrics
   */
  private initializeMetrics(): IntelligenceMetrics {
    return {
      totalDocuments: 0,
      successfulDocuments: 0,
      failedDocuments: 0,
      averageProcessingTime: 0,
      activeTasks: 0,
      tasksCompletedLastHour: 0,
      tasksFailedLastHour: 0,
      resourceUsage: {
        cpu: 0,
        memory: 0,
        storage: 0
      },
      qualityMetrics: {
        accuracy: 0,
        consistency: 0,
        completeness: 0,
        timeliness: 0
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Initialize default widgets
   */
  private initializeDefaultWidgets(): void {
    // Metrics widget
    this.addWidget({
      type: 'metric',
      title: 'Processing Overview',
      layout: { row: 1, col: 1, width: 4, height: 2 },
      config: {
        metricType: 'summary',
        showTrend: true,
        timeRange: '24h'
      },
      data: {},
      refreshInterval: 30000,
      visible: true
    });

    // Chart widget
    this.addWidget({
      type: 'chart',
      title: 'Processing Trends',
      layout: { row: 1, col: 5, width: 8, height: 3 },
      config: {
        chartType: 'line',
        dataKey: 'processingTime',
        timeRange: '7d'
      },
      data: {},
      refreshInterval: 60000,
      visible: true
    });

    // Progress widget
    this.addWidget({
      type: 'progress',
      title: 'Task Progress',
      layout: { row: 4, col: 1, width: 6, height: 2 },
      config: {
        showPercentage: true,
        animated: true,
        color: 'primary'
      },
      data: {},
      refreshInterval: 5000,
      visible: true
    });

    // Alert widget
    this.addWidget({
      type: 'alert',
      title: 'System Alerts',
      layout: { row: 4, col: 7, width: 6, height: 2 },
      config: {
        alertTypes: ['error', 'warning', 'info'],
        maxAlerts: 10
      },
      data: {},
      refreshInterval: 10000,
      visible: true
    });

    // Table widget
    this.addWidget({
      type: 'table',
      title: 'Recent Documents',
      layout: { row: 6, col: 1, width: 12, height: 2 },
      config: {
        columns: ['id', 'name', 'type', 'status', 'processedAt'],
        sortable: true,
        filterable: true
      },
      data: {},
      refreshInterval: 15000,
      visible: true
    });
  }

  /**
   * Refresh metrics data
   */
  private refreshMetrics(): void {
    // Simulate metrics refresh
    this.metrics.totalDocuments += Math.floor(Math.random() * 10);
    this.metrics.successfulDocuments += Math.floor(Math.random() * 8);
    this.metrics.failedDocuments += Math.floor(Math.random() * 2);
    this.metrics.averageProcessingTime = Math.random() * 5000 + 1000;
    this.metrics.activeTasks = Math.floor(Math.random() * 20);
    this.metrics.tasksCompletedLastHour = Math.floor(Math.random() * 50);
    this.metrics.tasksFailedLastHour = Math.floor(Math.random() * 5);
    
    // Update resource usage
    this.metrics.resourceUsage = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      storage: Math.random() * 100
    };
    
    // Update quality metrics
    this.metrics.qualityMetrics = {
      accuracy: Math.random() * 100,
      consistency: Math.random() * 100,
      completeness: Math.random() * 100,
      timeliness: Math.random() * 100
    };
    
    this.metrics.timestamp = new Date().toISOString();
  }

  /**
   * Refresh widget data
   */
  private refreshWidgets(): void {
    for (const widget of this.layout.widgets) {
      if (widget.visible && widget.refreshInterval > 0) {
        this.refreshWidgetData(widget);
      }
    }
  }

  /**
   * Refresh individual widget data
   * @param widget - Widget to refresh
   */
  private refreshWidgetData(widget: DashboardWidget): void {
    switch (widget.type) {
      case 'metric':
        widget.data = this.refreshMetricData(widget);
        break;
      case 'chart':
        widget.data = this.refreshChartData(widget);
        break;
      case 'table':
        widget.data = this.refreshTableData(widget);
        break;
      case 'progress':
        widget.data = this.refreshProgressData(widget);
        break;
      case 'alert':
        widget.data = this.refreshAlertData(widget);
        break;
      default:
        widget.data = {};
    }
    
    widget.metadata.lastRefreshed = new Date().toISOString();
  }

  /**
   * Refresh metric widget data
   * @param widget - Metric widget
   * @returns Metric data
   */
  private refreshMetricData(widget: DashboardWidget): Record<string, any> {
    return {
      title: widget.title,
      value: this.metrics.totalDocuments,
      trend: this.metrics.successfulDocuments / this.metrics.totalDocuments,
      change: '+12%',
      timestamp: this.metrics.timestamp
    };
  }

  /**
   * Refresh chart widget data
   * @param widget - Chart widget
   * @returns Chart data
   */
  private refreshChartData(widget: DashboardWidget): Record<string, any> {
    const dataPoints = 24;
    const labels = Array.from({ length: dataPoints }, (_, i) => `${i}:00`);
    const data = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 100));
    
    return {
      labels,
      datasets: [{
        label: 'Processing Time',
        data,
        borderColor: this.layout.theme.primaryColor,
        backgroundColor: this.layout.theme.primaryColor + '20',
        tension: 0.4
      }]
    };
  }

  /**
   * Refresh table widget data
   * @param widget - Table widget
   * @returns Table data
   */
  private refreshTableData(widget: DashboardWidget): Record<string, any> {
    const rows = Array.from({ length: 10 }, (_, i) => ({
      id: `doc_${i + 1}`,
      name: `Document ${i + 1}`,
      type: ['Report', 'Analysis', 'Summary'][Math.floor(Math.random() * 3)],
      status: ['completed', 'processing', 'failed'][Math.floor(Math.random() * 3)],
      processedAt: new Date(Date.now() - Math.random() * 86400000).toISOString()
    }));
    
    return {
      columns: widget.config.columns,
      rows
    };
  }

  /**
   * Refresh progress widget data
   * @param widget - Progress widget
   * @returns Progress data
   */
  private refreshProgressData(widget: DashboardWidget): Record<string, any> {
    return {
      progress: Math.floor(Math.random() * 100),
      status: this.metrics.activeTasks > 0 ? 'active' : 'idle',
      activeTasks: this.metrics.activeTasks,
      completedTasks: this.metrics.successfulDocuments
    };
  }

  /**
   * Refresh alert widget data
   * @param widget - Alert widget
   * @returns Alert data
   */
  private refreshAlertData(widget: DashboardWidget): Record<string, any> {
    const alerts = [];
    
    if (this.metrics.tasksFailedLastHour > 0) {
      alerts.push({
        type: 'error',
        message: `${this.metrics.tasksFailedLastHour} tasks failed in the last hour`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (this.metrics.resourceUsage.cpu > 80) {
      alerts.push({
        type: 'warning',
        message: 'High CPU usage detected',
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      alerts: alerts.slice(0, widget.config.maxAlerts || 10)
    };
  }
}