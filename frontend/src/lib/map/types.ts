/**
 * Map integration abstraction - swap providers (Leaflet, Mapbox, etc.) by
 * implementing this interface in a single module.
 */
export interface MapLocation {
  lat: number
  lng: number
  alt?: number
}

export type MapMarkerItemType = 'message' | 'chest' | 'loot'

export interface MapMarkerPopupItem {
  id: string
  title: string
  /** Display name for the item type (e.g. "Explorer Tag", "Treasure Chest", "Diamond") */
  itemName?: string
  distance?: number
  type: MapMarkerItemType
}

export type MapMarkerIconType =
  | 'user'
  | 'envelope-unopened'
  | 'envelope-opened'
  | 'locked'
  | 'chest'
  | 'chest-opened'
  | 'stack'
  | 'avatar'
  | 'diamond'
  | 'cash_chest'
  | 'loot_box'
  | 'surprise'
  | 'powerup'
  | 'bomb'
  | 'snake'

export interface MapMarkerConfig {
  id: string
  position: MapLocation
  icon: MapMarkerIconType
  /** Color for icons: purple (far), orange (near), green (unlocked), gold (chest), teal (own content), grey (hidden/claimed), blue, red, pink */
  color?: 'purple' | 'orange' | 'green' | 'gold' | 'teal' | 'grey' | 'blue' | 'red' | 'pink'
  /** Only pulse this marker when it's the selected one */
  isSelected?: boolean
  /** Single item popup */
  popup?: { title: string; itemName?: string; distance?: number }
  /** Stacked items - when multiple at same location */
  items?: MapMarkerPopupItem[]
}

export interface ThemeColorsForMap {
  game: { gold: string; blue: string };
  marker: Record<string, string>;
}

export interface MapConfig {
  center: MapLocation
  zoom: number
  darkMode: boolean
  chestHunterMode?: boolean
  flyToPosition?: { lat: number; lng: number } | null
  themeColors?: ThemeColorsForMap
}
