/**
 * Types for OnlyWorlds SDK Full integration
 * Covers ALL 22 element types
 */

export interface Element {
  id: string;
  name: string;
  description?: string;
  world: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  supertype?: string;
  subtype?: string;
}

// All 22 OnlyWorlds element types
export interface Character extends Element {}
export interface Creature extends Element {}
export interface Species extends Element {}
export interface Family extends Element {}
export interface Collective extends Element {}
export interface Institution extends Element {}
export interface Location extends Element {}
export interface OWObject extends Element {} // Object is reserved in TS
export interface Construct extends Element {}
export interface Ability extends Element {}
export interface Trait extends Element {}
export interface Title extends Element {}
export interface Language extends Element {}
export interface Law extends Element {}
export interface Event extends Element {}
export interface Narrative extends Element {}
export interface Phenomenon extends Element {}
export interface Relation extends Element {
  element_one: string;
  element_two: string;
  relation_type?: string;
}
export interface Map extends Element {}
export interface Pin extends Element {
  map?: string;
  x?: number;
  y?: number;
}
export interface Marker extends Element {
  map?: string;
  x?: number;
  y?: number;
}
export interface Zone extends Element {
  map?: string;
  coordinates?: any;
}

export interface World {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ListResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface CreateElementData {
  name: string;
  description?: string;
  supertype?: string;
  subtype?: string;
  image_url?: string;
}

export interface UpdateElementData {
  name?: string;
  description?: string;
  supertype?: string;
  subtype?: string;
  image_url?: string;
}