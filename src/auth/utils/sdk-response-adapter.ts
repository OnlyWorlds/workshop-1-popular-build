/**
 * SDK Response Adapter
 *
 * CRITICAL: OnlyWorlds SDK v1.0.x returns direct arrays for list operations,
 * not paginated response objects. This adapter handles both formats for
 * future compatibility.
 *
 * @module onlyworlds-auth-basic/utils
 */

export interface ParsedListResponse<T = any> {
  items: T[];
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
  next?: string | null;
  previous?: string | null;
}

export interface ParsedWorldResponse {
  world: any;
  isMultiple: boolean;
}

/**
 * Parse any SDK list response (characters, locations, etc.)
 *
 * Handles both formats:
 * - SDK v1.0.x: Direct array [item1, item2, ...]
 * - Future/REST: Paginated object {results: [...], count: N, next: "..."}
 *
 * @example
 * const response = await client.characters.list();
 * const parsed = parseListResponse(response);
 * console.log(`Found ${parsed.count} characters`);
 * parsed.items.forEach(char => console.log(char.name));
 */
export function parseListResponse<T = any>(response: any): ParsedListResponse<T> {
  // SDK returns direct array
  if (Array.isArray(response)) {
    return {
      items: response as T[],
      count: response.length,
      hasNext: false,
      hasPrevious: false,
      next: null,
      previous: null
    };
  }

  // Paginated response format (future compatibility)
  if (response && typeof response === 'object' && 'results' in response) {
    return {
      items: response.results || [],
      count: response.count || response.results?.length || 0,
      hasNext: !!response.next,
      hasPrevious: !!response.previous,
      next: response.next || null,
      previous: response.previous || null
    };
  }

  // Fallback for unexpected formats
  console.warn('Unexpected SDK response format:', response);
  return {
    items: [],
    count: 0,
    hasNext: false,
    hasPrevious: false,
    next: null,
    previous: null
  };
}

/**
 * Parse world response from SDK
 *
 * Handles special cases:
 * - Direct world object: {id: "...", name: "..."}
 * - Array with single world: [{id: "...", name: "..."}]
 * - Paginated format: {results: [{...}], count: 1}
 *
 * @example
 * const world = await client.worlds.get(); // SDK 2.1.1+
 * const parsed = parseWorldResponse(world);
 * if (parsed.world) {
 *   console.log(`Connected to world: ${parsed.world.name}`);
 * }
 */
export function parseWorldResponse(response: any): ParsedWorldResponse {
  // Direct world object
  if (response && typeof response === 'object' && 'id' in response && 'name' in response) {
    return {
      world: response,
      isMultiple: false
    };
  }

  // Array of worlds
  if (Array.isArray(response)) {
    return {
      world: response[0] || null,
      isMultiple: response.length > 1
    };
  }

  // Paginated format
  if (response && typeof response === 'object' && 'results' in response) {
    return {
      world: response.results?.[0] || null,
      isMultiple: (response.count || response.results?.length || 0) > 1
    };
  }

  return {
    world: null,
    isMultiple: false
  };
}

/**
 * Standard pattern for listing elements
 *
 * Use this wrapper for consistent element listing across all blocks
 *
 * @example
 * const characters = await listElements(client, 'character');
 * const locations = await listElements(client, 'location');
 */
export async function listElements(
  client: any,
  elementType: string,
  params?: any
): Promise<ParsedListResponse> {
  const resourceName = `${elementType}s`; // character -> characters
  const resource = client[resourceName];

  if (!resource) {
    throw new Error(`Resource ${resourceName} not found in SDK client`);
  }

  try {
    const response = await resource.list(params);
    return parseListResponse(response);
  } catch (error) {
    console.error(`Failed to list ${elementType}s:`, error);
    throw error;
  }
}

/**
 * Check if a response is the SDK array format
 *
 * @example
 * const response = await client.characters.list();
 * if (isSDKArrayResponse(response)) {
 *   console.log('Using SDK v1.0.x array format');
 * }
 */
export function isSDKArrayResponse(response: any): boolean {
  return Array.isArray(response);
}

/**
 * Check if a response is paginated format
 *
 * @example
 * const response = await client.characters.list();
 * if (isPaginatedResponse(response)) {
 *   console.log(`Page 1 of ${Math.ceil(response.count / 20)}`);
 * }
 */
export function isPaginatedResponse(response: any): boolean {
  return response &&
    typeof response === 'object' &&
    'results' in response &&
    Array.isArray(response.results);
}

// Export all utilities as default object for convenience
export default {
  parseListResponse,
  parseWorldResponse,
  listElements,
  isSDKArrayResponse,
  isPaginatedResponse
};