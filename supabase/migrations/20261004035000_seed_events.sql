insert into public.events (
  id, title, description, category, price, start_time, end_time, address,
  latitude, longitude, capacity, image_url, is_group_activity, is_outdoor
)
values
  ('00000000-0000-4000-8000-000000000001', 'Sunrise Trail Walk', 'A relaxed guided walk through the ridge trails. Coffee afterward.', 'Outdoors', 0, '2026-10-04T07:00:00Z', '2026-10-04T09:00:00Z', 'Redwood Ridge Trailhead', 37.7749, -122.4194, 20, 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80', true, true),
  ('00000000-0000-4000-8000-000000000002', 'Ceramics Taster Class', 'Learn hand-building basics and take home one small piece.', 'Creative', 35, '2026-10-05T18:30:00Z', '2026-10-05T20:30:00Z', 'Clay House Studio', 37.7849, -122.4094, 12, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80', true, false),
  ('00000000-0000-4000-8000-000000000003', 'Neighborhood Photo Scavenger Hunt', 'Explore familiar streets with a set of playful photo prompts.', 'Explore', 0, '2026-10-06T16:00:00Z', '2026-10-06T18:00:00Z', 'Mission Community Center', 37.7599, -122.4148, 30, 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=900&q=80', true, true),
  ('00000000-0000-4000-8000-000000000004', 'Beginner Bouldering Hour', 'A friendly intro session with gear and a short orientation included.', 'Movement', 22, '2026-10-07T19:00:00Z', '2026-10-07T20:30:00Z', 'Northside Climbing Gym', 37.7912, -122.4011, 16, 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80', true, false),
  ('00000000-0000-4000-8000-000000000005', 'Quiet Museum Morning', 'A self-guided visit with a suggested gallery route for a solo reset.', 'Culture', 18, '2026-10-08T10:00:00Z', '2026-10-08T12:00:00Z', 'Modern Arts Museum', 37.8007, -122.4189, 50, 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=80', false, false),
  ('00000000-0000-4000-8000-000000000006', 'Community Garden Volunteer Day', 'Help prep fall beds and meet the people growing food nearby.', 'Community', 0, '2026-10-09T09:00:00Z', '2026-10-09T12:00:00Z', 'Sunset Community Garden', 37.748, -122.494, 25, 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=900&q=80', true, true),
  ('00000000-0000-4000-8000-000000000007', 'Rooftop Film Night', 'Bring a blanket for an independent film under the city lights.', 'Film', 12, '2026-10-09T20:00:00Z', '2026-10-09T22:30:00Z', 'Harbor Roof Cinema', 37.789, -122.39, 80, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80', true, true),
  ('00000000-0000-4000-8000-000000000008', 'Morning Tai Chi in the Park', 'Gentle movement and breathing for all experience levels.', 'Wellness', 0, '2026-10-10T08:30:00Z', '2026-10-10T09:30:00Z', 'Golden Gate Park Lawn 4', 37.7694, -122.4862, 40, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80', true, true),
  ('00000000-0000-4000-8000-000000000009', 'Make Your Own Pasta', 'Roll, shape, and eat fresh pasta with a local chef.', 'Food', 55, '2026-10-10T17:00:00Z', '2026-10-10T19:30:00Z', 'Little Italy Kitchen', 37.7975, -122.405, 10, 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=900&q=80', true, false),
  ('00000000-0000-4000-8000-000000000010', 'Sunset Sketch Session', 'Bring any sketchbook and draw the waterfront with a local artist.', 'Creative', 0, '2026-10-11T17:30:00Z', '2026-10-11T19:00:00Z', 'Pier 7', 37.7989, -122.3975, 18, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80', false, true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  price = excluded.price,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  capacity = excluded.capacity,
  image_url = excluded.image_url,
  is_group_activity = excluded.is_group_activity,
  is_outdoor = excluded.is_outdoor;
