/**
 * Healing Action Generators Index
 * Exports all generator classes and provides utility functions
 */

export { AddMissingSectionGenerator } from './AddMissingSectionGenerator';
export { AddMissingFieldGenerator } from './AddMissingFieldGenerator';
export { FixContradictionGenerator } from './FixContradictionGenerator';

export type { AddMissingSectionOptions } from './AddMissingSectionGenerator';
export type { AddMissingFieldOptions } from './AddMissingFieldGenerator';
export type { FixContradictionOptions } from './FixContradictionGenerator';

/**
 * Creates a generator instance based on action type
 */
export function createGenerator(actionType: string) {
  switch (actionType) {
    case 'addMissingSection':
      return new AddMissingSectionGenerator();
    case 'addMissingField':
      return new AddMissingFieldGenerator();
    case 'fixContradiction':
      return new FixContradictionGenerator();
    default:
      throw new Error(`Unknown generator type: ${actionType}`);
  }
}

/**
 * Validates generator options before creating an action
 */
export function validateGeneratorOptions(
  actionType: string,
  options: any
): { isValid: boolean; errors: string[] } {
  const generator = createGenerator(actionType);
  
  switch (actionType) {
    case 'addMissingSection':
      return (generator as AddMissingSectionGenerator).validateOptions(options);
    case 'addMissingField':
      return (generator as AddMissingFieldGenerator).validateOptions(options);
    case 'fixContradiction':
      return (generator as FixContradictionGenerator).validateOptions(options);
    default:
      return { isValid: false, errors: [`Unknown action type: ${actionType}`] };
  }
}

/**
 * Utility to generate multiple actions of different types
 */
export interface GeneratorBatchItem {
  actionType: string;
  target: any;
  options: any;
  source: any;
}

export function generateBatchActions(items: GeneratorBatchItem[]) {
  return items.map(item => {
    const generator = createGenerator(item.actionType);
    return (generator as any).generate(item.target, item.options, item.source);
  });
}