# Workshop Base — Universal OnlyWorlds Foundation

Ready-to-build foundation for any OnlyWorlds tool. Auth, SDK, visual identity, toasts, modals, storage — all wired up.

## Quick Start

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # Production build → dist/
```

## What's Included

| Block | What It Does |
|-------|-------------|
| **Auth** (`src/auth/`) | API key + pin login, auto-reconnect, credential persistence |
| **SDK** (`src/integration/`) | All 22 element types — list, get, create, update, delete |
| **Visual Identity** (`src/styles/`) | OnlyWorlds design system — dark void, cyan glow, lowercase |
| **Toasts** (`src/ui/toast-manager.ts`) | `toastManager.success/error/info()` — queue-based notifications |
| **Modals** (`src/ui/modal-base.ts`) | `BaseModal` class — ESC close, click-outside, extend for any modal |
| **Storage** (`src/utils/storage.ts`) | `storage.get/set/remove/clear()` — type-safe localStorage |

## How to Build On This

1. **`src/app.ts`** is your blank canvas. Auth is done, SDK is ready.
2. Use `getSDKManager()` for data access — all 22 element types available.
3. Use `parseListResponse()` from auth utils if you need to handle SDK response formats.
4. Add your CSS in a new file and import it in `main.ts`.

## Key Patterns

```typescript
import { authManager } from './auth/auth-manager';
import { getSDKManager } from './integration/sdk-manager';
import { parseListResponse } from './auth/utils/sdk-response-adapter';
import { toastManager } from './ui/toast-manager';
import { BaseModal } from './ui/modal-base';
import { storage } from './utils/storage';

// Get SDK
const sdk = getSDKManager();

// List elements
const chars = await sdk.characters.list();
const locs  = await sdk.locations.list();

// Get single element
const char = await sdk.characters.get(id);

// Parse responses safely
const parsed = parseListResponse(await sdk.events.list());
console.log(`${parsed.count} events`);

// Toast feedback
toastManager.success('loaded!');

// Local storage
storage.set('lastView', 'characters');
const view = storage.get('lastView', 'all');
```

## Adding a Framework

This foundation is framework-agnostic. To add React:
```bash
npm install react react-dom @types/react @types/react-dom
```
Then update `tsconfig.json` with `"jsx": "react-jsx"` and rename `.ts` files to `.tsx`.

To add Tailwind:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Available Add-On Blocks

See **FORGE_SPEC.md** for a complete reference of Assembly blocks not included in this foundation — visualization, AI, maps, and more. All available at `C:\Users\Titus\Carrier\Assembly\blocks\`.

## Deployment

Cloudflare Pages (recommended):
```bash
npm run build
npx wrangler pages deploy dist --project-name=your-tool-name
```

Pre-approved CORS: `*.pages.dev`, `*.vercel.app`, `*.netlify.app`, `localhost:*`

---

**Assembled by**: Kael (Assembly)
**Date**: 2026-02-12
**Template**: WORKSHOP (6 blocks)
