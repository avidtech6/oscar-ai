// Sync Engine Stats Core - Layer 1 Pure Logic
import type { QueueItem } from '../syncQueue'

// Pure core logic extracted from syncEngineStats.ts
export function calculateQueueStatisticsCore(items: QueueItem[]): {
  pending: number
  processing: number
  failed: number
  completed: number
} {
  const pending = items.filter(item => item.status === 'pending').length
  const processing = items.filter(item => item.status === 'processing').length
  const failed = items.filter(item => item.status === 'failed').length
  const completed = items.filter(item => item.status === 'completed').length
  
  return {
    pending,
    processing,
    failed,
    completed
  }
}

export function calculateLocalStatisticsCore(
  tableCounts: Record<string, number>
): {
  totalRecords: number
  byTable: Record<string, number>
  tableDistribution: Array<{ table: string; count: number; percentage: number }>
} {
  const totalRecords = Object.values(tableCounts).reduce((sum, count) => sum + count, 0)
  
  const tableDistribution = Object.entries(tableCounts).map(([table, count]) => ({
    table,
    count,
    percentage: totalRecords > 0 ? (count / totalRecords) * 100 : 0
  }))
  
  return {
    totalRecords,
    byTable: { ...tableCounts },
    tableDistribution
  }
}

export function calculateSyncHealthStatsCore(
  queueStats: { pending: number; processing: number; failed: number; completed: number },
  localStats: { totalRecords: number; byTable: Record<string, number> }
): {
  healthScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  performance: 'excellent' | 'good' | 'fair' | 'poor'
} {
  const recommendations: string[] = []
  let healthScore = 100
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  let performance: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent'
  
  // Calculate queue health
  const totalQueueItems = queueStats.pending + queueStats.processing + queueStats.failed
  const failedRate = totalQueueItems > 0 ? queueStats.failed / totalQueueItems : 0
  
  if (failedRate > 0.1) {
    healthScore -= 20
    recommendations.push('High failure rate detected - investigate sync errors')
    riskLevel = 'high'
  } else if (failedRate > 0.05) {
    healthScore -= 10
    recommendations.push('Moderate failure rate - monitor sync operations')
    riskLevel = 'medium'
  }
  
  // Calculate pending queue pressure
  if (queueStats.pending > 100) {
    healthScore -= 15
    recommendations.push('Large pending queue - sync may be delayed')
    riskLevel = riskLevel === 'high' ? 'high' : 'medium'
  } else if (queueStats.pending > 50) {
    healthScore -= 5
    recommendations.push('Moderate pending queue - monitor sync performance')
  }
  
  // Calculate local data consistency
  const totalLocalRecords = localStats.totalRecords
  const tableCounts = Object.values(localStats.byTable)
  const maxTableCount = Math.max(...tableCounts)
  const minTableCount = Math.min(...tableCounts)
  
  if (tableCounts.length > 1 && maxTableCount > minTableCount * 10) {
    healthScore -= 10
    recommendations.push('Uneven data distribution across tables')
  }
  
  // Calculate performance score
  if (healthScore >= 90) {
    performance = 'excellent'
  } else if (healthScore >= 70) {
    performance = 'good'
  } else if (healthScore >= 50) {
    performance = 'fair'
  } else {
    performance = 'poor'
    riskLevel = 'critical'
    recommendations.push('Critical health score - immediate attention required')
  }
  
  return {
    healthScore: Math.max(0, healthScore),
    riskLevel,
    recommendations,
    performance
  }
}

export function generateSyncReportCore(
  queueStats: { pending: number; processing: number; failed: number; completed: number },
  localStats: { totalRecords: number; byTable: Record<string, number> },
  healthStats: { healthScore: number; riskLevel: string; performance: string; recommendations: string[] }
): {
  summary: string
  details: {
    queue: string
    local: string
    health: string
    recommendations: string[]
  }
  metrics: Record<string, number | string>
} {
  const totalQueueItems = queueStats.pending + queueStats.processing + queueStats.failed + queueStats.completed
  const queueHealth = totalQueueItems > 0 ? 
    `${((queueStats.completed / totalQueueItems) * 100).toFixed(1)}% completion` : 'No queue data'
  
  const localHealth = `${localStats.totalRecords} total records across ${Object.keys(localStats.byTable).length} tables`
  
  const healthStatus = `Health: ${healthStats.healthScore}% (${healthStats.performance}) - ${healthStats.riskLevel} risk`
  
  const metrics = {
    'Total Queue Items': totalQueueItems,
    'Pending Items': queueStats.pending,
    'Failed Items': queueStats.failed,
    'Total Records': localStats.totalRecords,
    'Health Score': healthStats.healthScore,
    'Performance': healthStats.performance,
    'Risk Level': healthStats.riskLevel
  }
  
  return {
    summary: `Sync system ${healthStats.performance} with ${healthStats.riskLevel} risk (${healthStats.healthScore}% health)`,
    details: {
      queue: queueHealth,
      local: localHealth,
      health: healthStatus,
      recommendations: healthStats.recommendations
    },
    metrics
  }
}

// Pure utility functions for statistics
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function getTrendIndicator(rate: number): '📈' | '📉' | '➡️' {
  if (rate > 5) return '📈'
  if (rate < -5) return '📉'
  return '➡️'
}