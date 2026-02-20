// Operation management for UnifiedEditor
// Handles operation application, transformation, and inverse operations

import type { 
  Document, 
  EditorOperation, 
  EditorOperationType 
} from '../../../types';
import { logger } from '../../../utils/logger';

/**
 * Operation application result
 */
export interface OperationApplicationResult {
  success: boolean;
  updatedDocument: Document;
  error?: string;
}

/**
 * Operation manager for applying and transforming editor operations
 */
export class OperationManager {
  /**
   * Apply an operation to a document
   */
  applyOperation(document: Document, operation: EditorOperation): OperationApplicationResult {
    try {
      const updatedDocument = { ...document };
      
      switch (operation.type) {
        case 'insert':
          updatedDocument.content =
            document.content.substring(0, operation.position) +
            operation.content +
            document.content.substring(operation.position);
          break;
        
        case 'replace':
          // Replace operation replaces from position to end of old content
          // For setContent, position is 0 and we replace entire document
          const replaceEnd = operation.position + (operation.metadata?.oldContentLength || document.content.length - operation.position);
          updatedDocument.content =
            document.content.substring(0, operation.position) +
            operation.content +
            document.content.substring(replaceEnd);
          break;
        
        case 'delete':
          updatedDocument.content =
            document.content.substring(0, operation.position) +
            document.content.substring(operation.position + operation.content.length);
          break;
        
        case 'format':
          // Formatting operations are applied to metadata, not content
          // In a real implementation, this would apply formatting to the specified range
          break;
        
        default:
          logger.warn(`Unknown operation type: ${operation.type}`, {
            operationId: operation.id,
            documentId: document.id,
          });
          return {
            success: false,
            updatedDocument: document,
            error: `Unknown operation type: ${operation.type}`
          };
      }

      // Update document version and metadata
      updatedDocument.version = operation.version;
      updatedDocument.updatedAt = new Date(operation.timestamp);
      updatedDocument.updatedBy = operation.userId;
      updatedDocument.deviceId = operation.deviceId;

      return {
        success: true,
        updatedDocument
      };
    } catch (error) {
      logger.error('Failed to apply operation', error as Error, {
        operationId: operation.id,
        documentId: document.id,
        operationType: operation.type,
      });
      
      return {
        success: false,
        updatedDocument: document,
        error: error instanceof Error ? error.message : 'Operation application failed'
      };
    }
  }

  /**
   * Create inverse operation for undo
   */
  createInverseOperation(operation: EditorOperation): EditorOperation {
    let inverseType: EditorOperationType;
    let inverseContent: string;

    switch (operation.type) {
      case 'insert':
        inverseType = 'delete';
        inverseContent = operation.content;
        break;
      
      case 'delete':
        inverseType = 'insert';
        inverseContent = operation.content;
        break;
      
      case 'replace':
        // For replace, we need to restore the original content
        // This is simplified - in a real implementation, we'd track the replaced content
        inverseType = 'replace';
        inverseContent = ''; // Would be the original content
        break;
      
      case 'format':
        inverseType = 'format';
        inverseContent = JSON.stringify({ type: 'removeFormat', range: operation.metadata?.range });
        break;
      
      default:
        inverseType = operation.type;
        inverseContent = operation.content;
    }

    return {
      id: `inv_${operation.id}`,
      type: inverseType,
      position: operation.position,
      content: inverseContent,
      timestamp: Date.now(),
      deviceId: operation.deviceId,
      userId: operation.userId,
      documentId: operation.documentId,
      version: operation.version + 1,
      previousOperationId: operation.id,
      metadata: operation.metadata,
    };
  }

  /**
   * Validate operation before application
   */
  validateOperation(document: Document, operation: EditorOperation): { valid: boolean; error?: string } {
    const contentLength = document.content.length;
    
    // Validate position
    if (operation.position < 0 || operation.position > contentLength) {
      return {
        valid: false,
        error: `Invalid operation position: ${operation.position} (document length: ${contentLength})`
      };
    }

    // Validate operation type
    const validTypes: EditorOperationType[] = ['insert', 'delete', 'format', 'replace'];
    if (!validTypes.includes(operation.type)) {
      return {
        valid: false,
        error: `Invalid operation type: ${operation.type}`
      };
    }

    // Additional validation for specific operation types
    switch (operation.type) {
      case 'delete':
        const deleteEnd = operation.position + operation.content.length;
        if (deleteEnd > contentLength) {
          return {
            valid: false,
            error: `Delete range exceeds document length: ${deleteEnd} > ${contentLength}`
          };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Transform operation for conflict resolution
   */
  transformOperation(
    baseOperation: EditorOperation,
    concurrentOperation: EditorOperation
  ): EditorOperation {
    // Simplified operational transform
    // In a real implementation, this would use proper OT algorithms
    const transformed = { ...baseOperation };
    
    if (concurrentOperation.type === 'insert' && baseOperation.type === 'insert') {
      // If concurrent insert is before our insert, adjust position
      if (concurrentOperation.position <= baseOperation.position) {
        transformed.position = baseOperation.position + concurrentOperation.content.length;
      }
    } else if (concurrentOperation.type === 'delete' && baseOperation.type === 'insert') {
      // If concurrent delete affects our insert position, adjust
      const deleteStart = concurrentOperation.position;
      const deleteEnd = concurrentOperation.position + concurrentOperation.content.length;
      
      if (deleteStart <= baseOperation.position && baseOperation.position < deleteEnd) {
        // Insert position is within deleted range, move to start of deletion
        transformed.position = deleteStart;
      } else if (baseOperation.position >= deleteEnd) {
        // Insert is after deletion, adjust position
        transformed.position = baseOperation.position - concurrentOperation.content.length;
      }
    }

    return transformed;
  }
}