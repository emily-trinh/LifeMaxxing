export const categoryEmoji: Record<string, string> = {
  Fitness: '🏃',
  fitness: '🏃',
  Art: '🎨',
  art: '🎨',
  Food: '🍝',
  food: '🍝',
  Social: '🫶',
  social: '🫶',
  Games: '🎲',
  games: '🎲',
  Outdoors: '🥾',
  outdoors: '🥾',
  Creative: '🎨',
  Explore: '🧭',
  Movement: '🧗',
  Culture: '🏛️',
  culture: '🏛️',
  Community: '🌱',
  volunteering: '🌱',
  Film: '🎬',
  Wellness: '🧘',
};

// Real device location will replace this reference point later.
export const REFERENCE_POINT = { latitude: 49.2781, longitude: -122.9199 };

export function distanceKm(latitude: number, longitude: number): number {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const latitudeDelta = toRadians(latitude - REFERENCE_POINT.latitude);
  const longitudeDelta = toRadians(longitude - REFERENCE_POINT.longitude);
  const startLatitude = toRadians(REFERENCE_POINT.latitude);
  const endLatitude = toRadians(latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function formatDistance(km: number): string {
  const distance = km < 10 ? km.toFixed(1) : Math.round(km).toString();
  return `${distance} km away`;
}

export function formatEventDate(iso: string | null): string {
  if (!iso) return 'Open year-round';
  const date = new Date(iso);
  const dayAndDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  return `${dayAndDate} · ${time}`;
}

export function formatEventTime(iso: string | null): string {
  if (!iso) return 'Open year-round';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatHourLabel(hour: number): string {
  const date = new Date(2000, 0, 1, hour);
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).format(date);
}

export function formatTimeRange(startsAt: Date | string, endsAt: Date | string): string {
  const formatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${formatter.format(new Date(startsAt))} to ${formatter.format(new Date(endsAt))}`;
}

export function formatLongDate(date: Date | string): string {
  const parsedDate = date instanceof Date
    ? date
    : /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T12:00:00`)
      : new Date(date);
  if (!Number.isFinite(parsedDate.getTime())) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(parsedDate);
}