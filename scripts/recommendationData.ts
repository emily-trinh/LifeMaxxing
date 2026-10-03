import type { CandidateEvent, UserPreferences } from '../types/recommendation';

export const testPreferences: UserPreferences = {
  interests: ['fitness', 'outdoors', 'meeting people'],
  radiusKm: 12,
  maxPrice: 25,
  groupMode: 'group',
};

export const testEvents: CandidateEvent[] = [
  { id: 'event-101', title: 'Sunrise Trail Walk', description: 'A guided two-hour walk with coffee afterward.', category: 'outdoors', price: 0, isFree: true, distanceKm: 4.2, groupMode: 'group' },
  { id: 'event-102', title: 'Beginner Bouldering Hour', description: 'A friendly climbing session with gear orientation.', category: 'fitness', price: 22, isFree: false, distanceKm: 7.5, groupMode: 'group' },
  { id: 'event-103', title: 'Quiet Museum Morning', description: 'A self-guided gallery route for a solo reset.', category: 'culture', price: 18, isFree: false, distanceKm: 3.1, groupMode: 'solo' },
  { id: 'event-104', title: 'Community Garden Volunteer Day', description: 'Help prepare fall beds with local gardeners.', category: 'community', price: 0, isFree: true, distanceKm: 9.8, groupMode: 'group' },
  { id: 'event-105', title: 'Make Your Own Pasta', description: 'A hands-on cooking class with a local chef.', category: 'food', price: 55, isFree: false, distanceKm: 5.6, groupMode: 'group' },
  { id: 'event-106', title: 'Rooftop Film Night', description: 'An independent film under the city lights.', category: 'film', price: 12, isFree: false, distanceKm: 14.3, groupMode: 'group' },
];