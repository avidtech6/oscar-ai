// Sync metadata merge strategies
import type { SyncMetadata } from './syncMetadata'

// Merge strategies
export interface MergeResult<T> {
  mergedData: T
  resolution: 'local' | 'cloud' | 'merged'
  conflicts: string[]
}

// Simple merge strategy (last write wins)
export function simpleMerge<T extends Record<string, any>>(
  localData: T,
  cloudData: T,
  localMetadata: SyncMetadata,
  cloudMetadata: SyncMetadata
): MergeResult<T> {
  const conflicts: string[] = []
  
  // Compare timestamps
  if (localMetadata.updatedAt > cloudMetadata.updatedAt) {
    return {
      mergedData: localData,
      resolution: 'local',
      conflicts
    }
  } else if (cloudMetadata.updatedAt > localMetadata.updatedAt) {
    return {
      mergedData: cloudData,
      resolution: 'cloud',
      conflicts
    }
  }
  
  // Same timestamp, compare versions
  if (localMetadata.version > cloudMetadata.version) {
    return {
      mergedData: localData,
      resolution: 'local',
      conflicts
    }
  } else if (cloudMetadata.version > localMetadata.version) {
    return {
      mergedData: cloudData,
      resolution: 'cloud',
      conflicts
    }
  }
  
  // Same version, merge field by field
  const mergedData: Record<string, any> = { ...cloudData }
  const localKeys = Object.keys(localData)
  const cloudKeys = Object.keys(cloudData)
  const allKeys = new Set([...localKeys, ...cloudKeys])
  
  for (const key of allKeys) {
    if (key === 'id') continue
    
    const localValue = localData[key]
    const cloudValue = cloudData[key]
    
    if (localValue !== cloudValue) {
      if (localValue !== undefined && cloudValue !== undefined) {
        // Conflict on this field
        conflicts.push(key)
        // Prefer local for conflicts
        mergedData[key] = localValue
      } else if (localValue !== undefined) {
        mergedData[key] = localValue
      }
      // cloudValue already set as default
    }
  }
  
  return {
    mergedData: mergedData as T,
    resolution: conflicts.length > 0 ? 'merged' : 'cloud',
    conflicts
  }
}

// Intelligent merge for specific data types
export function intelligentMerge<T extends Record<string, any>>(
  localData: T,
  cloudData: T,
  localMetadata: SyncMetadata,
  cloudMetadata: SyncMetadata,
  dataType: 'report' | 'note' | 'setting' | 'trace'
): MergeResult<T> {
  const conflicts: string[] = []
  
  switch (dataType) {
    case 'report':
    case 'note':
      // For reports and notes, merge content intelligently
      const mergedData: Record<string, any> = { ...cloudData }
      
      // Merge content if both have it
      if ((localData as any).content && (cloudData as any).content && (localData as any).content !== (cloudData as any).content) {
        conflicts.push('content')
        // For now, prefer local content
        mergedData.content = (localData as any).content
      }
      
      // Merge titles
      if ((localData as any).title && (cloudData as any).title && (localData as any).title !== (cloudData as any).title) {
        conflicts.push('title')
        mergedData.title = (localData as any).title
      }
      
      // Merge tags
      if ((localData as any).tags || (cloudData as any).tags) {
        const localTags = (localData as any).tags || []
        const cloudTags = (cloudData as any).tags || []
        const mergedTags = Array.from(new Set([...localTags, ...cloudTags]))
        
        if (JSON.stringify(localTags) !== JSON.stringify(cloudTags)) {
          conflicts.push('tags')
        }
        
        mergedData.tags = mergedTags
      }
      
      // Use latest updatedAt
      mergedData.updatedAt = Math.max((localData as any).updatedAt || 0, (cloudData as any).updatedAt || 0)
      
      return {
        mergedData: mergedData as T,
        resolution: conflicts.length > 0 ? 'merged' : 'cloud',
        conflicts
      }
      
    case 'setting':
      // For settings, prefer local (device-specific settings)
      return {
        mergedData: localData,
        resolution: 'local',
        conflicts
      }
      
    case 'trace':
      // For intelligence traces, merge arrays
      const mergedTraces = [
        ...(Array.isArray((localData as any).traces) ? (localData as any).traces : []),
        ...(Array.isArray((cloudData as any).traces) ? (cloudData as any).traces : [])
      ]
      
      return {
        mergedData: { ...cloudData, traces: mergedTraces } as T,
        resolution: 'merged',
        conflicts
      }
      
    default:
      // Fall back to simple merge
      return simpleMerge(localData, cloudData, localMetadata, cloudMetadata)
  }
}