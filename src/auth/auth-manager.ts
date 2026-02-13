/**
 * OnlyWorlds Authentication Manager
 *
 * Handles API key + pin authentication with localStorage persistence and auto-reconnect.
 * Provides clean, minimal API for OnlyWorlds SDK client management.
 *
 * @module onlyworlds-auth-basic
 */

import { OnlyWorldsClient, type World } from '@onlyworlds/sdk';

const STORAGE_KEY = 'onlyworlds_auth';

export interface AuthCredentials {
  apiKey: string;
  apiPin: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  client: OnlyWorldsClient | null;
  world: World | null;
  credentials: AuthCredentials | null;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_CREDENTIALS' | 'NO_WORLD' | 'NETWORK_ERROR' | 'STORAGE_ERROR'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * OnlyWorlds Authentication Manager
 *
 * Singleton class managing authentication state and SDK client lifecycle.
 */
export class AuthManager {
  private state: AuthState = {
    isAuthenticated: false,
    client: null,
    world: null,
    credentials: null,
  };

  private authChangeCallbacks: Array<(authenticated: boolean) => void> = [];

  /**
   * Authenticate with OnlyWorlds API
   *
   * @param apiKey - User's API key from onlyworlds.com/account
   * @param apiPin - User's API pin
   * @returns True if authentication successful
   * @throws AuthError on failure
   */
  async authenticate(apiKey: string, apiPin: string): Promise<boolean> {
    if (!apiKey || !apiPin) {
      throw new AuthError('API key and pin are required', 'INVALID_CREDENTIALS');
    }

    try {
      // Initialize SDK client
      const client = new OnlyWorldsClient({
        apiKey,
        apiPin,
      });

      // Fetch world to verify credentials
      // SDK v2.1.0+ uses worlds.get() instead of worlds.list()
      const world: World = await client.worlds.get();

      if (!world) {
        throw new AuthError(
          'No world found. Create a world at onlyworlds.com first',
          'NO_WORLD'
        );
      }

      // Update state
      this.state = {
        isAuthenticated: true,
        client,
        world,
        credentials: { apiKey, apiPin },
      };

      // Persist credentials
      this.saveCredentials(apiKey, apiPin);

      // Notify listeners of successful authentication
      this.notifyAuthChange();

      return true;
    } catch (error) {
      this.clearAuth();

      if (error instanceof AuthError) {
        throw error;
      }

      // Network or API errors
      throw new AuthError(
        `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Attempt to auto-authenticate using stored credentials
   *
   * @returns True if authentication successful, false if no stored credentials
   * @throws AuthError on failure
   */
  async tryAutoAuth(): Promise<boolean> {
    const stored = this.loadCredentials();

    if (!stored) {
      return false;
    }

    try {
      await this.authenticate(stored.apiKey, stored.apiPin);
      return true;
    } catch (error) {
      // Clear invalid stored credentials
      this.clearStorage();
      throw error;
    }
  }

  /**
   * Get authenticated SDK client
   *
   * @throws AuthError if not authenticated
   */
  getClient(): OnlyWorldsClient {
    if (!this.state.client || !this.state.isAuthenticated) {
      throw new AuthError('Not authenticated. Call authenticate() first', 'INVALID_CREDENTIALS');
    }

    return this.state.client;
  }

  /**
   * Get current world
   *
   * @throws AuthError if not authenticated
   */
  getWorld(): World {
    if (!this.state.world || !this.state.isAuthenticated) {
      throw new AuthError('Not authenticated. Call authenticate() first', 'INVALID_CREDENTIALS');
    }

    return this.state.world;
  }

  /**
   * Get current credentials (use sparingly, prefer getClient())
   */
  getCredentials(): AuthCredentials | null {
    return this.state.credentials;
  }

  /**
   * Check if currently authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Register callback for authentication state changes
   *
   * @param callback - Function called with true when authenticated, false when logged out
   */
  onAuthChange(callback: (authenticated: boolean) => void): void {
    this.authChangeCallbacks.push(callback);
  }

  /**
   * Notify all registered callbacks of auth state change
   */
  private notifyAuthChange(): void {
    const authenticated = this.state.isAuthenticated;
    this.authChangeCallbacks.forEach(callback => {
      try {
        callback(authenticated);
      } catch (error) {
        console.error('Error in auth change callback:', error);
      }
    });
  }

  /**
   * Clear authentication and stored credentials
   */
  logout(): void {
    this.clearAuth();
    this.clearStorage();
    this.notifyAuthChange(); // Notify listeners of logout
  }

  /**
   * Clear in-memory auth state
   */
  private clearAuth(): void {
    this.state = {
      isAuthenticated: false,
      client: null,
      world: null,
      credentials: null,
    };
  }

  /**
   * Save credentials to localStorage
   */
  private saveCredentials(apiKey: string, apiPin: string): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          apiKey,
          apiPin,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      // Non-critical error, authentication still succeeded
      console.warn('Could not save credentials to localStorage:', error);
    }
  }

  /**
   * Load credentials from localStorage
   */
  private loadCredentials(): AuthCredentials | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored);

      if (!parsed.apiKey || !parsed.apiPin) {
        return null;
      }

      return {
        apiKey: parsed.apiKey,
        apiPin: parsed.apiPin,
      };
    } catch (error) {
      console.warn('Could not load credentials from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear stored credentials
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Could not clear credentials from localStorage:', error);
    }
  }
}

// Export singleton instance
export const authManager = new AuthManager();
