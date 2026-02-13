/**
 * OnlyWorlds Authentication Block (Basic)
 *
 * Provides OnlyWorlds API authentication with localStorage persistence.
 *
 * @packageDocumentation
 */

export { AuthManager, authManager, AuthError } from './auth-manager';
export type { AuthCredentials, AuthState } from './auth-manager';

// Export SDK response adapters for consistent response handling across blocks
export {
  parseListResponse,
  parseWorldResponse,
  listElements,
  isSDKArrayResponse,
  isPaginatedResponse
} from './utils/sdk-response-adapter';

export type {
  ParsedListResponse,
  ParsedWorldResponse
} from './utils/sdk-response-adapter';
