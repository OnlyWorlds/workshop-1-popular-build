/**
 * Workshop Base — Entry Point
 *
 * Handles auth flow → app initialization.
 * Replace renderApp() contents with your tool's UI.
 */

import './styles/onlyworlds-base.css';
import { authManager } from './auth/auth-manager';
import { initializeSDKManager } from './integration/sdk-manager';
import { toastManager } from './ui/toast-manager';
import { renderApp } from './app';

const app = document.getElementById('app')!;

// Initialize toast system
toastManager.init();

// Try auto-auth from stored credentials
async function init() {
  try {
    const autoAuthed = await authManager.tryAutoAuth();
    if (autoAuthed) {
      initializeSDKManager(authManager);
      toastManager.success(`connected to ${authManager.getWorld().name}`);
      renderApp(app);
      return;
    }
  } catch {
    // Stored credentials invalid, show login
  }

  renderLogin();
}

function renderLogin() {
  app.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
      <div style="width: 100%; max-width: 400px; padding: var(--ow-space-4);">
        <h2 style="text-align: center; margin-bottom: var(--ow-space-1); text-transform: lowercase;">onlyworlds</h2>
        <p style="text-align: center; color: var(--ow-cyan-primary); margin-bottom: var(--ow-space-4); font-size: var(--ow-text-sm);">connect your world</p>

        <div style="display: flex; flex-direction: column; gap: var(--ow-space-2);">
          <input id="api-key" type="text" placeholder="api key" />
          <input id="api-pin" type="password" placeholder="pin" value="1111" />
          <button id="connect-btn" class="btn-primary" style="width: 100%; margin-top: var(--ow-space-1);">connect</button>
        </div>

        <p id="auth-error" style="color: var(--ow-error); text-align: center; margin-top: var(--ow-space-2); font-size: var(--ow-text-sm); display: none;"></p>
      </div>
    </div>
  `;

  const connectBtn = document.getElementById('connect-btn')!;
  const keyInput = document.getElementById('api-key') as HTMLInputElement;
  const pinInput = document.getElementById('api-pin') as HTMLInputElement;
  const errorEl = document.getElementById('auth-error')!;

  connectBtn.addEventListener('click', async () => {
    const apiKey = keyInput.value.trim();
    const apiPin = pinInput.value.trim();

    if (!apiKey || !apiPin) {
      errorEl.textContent = 'api key and pin required';
      errorEl.style.display = 'block';
      return;
    }

    connectBtn.textContent = 'connecting...';
    (connectBtn as HTMLButtonElement).disabled = true;
    errorEl.style.display = 'none';

    try {
      await authManager.authenticate(apiKey, apiPin);
      initializeSDKManager(authManager);
      toastManager.success(`connected to ${authManager.getWorld().name}`);
      renderApp(app);
    } catch (error) {
      errorEl.textContent = error instanceof Error ? error.message : 'connection failed';
      errorEl.style.display = 'block';
      connectBtn.textContent = 'connect';
      (connectBtn as HTMLButtonElement).disabled = false;
    }
  });

  // Enter key submits
  [keyInput, pinInput].forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') connectBtn.click();
    });
  });
}

init();
