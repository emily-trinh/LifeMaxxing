import type { CandidateEvent, UserPreferences } from '../types/recommendation';

export const testPreferences: UserPreferences = {
  interests: ['fitness', 'outdoors', 'social'],
  likes: ['beginner-friendly activities', 'meeting new people', 'fresh air'],
  dislikes: ['competitive games'],
  radiusKm: 12,
  minPrice: 0,
  maxPrice: 25,
  groupMode: 'group',
};

export const testEvents: CandidateEvent[] = [
  { id: 'event-101', title: 'Sunrise Trail Walk', description: 'A guided two-hour walk with coffee afterward.', category: 'outdoors', price: 0, isFree: true, distanceKm: 4.2, groupMode: 'group' },
  { id: 'event-102', title: 'Sunset Beach Volleyball', description: 'A casual team game for all experience levels.', category: 'fitness', price: 0, isFree: true, distanceKm: 3.5, groupMode: 'group' },
  { id: 'event-103', title: 'Quiet Museum Morning', description: 'A self-guided gallery route for a solo reset.', category: 'culture', price: 18, isFree: false, distanceKm: 3.1, groupMode: 'solo' },
  { id: 'event-104', title: 'Beginner Ceramics Social', description: 'Make a small planter while chatting with other first-timers.', category: 'art', price: 20, isFree: false, distanceKm: 6.4, groupMode: 'group' },
  { id: 'event-105', title: 'Community Garden Volunteer Day', description: 'Help prepare fall beds with local gardeners.', category: 'volunteering', price: 0, isFree: true, distanceKm: 9.8, groupMode: 'group' },
  { id: 'event-106', title: 'Make Your Own Pasta', description: 'A hands-on cooking class with a local chef.', category: 'food', price: 55, isFree: false, distanceKm: 5.6, groupMode: 'group' },
  { id: 'event-107', title: 'Rooftop Film Night', description: 'An independent film under the city lights.', category: 'culture', price: 12, isFree: false, distanceKm: 14.3, groupMode: 'group' },
];