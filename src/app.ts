/**
 * The Buried Giant — World Map Visualization
 * An interactive world map for Kazuo Ishiguro's novel,
 * built on the OnlyWorlds worldbuilding data standard.
 */

import { authManager } from './auth/auth-manager';
import { getSDKManager } from './integration/sdk-manager';
import { toastManager } from './ui/toast-manager';
import './styles/buried-giant.css';

interface WorldElement {
  id: string;
  name: string;
  description?: string;
  type: string;
  [key: string]: any;
}

interface TypeGroup {
  type: string;
  label: string;
  elements: WorldElement[];
}

interface PlacedElement extends WorldElement {
  x: number;
  y: number;
}

const ELEMENT_TYPES = [
  'character', 'creature', 'species', 'location', 'object',
  'institution', 'collective', 'event', 'phenomenon',
  'ability', 'trait', 'title', 'narrative', 'family',
  'construct', 'language', 'law', 'relation'
] as const;

// Visual priority — determines marker size on the map
const TYPE_PRIORITY: Record<string, number> = {
  location: 3,
  character: 2,
  creature: 2,
  institution: 2,
  event: 1,
  phenomenon: 1,
  species: 1,
  collective: 1,
  object: 1,
};

let allGroups: TypeGroup[] = [];
let allElements: WorldElement[] = [];
let placedElements: PlacedElement[] = [];
let activeType: string | null = null;
let currentView: 'map' | 'list' = 'map';

// Map pan/zoom state
const MAP_W = 2400;
const MAP_H = 1600;
let panX = 0;
let panY = 0;
let zoom = 1;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panOriginX = 0;
let panOriginY = 0;

export function renderApp(container: HTMLElement) {
  const world = authManager.getWorld();

  container.innerHTML = `
    <div class="bg-app">
      <header class="bg-header">
        <div>
          <h1>the buried giant</h1>
          <span class="bg-header-sub">${world.name}</span>
        </div>
        <div class="bg-header-right">
          <button class="bg-view-toggle" id="view-toggle">
            <span class="material-icons" style="font-size:16px; color: inherit;">list</span>
            <span id="view-label">list</span>
          </button>
          <button class="bg-logout" id="logout-btn">leave</button>
        </div>
      </header>

      <div class="bg-body">
        <aside class="bg-sidebar" id="sidebar">
          <div class="bg-sidebar-title">chronicles</div>
          <div id="type-list"></div>
        </aside>

        <main class="bg-main" id="main-content">
          <div class="bg-loading">
            <div class="bg-loading-spinner"></div>
            gathering memories from the mist...
          </div>
        </main>
      </div>

      <div class="bg-mist"></div>
    </div>
  `;

  document.getElementById('logout-btn')!.addEventListener('click', () => {
    authManager.logout();
    toastManager.info('logged out');
    window.location.reload();
  });

  document.getElementById('view-toggle')!.addEventListener('click', () => {
    currentView = currentView === 'map' ? 'list' : 'map';
    const label = document.getElementById('view-label')!;
    const icon = document.querySelector('#view-toggle .material-icons')!;
    if (currentView === 'map') {
      label.textContent = 'list';
      icon.textContent = 'list';
    } else {
      label.textContent = 'map';
      icon.textContent = 'map';
    }
    renderContent();
  });

  loadWorldData();
}

async function loadWorldData() {
  const sdk = getSDKManager();
  const groups: TypeGroup[] = [];

  const fetches = ELEMENT_TYPES.map(async (type) => {
    try {
      const resource = (sdk as any)[type + 's'];
      if (!resource) return null;
      const response = await resource.list();
      const items = parseResponse(response);
      if (items.length === 0) return null;
      return {
        type,
        label: type,
        elements: items.map((item: any) => ({ ...item, type })),
      } as TypeGroup;
    } catch (e) {
      console.warn(`Could not fetch ${type}s:`, e);
      return null;
    }
  });

  const results = await Promise.all(fetches);
  results.forEach((g) => { if (g) groups.push(g); });

  groups.sort((a, b) => b.elements.length - a.elements.length);
  allGroups = groups;
  allElements = groups.flatMap((g) => g.elements);

  // Place elements on the map
  placedElements = placeElements(allElements);

  // Center the map initially
  const mainEl = document.getElementById('main-content');
  if (mainEl) {
    panX = -(MAP_W / 2 - mainEl.clientWidth / 2);
    panY = -(MAP_H / 2 - mainEl.clientHeight / 2);
  }

  const totalCount = allElements.length;
  toastManager.success(`${totalCount} elements found across ${groups.length} types`);

  renderSidebar();
  renderContent();
}

function parseResponse(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (response?.results && Array.isArray(response.results)) return response.results;
  if (response && typeof response === 'object') {
    const vals = Object.values(response);
    if (vals.length > 0 && Array.isArray(vals[0])) return vals[0] as any[];
  }
  return [];
}

// Deterministic hash → position. Same name always lands in the same spot.
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function placeElements(elements: WorldElement[]): PlacedElement[] {
  const margin = 80;
  const usableW = MAP_W - margin * 2;
  const usableH = MAP_H - margin * 2;
  const placed: PlacedElement[] = [];

  // Place locations first in a spread-out pattern using golden angle
  const locations = elements.filter((e) => e.type === 'location');
  const others = elements.filter((e) => e.type !== 'location');

  const goldenAngle = 137.508 * (Math.PI / 180);
  locations.forEach((el, i) => {
    const angle = i * goldenAngle;
    const radius = 0.2 + (i / Math.max(locations.length, 1)) * 0.3;
    const x = margin + usableW / 2 + Math.cos(angle) * radius * usableW / 2;
    const y = margin + usableH / 2 + Math.sin(angle) * radius * usableH / 2;
    placed.push({ ...el, x, y });
  });

  // Place other elements using hash-based positioning, avoiding overlap
  others.forEach((el) => {
    const h = hashString(el.id + el.name);
    const h2 = hashString(el.name + el.type);
    let x = margin + (h % usableW);
    let y = margin + (h2 % usableH);

    // Nudge away from existing positions to reduce overlap
    for (let attempt = 0; attempt < 5; attempt++) {
      let tooClose = false;
      for (const p of placed) {
        const dx = p.x - x;
        const dy = p.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 60) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) break;
      x = margin + ((h + attempt * 197) % usableW);
      y = margin + ((h2 + attempt * 131) % usableH);
    }

    placed.push({ ...el, x, y });
  });

  return placed;
}

function renderSidebar() {
  const list = document.getElementById('type-list')!;
  const totalCount = allElements.length;

  let html = `
    <button class="bg-type-btn ${activeType === null ? 'active' : ''}" data-type="all">
      <span>all elements</span>
      <span class="bg-type-count">${totalCount}</span>
    </button>
  `;

  allGroups.forEach((g) => {
    html += `
      <button class="bg-type-btn ${activeType === g.type ? 'active' : ''}" data-type="${g.type}">
        <span>${g.label}s</span>
        <span class="bg-type-count">${g.elements.length}</span>
      </button>
    `;
  });

  list.innerHTML = html;

  list.querySelectorAll('.bg-type-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = (btn as HTMLElement).dataset.type!;
      activeType = type === 'all' ? null : type;
      renderSidebar();
      renderContent();
    });
  });
}

function renderContent() {
  if (currentView === 'map') {
    renderMap();
  } else {
    renderList();
  }
}

// ===== MAP VIEW =====

function renderMap() {
  const main = document.getElementById('main-content')!;
  const visible = activeType
    ? placedElements.filter((e) => e.type === activeType)
    : placedElements;

  if (visible.length === 0) {
    main.innerHTML = '<div class="bg-empty">no memories remain in this world...</div>';
    return;
  }

  let markersHtml = '';
  visible.forEach((el) => {
    const priority = TYPE_PRIORITY[el.type] || 0;
    const sizeClass = priority >= 3 ? 'bg-marker-lg' : priority >= 2 ? 'bg-marker-md' : 'bg-marker-sm';
    markersHtml += `
      <div class="bg-marker ${sizeClass} bg-marker-${el.type}"
           data-id="${el.id}" data-type="${el.type}"
           style="left: ${el.x}px; top: ${el.y}px;">
        <div class="bg-marker-dot"></div>
        <div class="bg-marker-label">${el.name}</div>
      </div>
    `;
  });

  main.innerHTML = `
    <div class="bg-map-container" id="map-container">
      <div class="bg-map-surface" id="map-surface" style="width:${MAP_W}px; height:${MAP_H}px; transform: translate(${panX}px, ${panY}px) scale(${zoom});">
        <div class="bg-map-decoration">
          <div class="bg-compass"></div>
        </div>
        ${markersHtml}
      </div>
    </div>
  `;

  // Pan & zoom handlers
  const container = document.getElementById('map-container')!;
  const surface = document.getElementById('map-surface')!;

  container.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).closest('.bg-marker')) return;
    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    panOriginX = panX;
    panOriginY = panY;
    container.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = panOriginX + (e.clientX - panStartX);
    panY = panOriginY + (e.clientY - panStartY);
    surface.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoom = Math.min(2.5, Math.max(0.3, zoom + delta));
    surface.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  }, { passive: false });

  // Marker click → detail
  main.querySelectorAll('.bg-marker').forEach((marker) => {
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (marker as HTMLElement).dataset.id!;
      const el = allElements.find((e) => e.id === id);
      if (el) showDetail(el);
    });
  });
}

// ===== LIST VIEW =====

function renderList() {
  const main = document.getElementById('main-content')!;
  const groups = activeType
    ? allGroups.filter((g) => g.type === activeType)
    : allGroups;

  if (groups.length === 0) {
    main.innerHTML = '<div class="bg-empty">nothing here but mist...</div>';
    return;
  }

  let html = '';
  groups.forEach((g) => {
    html += `<div class="bg-main-header">${g.label}s</div>`;
    html += '<div class="bg-element-grid">';
    g.elements.forEach((el) => {
      const desc = el.description
        ? el.description.substring(0, 150) + (el.description.length > 150 ? '...' : '')
        : '<em>lost to the mist</em>';
      html += `
        <div class="bg-card" data-id="${el.id}" data-type="${el.type}">
          <div class="bg-card-name">${el.name}</div>
          <div class="bg-card-type">${el.type}</div>
          <div class="bg-card-desc">${desc}</div>
        </div>
      `;
    });
    html += '</div>';
    html += '<div style="height: 32px;"></div>';
  });

  main.innerHTML = html;

  main.querySelectorAll('.bg-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.id!;
      const el = allElements.find((e) => e.id === id);
      if (el) showDetail(el);
    });
  });
}

// ===== DETAIL PANEL =====

function showDetail(el: WorldElement) {
  document.querySelector('.bg-detail-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'bg-detail-overlay';

  const skipFields = new Set(['id', 'name', 'description', 'type', 'world', 'created_at', 'updated_at']);
  let fieldsHtml = '';

  Object.entries(el).forEach(([key, value]) => {
    if (skipFields.has(key)) return;
    if (value === null || value === undefined || value === '') return;
    if (Array.isArray(value) && value.length === 0) return;
    if (typeof value === 'object' && !Array.isArray(value)) return;

    const displayKey = key.replace(/_/g, ' ');
    let displayValue: string;

    if (Array.isArray(value)) {
      displayValue = value.map((v) => (typeof v === 'object' ? v.name || JSON.stringify(v) : v)).join(', ');
    } else {
      displayValue = String(value);
    }

    fieldsHtml += `
      <div class="bg-detail-field">
        <div class="bg-detail-label">${displayKey}</div>
        <div class="bg-detail-value">${displayValue}</div>
      </div>
    `;
  });

  overlay.innerHTML = `
    <div class="bg-detail">
      <button class="bg-detail-close">&times;</button>
      <div class="bg-detail-type">${el.type}</div>
      <h2>${el.name}</h2>
      <div class="bg-detail-body">
        ${el.description ? `<p style="margin-bottom: 20px;">${el.description}</p>` : ''}
        ${fieldsHtml}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('.bg-detail-close')!.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}
