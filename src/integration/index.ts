/**
 * OnlyWorlds SDK Full - Main exports
 * Provides ALL 22 element types
 */

export * from './sdk-manager';
export * from './types';

// Re-export key SDK types for convenience
export {
  OnlyWorldsClient,
  ElementType,
  ELEMENT_LABELS,
  ELEMENT_ICONS,
  getElementIcon
} from '@onlyworlds/sdk';