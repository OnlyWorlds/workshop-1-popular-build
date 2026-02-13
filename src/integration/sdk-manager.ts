/**
 * SDK Manager - FULL OnlyWorlds SDK integration
 * Provides access to ALL 22 element types
 */

import { OnlyWorldsClient, ElementType } from '@onlyworlds/sdk';
import type { AuthManager } from '../auth/auth-manager';

export class SDKManager {
  private client: OnlyWorldsClient | null = null;
  private authManager: AuthManager;

  constructor(authManager: AuthManager) {
    this.authManager = authManager;

    // Auto-initialize if already authenticated
    if (authManager.isAuthenticated()) {
      this.client = authManager.getClient();
    }

    // Listen for auth changes
    this.authManager.onAuthChange((authenticated: boolean) => {
      if (authenticated) {
        this.client = this.authManager.getClient();
      } else {
        this.client = null;
      }
    });
  }

  /**
   * Get the SDK client (throws if not authenticated)
   */
  getClient(): OnlyWorldsClient {
    if (!this.client) {
      throw new Error('Not authenticated. Please connect first.');
    }
    return this.client;
  }

  /**
   * Check if SDK is ready
   */
  isReady(): boolean {
    return this.client !== null;
  }

  /**
   * Get resource by element type
   * This is the universal method that handles ALL 22 element types
   */
  getResource(elementType: ElementType) {
    const client = this.getClient();
    const resourceName = `${elementType}s`; // SDK uses plural names
    return (client as any)[resourceName];
  }

  /**
   * List elements of any type
   */
  async listElements(elementType: ElementType, filters?: any) {
    const resource = this.getResource(elementType);
    return await resource.list(filters);
  }

  /**
   * Get single element
   */
  async getElement(elementType: ElementType, id: string) {
    const resource = this.getResource(elementType);
    return await resource.get(id);
  }

  /**
   * Create element of any type
   */
  async createElement(elementType: ElementType, data: any) {
    const resource = this.getResource(elementType);
    return await resource.create(data);
  }

  /**
   * Update element of any type
   */
  async updateElement(elementType: ElementType, id: string, data: any) {
    const resource = this.getResource(elementType);
    return await resource.update(id, data);
  }

  /**
   * Delete element of any type
   */
  async deleteElement(elementType: ElementType, id: string) {
    const resource = this.getResource(elementType);
    return await resource.delete(id);
  }

  // Direct access methods for all 22 types (convenience methods)

  // Characters
  get characters() { return this.getClient().characters; }

  // Creatures
  get creatures() { return this.getClient().creatures; }

  // Species
  get species() { return this.getClient().species; }

  // Families
  get families() { return this.getClient().families; }

  // Collectives
  get collectives() { return this.getClient().collectives; }

  // Institutions
  get institutions() { return this.getClient().institutions; }

  // Locations
  get locations() { return this.getClient().locations; }

  // Objects
  get objects() { return this.getClient().objects; }

  // Constructs
  get constructs() { return this.getClient().constructs; }

  // Abilities
  get abilities() { return this.getClient().abilities; }

  // Traits
  get traits() { return this.getClient().traits; }

  // Titles
  get titles() { return this.getClient().titles; }

  // Languages
  get languages() { return this.getClient().languages; }

  // Laws
  get laws() { return this.getClient().laws; }

  // Events
  get events() { return this.getClient().events; }

  // Narratives
  get narratives() { return this.getClient().narratives; }

  // Phenomena
  get phenomena() { return this.getClient().phenomena; }

  // Relations
  get relations() { return this.getClient().relations; }

  // Maps
  get maps() { return this.getClient().maps; }

  // Pins
  get pins() { return this.getClient().pins; }

  // Markers
  get markers() { return this.getClient().markers; }

  // Zones
  get zones() { return this.getClient().zones; }

  // Worlds
  get worlds() { return this.getClient().worlds; }
}

// Singleton instance
let instance: SDKManager | null = null;

/**
 * Initialize SDK Manager
 */
export function initializeSDKManager(authManager: AuthManager): SDKManager {
  if (!instance) {
    instance = new SDKManager(authManager);
  }
  return instance;
}

/**
 * Get SDK Manager instance
 */
export function getSDKManager(): SDKManager {
  if (!instance) {
    throw new Error('SDK Manager not initialized. Call initializeSDKManager first.');
  }
  return instance;
}