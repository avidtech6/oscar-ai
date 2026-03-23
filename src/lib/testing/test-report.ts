/**
 * Test Report for Oscar AI Phase Compliance Package
 * 
 * This file implements the TestReport interface and related utilities for Phase 20: Full System Testing & Debugging.
 * It provides test reporting capabilities.
 * 
 * File: src/lib/testing/test-report.ts
 * Generated as part of Oscar AI Phase Compliance Package implementation
 */

export interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  details?: any;
  assertions: {
    total: number;
    passed: number;
    failed: number;
  };
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestResult[];
  config: {
    timeout: number;
    retries: number;
    parallel: boolean;
  };
}

export interface TestReport {
  id: string;
  suiteId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    successRate: number;
  };
  results: TestResult[];
  systemInfo: {
    version: string;
    environment: string;
    timestamp: Date;
  };
  debugInfo?: {
    sessionId: string;
    errors: number;
    warnings: number;
    memoryUsage: number;
  };
}

export interface TestReportConfig {
  includeDebugInfo: boolean;
  format: 'json' | 'html' | 'xml';
  includeDetails: boolean;
  includeStackTraces: boolean;
}

/**
 * Test Report utilities and formatter
 */
export class TestReportFormatter {
  /**
   * Format test report as JSON
   */
  static formatAsJSON(report: TestReport, config: TestReportConfig = {
    includeDebugInfo: false,
    format: 'json',
    includeDetails: true,
    includeStackTraces: false
  }): string {
    const reportData = this.sanitizeReport(report, config);
    return JSON.stringify(reportData, null, 2);
  }
  
  /**
   * Format test report as HTML
   */
  static formatAsHTML(report: TestReport, config: TestReportConfig = {
    includeDebugInfo: false,
    format: 'html',
    includeDetails: true,
    includeStackTraces: false
  }): string {
    const summary = report.summary;
    const successClass = summary.successRate >= 90 ? 'success' : 
                        summary.successRate >= 70 ? 'warning' : 'danger';
    
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${report.suiteId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .summary-card { flex: 1; padding: 15px; border-radius: 5px; text-align: center; }
        .success { background: #d4edda; color: #155724; }
        .warning { background: #fff3cd; color: #856404; }
        .danger { background: #f8d7da; color: #721c24; }
        .test-result { border: 1px solid #dee2e6; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .passed { border-left: 4px solid #28a745; }
        .failed { border-left: 4px solid #dc3545; }
        .skipped { border-left: 4px solid #ffc107; }
        .running { border-left: 4px solid #17a2b8; }
        .test-details { margin-top: 10px; font-size: 0.9em; color: #6c757d; }
        .error { background: #f8d7da; padding: 10px; border-radius: 3px; margin-top: 10px; }
        .assertions { margin-top: 10px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Report</h1>
        <p><strong>Suite:</strong> ${report.suiteId}</p>
        <p><strong>Duration:</strong> ${this.formatDuration(report.duration)}</p>
        <p><strong>Environment:</strong> ${report.systemInfo.environment}</p>
        <p><strong>Version:</strong> ${report.systemInfo.version}</p>
        <p><strong>Generated:</strong> ${report.systemInfo.timestamp.toISOString()}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card ${successClass}">
            <h3>Overall Success</h3>
            <p>${summary.successRate.toFixed(1)}%</p>
        </div>
        <div class="summary-card">
            <h3>Total Tests</h3>
            <p>${summary.total}</p>
        </div>
        <div class="summary-card success">
            <h3>Passed</h3>
            <p>${summary.passed}</p>
        </div>
        <div class="summary-card danger">
            <h3>Failed</h3>
            <p>${summary.failed}</p>
        </div>
        <div class="summary-card warning">
            <h3>Skipped</h3>
            <p>${summary.skipped}</p>
        </div>
    </div>
    
    <h2>Test Results</h2>
`;

    if (config.includeDebugInfo && report.debugInfo) {
      html += `
    <h2>Debug Information</h2>
    <div class="test-result">
        <p><strong>Session ID:</strong> ${report.debugInfo.sessionId}</p>
        <p><strong>Errors:</strong> ${report.debugInfo.errors}</p>
        <p><strong>Warnings:</strong> ${report.debugInfo.warnings}</p>
        <p><strong>Memory Usage:</strong> ${this.formatBytes(report.debugInfo.memoryUsage)}</p>
    </div>
`;
    }

    report.results.forEach(result => {
      const statusClass = result.status;
      html += `
    <div class="test-result ${statusClass}">
        <h3>${result.name}</h3>
        <p><strong>Status:</strong> ${result.status.toUpperCase()}</p>
        <p><strong>Duration:</strong> ${this.formatDuration(result.duration)}</p>
        <p><strong>Start Time:</strong> ${result.startTime.toISOString()}</p>
`;

      if (result.endTime) {
        html += `        <p><strong>End Time:</strong> ${result.endTime.toISOString()}</p>`;
      }

      if (result.error) {
        html += `
        <div class="error">
            <strong>Error:</strong> ${result.error}
        </div>
`;
      }

      if (config.includeDetails && result.details) {
        html += `
        <div class="test-details">
            <strong>Details:</strong> ${JSON.stringify(result.details, null, 2)}
        </div>
`;
      }

      html += `
        <div class="assertions">
            <strong>Assertions:</strong> ${result.assertions.passed}/${result.assertions.total} passed
        </div>
    </div>
`;
    });

    html += `
</body>
</html>`;

    return html;
  }
  
  /**
   * Format test report as XML
   */
  static formatAsXML(report: TestReport, config: TestReportConfig = {
    includeDebugInfo: false,
    format: 'xml',
    includeDetails: true,
    includeStackTraces: false
  }): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<testReport id="${report.id}" suiteId="${report.suiteId}">
    <startTime>${report.startTime.toISOString()}</startTime>
    <duration>${report.duration}</duration>
    <summary>
        <total>${report.summary.total}</total>
        <passed>${report.summary.passed}</passed>
        <failed>${report.summary.failed}</failed>
        <skipped>${report.summary.skipped}</skipped>
        <successRate>${report.summary.successRate}</successRate>
    </summary>
    <systemInfo>
        <version>${report.systemInfo.version}</version>
        <environment>${report.systemInfo.environment}</environment>
        <timestamp>${report.systemInfo.timestamp.toISOString()}</timestamp>
    </systemInfo>
`;

    if (config.includeDebugInfo && report.debugInfo) {
      xml += `    <debugInfo>
        <sessionId>${report.debugInfo.sessionId}</sessionId>
        <errors>${report.debugInfo.errors}</errors>
        <warnings>${report.debugInfo.warnings}</warnings>
        <memoryUsage>${report.debugInfo.memoryUsage}</memoryUsage>
    </debugInfo>
`;
    }

    report.results.forEach(result => {
      xml += `    <testResult id="${result.id}" name="${result.name}" status="${result.status}" duration="${result.duration}">
        <startTime>${result.startTime.toISOString()}</startTime>
`;

      if (result.endTime) {
        xml += `        <endTime>${result.endTime.toISOString()}</endTime>`;
      }

      if (result.error) {
        xml += `        <error>${this.escapeXML(result.error)}</error>`;
      }

      if (config.includeDetails && result.details) {
        xml += `        <details>${this.escapeXML(JSON.stringify(result.details))}</details>`;
      }

      xml += `        <assertions>
            <total>${result.assertions.total}</total>
            <passed>${result.assertions.passed}</passed>
            <failed>${result.assertions.failed}</failed>
        </assertions>
    </testResult>
`;
    });

    xml += '</testReport>';
    return xml;
  }
  
  /**
   * Generate test report summary
   */
  static generateSummary(reports: TestReport[]): {
    totalSuites: number;
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalSkipped: number;
    overallSuccessRate: number;
    totalDuration: number;
  } {
    const summary = {
      totalSuites: reports.length,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalSkipped: 0,
      overallSuccessRate: 0,
      totalDuration: 0
    };

    reports.forEach(report => {
      summary.totalTests += report.summary.total;
      summary.totalPassed += report.summary.passed;
      summary.totalFailed += report.summary.failed;
      summary.totalSkipped += report.summary.skipped;
      summary.totalDuration += report.duration;
    });

    summary.overallSuccessRate = summary.totalTests > 0 
      ? (summary.totalPassed / summary.totalTests) * 100 
      : 0;

    return summary;
  }
  
  /**
   * Sanitize report data for output
   */
  private static sanitizeReport(report: TestReport, config: TestReportConfig): any {
    const sanitized = { ...report };
    
    if (!config.includeDetails) {
      sanitized.results = sanitized.results.map(result => ({
        ...result,
        details: undefined
      }));
    }
    
    if (!config.includeStackTraces) {
      sanitized.results = sanitized.results.map(result => ({
        ...result,
        error: result.error?.replace(/\n\s*at.*/g, '')
      }));
    }
    
    return sanitized;
  }
  
  /**
   * Format duration in human readable format
   */
  private static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  /**
   * Format bytes in human readable format
   */
  private static formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  /**
   * Escape XML special characters
   */
  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, ''');
  }
}