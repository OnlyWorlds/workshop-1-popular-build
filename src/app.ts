/**
 * App Shell — Post-authentication UI
 *
 * This is the blank canvas. Replace this with your tool's UI.
 * Auth is handled, SDK is ready, world is connected.
 *
 * Available infrastructure:
 *   - authManager.getClient()     → OnlyWorldsClient (SDK)
 *   - authManager.getWorld()      → World object
 *   - getSDKManager()             → SDKManager with all 22 element types
 *   - toastManager.success/error  → User feedback
 *   - BaseModal                   → Modal dialogs
 *   - storage.get/set             → localStorage wrapper
 *   - parseListResponse()         → SDK response adapter
 */

import { authManager } from './auth/auth-manager';
import { getSDKManager } from './integration/sdk-manager';
import { toastManager } from './ui/toast-manager';

export function renderApp(container: HTMLElement) {
  const world = authManager.getWorld();
  const sdk = getSDKManager();

  container.innerHTML = `
    <div style="max-width: 1280px; margin: 0 auto; padding: var(--ow-space-4);">
      <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--ow-space-4); padding-bottom: var(--ow-space-2); border-bottom: 1px solid var(--ow-border-subtle);">
        <div>
          <h3 style="text-transform: lowercase;">${world.name}</h3>
          <p style="color: var(--ow-text-tertiary); font-size: var(--ow-text-sm);">connected</p>
        </div>
        <button id="logout-btn" class="btn-secondary btn-sm">logout</button>
      </header>

      <main id="main-content">
        <p style="color: var(--ow-text-secondary);">foundation ready. build your tool here.</p>
      </main>
    </div>
  `;

  document.getElementById('logout-btn')!.addEventListener('click', () => {
    authManager.logout();
    toastManager.info('logged out');
    window.location.reload();
  });

  // SDK is ready — start building:
  // const characters = await sdk.characters.list();
  // const locations = await sdk.locations.list();
  // etc.
}
