/**
 * Self Healing Storage Module Index
 * Exports storage service and related types
 */

import { SelfHealingStorageService } from './SelfHealingStorageService';
import type { SelfHealingStorageOptions, SelfHealingStorageData } from './SelfHealingStorageService';

export { SelfHealingStorageService };
export type { SelfHealingStorageOptions, SelfHealingStorageData };

/**
 * Create a default storage service instance
 */
export function createDefaultStorageService(): SelfHealingStorageService {
  return new SelfHealingStorageService({
    storagePath: 'workspace/self-healing-actions.json',
    autoSave: true,
    maxActions: 1000,
    backupEnabled: true
  });
}

/**
 * Utility to quickly save an action
 */
export async function saveActionToStorage(
  action: any,
  options?: SelfHealingStorageOptions
): Promise<string> {
  const service = new SelfHealingStorageService(options || {});
  await service.initialize();
  return service.saveAction(action);
}

/**
 * Utility to quickly load all pending actions
 */
export async function loadPendingActions(
  options?: SelfHealingStorageOptions
): Promise<any[]> {
  const service = new SelfHealingStorageService(options || {});
  await service.initialize();
  return service.getActions({ status: 'pending' });
}