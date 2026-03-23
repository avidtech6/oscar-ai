/**
 * Intelligence Monitoring interfaces
 * 
 * Defines the interfaces for PHASE_18: Report Intelligence Monitoring
 */
export interface MonitoringMetric {
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
  type: 'gauge' | 'counter' | 'histogram' | 'summary';

  /**
   * Metric labels
   */
  labels: Record<string, string>;

  /**
   * Metric timestamp
   */
  timestamp: string;

  /**
   * Metric metadata
   */
  metadata: {
    source: string;
    version: string;
    description?: string;
    unit?: string;
  };
}

export interface MonitoringAlert {
  /**
   * Alert ID
   */
  alertId: string;

  /**
   * Alert name
   */
  name: string;

  /**
   * Alert description
   */
  description: string;

  /**
   * Alert severity
   */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /**
   * Alert condition
   */
  condition: AlertCondition;

  /**
   * Alert status
   */
  status: 'active' | 'resolved' | 'suppressed';

  /**
   * Alert metadata
   */
  metadata: {
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    acknowledgedBy?: string;
  };

  /**
   * Alert notifications
   */
  notifications: AlertNotification[];
}

export interface AlertCondition {
  /**
   * Metric name
   */
  metric: string;

  /**
   * Operator
   */
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';

  /**
   * Threshold value
   */
  threshold: number | string | number[];

  /**
   * Duration
   */
  duration?: number; // in seconds

  /**
   * Evaluation frequency
   */
  evaluationFrequency?: number; // in seconds
}

export interface AlertNotification {
  /**
   * Notification ID
   */
  notificationId: string;

  /**
   * Notification type
   */
  type: 'email' | 'webhook' | 'slack' | 'pagerduty' | 'sms';

  /**
   * Notification target
   */
  target: string;

  /**
   * Notification status
   */
  status: 'pending' | 'sent' | 'failed';

  /**
   * Notification metadata
   */
  metadata: {
    sentAt?: string;
    failureReason?: string;
    retryCount: number;
  };
}

export interface MonitoringDashboard {
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
   * Dashboard panels
   */
  panels: MonitoringPanel[];

  /**
   * Dashboard metadata
   */
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    author: string;
  };
}

export interface MonitoringPanel {
  /**
   * Panel ID
   */
  panelId: string;

  /**
   * Panel type
   */
  type: 'graph' | 'singlestat' | 'table' | 'alertlist' | 'text';

  /**
   * Panel title
   */
  title: string;

  /**
   * Panel configuration
   */
  config: Record<string, any>;

  /**
   * Panel position
   */
  position: {
    row: number;
    col: number;
    width: number;
    height: number;
  };
}

export interface HealthCheck {
  /**
   * Health check ID
   */
  healthCheckId: string;

  /**
   * Health check name
   */
  name: string;

  /**
   * Health check type
   */
  type: 'http' | 'tcp' | 'database' | 'custom';

  /**
   * Health check configuration
   */
  config: Record<string, any>;

  /**
   * Health check status
   */
  status: 'healthy' | 'unhealthy' | 'unknown';

  /**
   * Health check metadata
   */
  metadata: {
    lastChecked: string;
    checkInterval: number; // in seconds
    timeout: number; // in seconds
    retries: number;
  };

  /**
   * Health check results
   */
  results: HealthCheckResult[];
}

export interface HealthCheckResult {
  /**
   * Result ID
   */
  resultId: string;

  /**
   * Status
   */
  status: 'success' | 'failure';

  /**
   * Response time
   */
  responseTime: number; // in milliseconds

  /**
   * Error message
   */
  errorMessage?: string;

  /**
   * Timestamp
   */
  timestamp: string;
}

export interface LogEntry {
  /**
   * Log entry ID
   */
  logId: string;

  /**
   * Log level
   */
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';

  /**
   * Log message
   */
  message: string;

  /**
   * Log timestamp
   */
  timestamp: string;

  /**
   * Log source
   */
  source: string;

  /**
   * Log metadata
   */
  metadata: Record<string, any>;

  /**
   * Log tags
   */
  tags: string[];
}

/**
 * Intelligence Monitoring class
 * 
 * Implements PHASE_18: Report Intelligence Monitoring from the Phase Compliance Package.
 * Provides comprehensive monitoring capabilities for the Report Intelligence System.
 */
export class IntelligenceMonitoring {
  /**
   * Metrics storage
   */
  private metrics: Map<string, MonitoringMetric[]> = new Map();

  /**
   * Alerts storage
   */
  private alerts: Map<string, MonitoringAlert> = new Map();

  /**
   * Dashboards storage
   */
  private dashboards: Map<string, MonitoringDashboard> = new Map();

  /**
   * Health checks storage
   */
  private healthChecks: Map<string, HealthCheck> = new Map();

  /**
   * Logs storage
   */
  private logs: Map<string, LogEntry[]> = new Map();

  /**
   * Event handlers
   */
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * Initialize the Intelligence Monitoring system
   */
  constructor() {
    this.initializeDefaultDashboards();
    this.initializeDefaultHealthChecks();
  }

  /**
   * Record a metric
   * @param metric - Metric to record
   * @returns Metric ID
   */
  recordMetric(metric: Omit<MonitoringMetric, 'timestamp' | 'metadata'>): string {
    const metricId = `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullMetric: MonitoringMetric = {
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'intelligence-monitoring',
        version: '1.0.0'
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

    // Check alerts for this metric
    this.checkAlerts(metric.name);

    this.emit('metricRecorded', fullMetric);
    return metricId;
  }

  /**
   * Get metrics
   * @param filters - Filters for metrics
   * @returns Array of metrics
   */
  getMetrics(filters?: {
    name?: string;
    type?: MonitoringMetric['type'];
    startDate?: string;
    endDate?: string;
    labels?: Record<string, string>;
  }): MonitoringMetric[] {
    let allMetrics: MonitoringMetric[] = [];
    
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
      if (filters.labels) {
        allMetrics = allMetrics.filter(metric => {
          return Object.keys(filters.labels!).every(key => 
            metric.labels[key] === filters.labels![key]
          );
        });
      }
    }

    return allMetrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get metric statistics
   * @param metricName - Name of the metric
   * @param timeRange - Time range for statistics
   * @returns Metric statistics
   */
  getMetricStatistics(metricName: string, timeRange: { start: string; end: string }): {
    count: number;
    sum: number;
    average: number;
    min: number;
    max: number;
    latest: number;
  } {
    const metrics = this.getMetrics({
      name: metricName,
      startDate: timeRange.start,
      endDate: timeRange.end
    });

    if (metrics.length === 0) {
      return {
        count: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        latest: 0
      };
    }

    const values = metrics.map(metric => metric.value);
    return {
      count: values.length,
      sum: values.reduce((sum, value) => sum + value, 0),
      average: values.reduce((sum, value) => sum + value, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1]
    };
  }

  /**
   * Create an alert
   * @param alert - Alert to create
   * @returns Alert ID
   */
  createAlert(alert: Omit<MonitoringAlert, 'alertId' | 'metadata'>): string {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullAlert: MonitoringAlert = {
      alertId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      ...alert
    };

    this.alerts.set(alertId, fullAlert);
    this.emit('alertCreated', fullAlert);
    return alertId;
  }

  /**
   * Get an alert
   * @param alertId - ID of the alert to get
   * @returns Monitoring alert or undefined
   */
  getAlert(alertId: string): MonitoringAlert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Get all alerts
   * @param filters - Filters for alerts
   * @returns Array of monitoring alerts
   */
  getAlerts(filters?: {
    severity?: MonitoringAlert['severity'];
    status?: MonitoringAlert['status'];
    startDate?: string;
    endDate?: string;
  }): MonitoringAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (filters) {
      if (filters.severity) {
        alerts = alerts.filter(alert => alert.severity === filters.severity);
      }
      if (filters.status) {
        alerts = alerts.filter(alert => alert.status === filters.status);
      }
      if (filters.startDate) {
        alerts = alerts.filter(alert => alert.metadata.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        alerts = alerts.filter(alert => alert.metadata.createdAt <= filters.endDate!);
      }
    }

    return alerts.sort((a, b) => 
      new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
    );
  }

  /**
   * Update an alert
   * @param alertId - ID of the alert to update
   * @param updates - Alert updates
   * @returns Success status
   */
  updateAlert(alertId: string, updates: Partial<MonitoringAlert>): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    this.alerts.set(alertId, {
      ...alert,
      ...updates,
      metadata: {
        ...alert.metadata,
        updatedAt: new Date().toISOString()
      }
    });

    this.emit('alertUpdated', this.alerts.get(alertId)!);
    return true;
  }

  /**
   * Acknowledge an alert
   * @param alertId - ID of the alert to acknowledge
   * @param acknowledgedBy - User acknowledging the alert
   * @returns Success status
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    this.alerts.set(alertId, {
      ...alert,
      status: 'active',
      metadata: {
        ...alert.metadata,
        updatedAt: new Date().toISOString(),
        acknowledgedBy
      }
    });

    this.emit('alertAcknowledged', this.alerts.get(alertId)!);
    return true;
  }

  /**
   * Resolve an alert
   * @param alertId - ID of the alert to resolve
   * @returns Success status
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    this.alerts.set(alertId, {
      ...alert,
      status: 'resolved',
      metadata: {
        ...alert.metadata,
        updatedAt: new Date().toISOString(),
        resolvedAt: new Date().toISOString()
      }
    });

    this.emit('alertResolved', this.alerts.get(alertId)!);
    return true;
  }

  /**
   * Check alerts for a metric
   * @param metricName - Name of the metric to check
   */
  private checkAlerts(metricName: string): void {
    const alerts = Array.from(this.alerts.values()).filter(
      alert => alert.condition.metric === metricName && alert.status === 'active'
    );

    for (const alert of alerts) {
      const metrics = this.getMetrics({
        name: metricName,
        startDate: new Date(Date.now() - (alert.condition.duration || 0) * 1000).toISOString()
      });

      if (metrics.length === 0) {
        continue;
      }

      const latestMetric = metrics[metrics.length - 1];
      const conditionMet = this.evaluateCondition(alert.condition, latestMetric.value);

      if (conditionMet) {
        this.triggerAlert(alert);
      }
    }
  }

  /**
   * Evaluate alert condition
   * @param condition - Alert condition to evaluate
   * @param value - Metric value to evaluate against
   * @returns Whether condition is met
   */
  private evaluateCondition(condition: AlertCondition, value: number): boolean {
    switch (condition.operator) {
      case 'eq':
        return value === condition.threshold;
      case 'ne':
        return value !== condition.threshold;
      case 'gt':
        return typeof condition.threshold === 'number' && value > condition.threshold;
      case 'gte':
        return typeof condition.threshold === 'number' && value >= condition.threshold;
      case 'lt':
        return typeof condition.threshold === 'number' && value < condition.threshold;
      case 'lte':
        return typeof condition.threshold === 'number' && value <= condition.threshold;
      case 'in':
        return Array.isArray(condition.threshold) && condition.threshold.includes(value);
      case 'not_in':
        return Array.isArray(condition.threshold) && !condition.threshold.includes(value);
      default:
        return false;
    }
  }

  /**
   * Trigger an alert
   * @param alert - Alert to trigger
   */
  private triggerAlert(alert: MonitoringAlert): void {
    this.updateAlert(alert.alertId, {
      status: 'active'
    });

    // Send notifications
    for (const notification of alert.notifications) {
      this.sendNotification(notification, alert);
    }

    this.emit('alertTriggered', alert);
  }

  /**
   * Send a notification
   * @param notification - Notification to send
   * @param alert - Alert related to the notification
   */
  private sendNotification(notification: AlertNotification, alert: MonitoringAlert): void {
    // Placeholder for actual notification logic
    // In a real implementation, this would send the notification via the specified channel
    
    notification.status = 'sent';
    notification.metadata.sentAt = new Date().toISOString();

    this.emit('notificationSent', {
      notification,
      alert
    });
  }

  /**
   * Create a dashboard
   * @param dashboard - Dashboard to create
   * @returns Dashboard ID
   */
  createDashboard(dashboard: Omit<MonitoringDashboard, 'dashboardId' | 'metadata'>): string {
    const dashboardId = `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullDashboard: MonitoringDashboard = {
      dashboardId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        author: 'system'
      },
      ...dashboard
    };

    this.dashboards.set(dashboardId, fullDashboard);
    this.emit('dashboardCreated', fullDashboard);
    return dashboardId;
  }

  /**
   * Get a dashboard
   * @param dashboardId - ID of the dashboard to get
   * @returns Monitoring dashboard or undefined
   */
  getDashboard(dashboardId: string): MonitoringDashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  /**
   * Get all dashboards
   * @returns Array of monitoring dashboards
   */
  getDashboards(): MonitoringDashboard[] {
    return Array.from(this.dashboards.values());
  }

  /**
   * Create a health check
   * @param healthCheck - Health check to create
   * @returns Health check ID
   */
  createHealthCheck(healthCheck: Omit<HealthCheck, 'healthCheckId' | 'metadata' | 'results'>): string {
    const healthCheckId = `healthcheck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullHealthCheck: HealthCheck = {
      healthCheckId,
      metadata: {
        lastChecked: new Date().toISOString(),
        checkInterval: 60,
        timeout: 30,
        retries: 3
      },
      results: [],
      ...healthCheck
    };

    this.healthChecks.set(healthCheckId, fullHealthCheck);
    this.emit('healthCheckCreated', fullHealthCheck);
    return healthCheckId;
  }

  /**
   * Get a health check
   * @param healthCheckId - ID of the health check to get
   * @returns Health check or undefined
   */
  getHealthCheck(healthCheckId: string): HealthCheck | undefined {
    return this.healthChecks.get(healthCheckId);
  }

  /**
   * Get all health checks
   * @returns Array of health checks
   */
  getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Run a health check
   * @param healthCheckId - ID of the health check to run
   * @returns Health check result
   */
  async runHealthCheck(healthCheckId: string): Promise<HealthCheckResult> {
    const healthCheck = this.healthChecks.get(healthCheckId);
    if (!healthCheck) {
      throw new Error('Health check not found');
    }

    const resultId = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      let status: 'success' | 'failure' = 'success';
      let errorMessage: string | undefined;
      let responseTime = 0;

      switch (healthCheck.type) {
        case 'http':
          responseTime = await this.checkHttpHealth(healthCheck.config);
          break;
        case 'tcp':
          responseTime = await this.checkTcpHealth(healthCheck.config);
          break;
        case 'database':
          responseTime = await this.checkDatabaseHealth(healthCheck.config);
          break;
        case 'custom':
          responseTime = await this.checkCustomHealth(healthCheck.config);
          break;
        default:
          status = 'failure';
          errorMessage = `Unknown health check type: ${healthCheck.type}`;
      }

      const result: HealthCheckResult = {
        resultId,
        status,
        responseTime,
        errorMessage,
        timestamp: new Date().toISOString()
      };

      // Update health check results
      healthCheck.results.push(result);
      if (healthCheck.results.length > 100) {
        healthCheck.results = healthCheck.results.slice(-100);
      }

      // Update health check status
      const recentResults = healthCheck.results.slice(-5);
      const successCount = recentResults.filter(r => r.status === 'success').length;
      healthCheck.status = successCount >= 3 ? 'healthy' : 'unhealthy';

      healthCheck.metadata.lastChecked = new Date().toISOString();
      this.healthChecks.set(healthCheckId, healthCheck);

      this.emit('healthCheckResult', {
        healthCheckId,
        result
      });

      return result;
    } catch (error) {
      const result: HealthCheckResult = {
        resultId,
        status: 'failure',
        responseTime: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };

      // Update health check results
      healthCheck.results.push(result);
      if (healthCheck.results.length > 100) {
        healthCheck.results = healthCheck.results.slice(-100);
      }

      // Update health check status
      healthCheck.status = 'unhealthy';
      healthCheck.metadata.lastChecked = new Date().toISOString();
      this.healthChecks.set(healthCheckId, healthCheck);

      this.emit('healthCheckResult', {
        healthCheckId,
        result
      });

      return result;
    }
  }

  /**
   * Check HTTP health
   * @param config - Health check configuration
   * @returns Response time
   */
  private async checkHttpHealth(config: Record<string, any>): Promise<number> {
    const startTime = Date.now();
    
    // Placeholder for actual HTTP health check logic
    // In a real implementation, this would make an HTTP request
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    return Date.now() - startTime;
  }

  /**
   * Check TCP health
   * @param config - Health check configuration
   * @returns Response time
   */
  private async checkTcpHealth(config: Record<string, any>): Promise<number> {
    const startTime = Date.now();
    
    // Placeholder for actual TCP health check logic
    // In a real implementation, this would establish a TCP connection
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    
    return Date.now() - startTime;
  }

  /**
   * Check database health
   * @param config - Health check configuration
   * @returns Response time
   */
  private async checkDatabaseHealth(config: Record<string, any>): Promise<number> {
    const startTime = Date.now();
    
    // Placeholder for actual database health check logic
    // In a real implementation, this would execute a simple query
    
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
    
    return Date.now() - startTime;
  }

  /**
   * Check custom health
   * @param config - Health check configuration
   * @returns Response time
   */
  private async checkCustomHealth(config: Record<string, any>): Promise<number> {
    const startTime = Date.now();
    
    // Placeholder for actual custom health check logic
    // In a real implementation, this would execute the custom function
    
    // Simulate custom delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150));
    
    return Date.now() - startTime;
  }

  /**
   * Log an entry
   * @param log - Log entry to create
   * @returns Log ID
   */
  log(log: Omit<LogEntry, 'logId' | 'timestamp'>): string {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullLog: LogEntry = {
      logId,
      timestamp: new Date().toISOString(),
      ...log
    };

    // Store log by source
    if (!this.logs.has(log.source)) {
      this.logs.set(log.source, []);
    }
    this.logs.get(log.source)!.push(fullLog);

    // Keep only last 1000 logs per source
    const logs = this.logs.get(log.source)!;
    if (logs.length > 1000) {
      this.logs.set(log.source, logs.slice(-1000));
    }

    this.emit('logEntry', fullLog);
    return logId;
  }

  /**
   * Get logs
   * @param filters - Filters for logs
   * @returns Array of log entries
   */
  getLogs(filters?: {
    source?: string;
    level?: LogEntry['level'];
    startDate?: string;
    endDate?: string;
    tags?: string[];
  }): LogEntry[] {
    let allLogs: LogEntry[] = [];
    
    // Collect all logs
    this.logs.forEach(logList => {
      allLogs = allLogs.concat(logList);
    });

    if (filters) {
      if (filters.source) {
        allLogs = allLogs.filter(log => log.source === filters.source);
      }
      if (filters.level) {
        allLogs = allLogs.filter(log => log.level === filters.level);
      }
      if (filters.startDate) {
        allLogs = allLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        allLogs = allLogs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.tags) {
        allLogs = allLogs.filter(log => 
          filters.tags!.some(tag => log.tags.includes(tag))
        );
      }
    }

    return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
   * Initialize default dashboards
   */
  private initializeDefaultDashboards(): void {
    // Default system dashboard
    this.createDashboard({
      name: 'System Overview',
      description: 'Overview of system health and performance',
      panels: [
        {
          panelId: 'system-metrics',
          type: 'graph',
          title: 'System Metrics',
          config: {
            metrics: ['cpu_usage', 'memory_usage', 'disk_usage'],
            timeRange: { hours: 24 }
          },
          position: { row: 0, col: 0, width: 12, height: 8 }
        },
        {
          panelId: 'active-alerts',
          type: 'alertlist',
          title: 'Active Alerts',
          config: {
            severity: ['high', 'critical'],
            limit: 10
          },
          position: { row: 1, col: 0, width: 6, height: 4 }
        },
        {
          panelId: 'health-status',
          type: 'singlestat',
          title: 'Health Status',
          config: {
            metric: 'system_health',
            format: 'percent'
          },
          position: { row: 1, col: 6, width: 6, height: 4 }
        }
      ]
    });

    // Default performance dashboard
    this.createDashboard({
      name: 'Performance',
      description: 'Performance metrics and trends',
      panels: [
        {
          panelId: 'response-times',
          type: 'graph',
          title: 'Response Times',
          config: {
            metrics: ['api_response_time', 'db_query_time'],
            timeRange: { hours: 24 }
          },
          position: { row: 0, col: 0, width: 12, height: 8 }
        },
        {
          panelId: 'throughput',
          type: 'singlestat',
          title: 'Requests/Second',
          config: {
            metric: 'request_rate',
            format: 'number'
          },
          position: { row: 1, col: 0, width: 6, height: 4 }
        },
        {
          panelId: 'error-rate',
          type: 'singlestat',
          title: 'Error Rate',
          config: {
            metric: 'error_rate',
            format: 'percent'
          },
          position: { row: 1, col: 6, width: 6, height: 4 }
        }
      ]
    });
  }

  /**
   * Initialize default health checks
   */
  private initializeDefaultHealthChecks(): void {
    // Default API health check
    this.createHealthCheck({
      name: 'API Health',
      type: 'http',
      config: {
        url: 'http://localhost:3000/health',
        method: 'GET',
        expectedStatus: 200
      },
      status: 'healthy'
    });

    // Default database health check
    this.createHealthCheck({
      name: 'Database Health',
      type: 'database',
      config: {
        query: 'SELECT 1',
        connection: {}
      },
      status: 'healthy'
    });

    // Default system health check
    this.createHealthCheck({
      name: 'System Health',
      type: 'custom',
      config: {
        check: () => Promise.resolve(true)
      },
      status: 'healthy'
    });
  }
}