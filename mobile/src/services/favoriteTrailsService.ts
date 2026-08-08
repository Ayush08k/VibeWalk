/**
 * Favorite Trails Service — Save and manage favorite walking routes
 */
import { SuggestedRoute } from './apiService';

export interface FavoriteTrail extends SuggestedRoute {
  id: string;
  savedAt: string;
  timesCompleted: number;
}

const DEFAULT_FAVORITE_TRAILS: FavoriteTrail[] = [
  {
    id: 'trail-1',
    title: 'Sunset Cyber Loop',
    distanceKm: 2.5,
    description: 'Smooth paved park loop with continuous sidewalk paths and low street traffic.',
    surface: 'Paved Sidewalk',
    savedAt: 'Today',
    timesCompleted: 4,
  },
  {
    id: 'trail-2',
    title: 'Waterfront Promenade Walk',
    distanceKm: 3.8,
    description: 'Flat scenic shoreline trail with minimal pedestrian congestion.',
    surface: 'Asphalt Promenade',
    savedAt: 'Yesterday',
    timesCompleted: 7,
  },
];

let favoriteTrails: FavoriteTrail[] = [...DEFAULT_FAVORITE_TRAILS];

export function getFavoriteTrails(): FavoriteTrail[] {
  return favoriteTrails;
}

export function saveFavoriteTrail(route: SuggestedRoute): FavoriteTrail {
  const existing = favoriteTrails.find((t) => t.title === route.title);
  if (existing) return existing;

  const newTrail: FavoriteTrail = {
    ...route,
    id: `trail-${Date.now()}`,
    savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    timesCompleted: 0,
  };

  favoriteTrails = [newTrail, ...favoriteTrails];
  return newTrail;
}

export function removeFavoriteTrail(id: string): void {
  favoriteTrails = favoriteTrails.filter((t) => t.id !== id);
}

export function isTrailBookmarked(title: string): boolean {
  return favoriteTrails.some((t) => t.title === title);
}
