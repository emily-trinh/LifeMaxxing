insert into public.events (
  id, title, description, category, price, start_time, end_time, address,
  latitude, longitude, capacity, image_url, is_group_activity, is_outdoor
)
values
  ('00000000-0000-4000-8000-000000000011', 'Beginner Pickleball Social', 'Learn the basics, play a few friendly rounds, and meet other beginners.', 'fitness', 8, '2026-10-12T18:00:00Z', '2026-10-12T20:00:00Z', 'Mission Recreation Center', 37.7595, -122.4148, 24, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80', true, false),
  ('00000000-0000-4000-8000-000000000012', 'Intro to Watercolor', 'A relaxed workshop covering color, brushwork, and a simple landscape.', 'art', 28, '2026-10-13T18:30:00Z', '2026-10-13T20:30:00Z', 'North Beach Art Room', 37.8005, -122.4072, 14, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80', true, false),
  ('00000000-0000-4000-8000-000000000013', 'Taco Walk and Tasting', 'Sample three neighborhood taquerias with a local food guide.', 'food', 25, '2026-10-14T18:00:00Z', '2026-10-14T20:00:00Z', 'Mission Dolores Park', 37.7596, -122.4269, 16, 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80', true, true),
  ('00000000-0000-4000-8000-000000000014', 'Board Game Cafe Night', 'Bring your favorite game or try a new one with a welcoming group.', 'games', 10, '2026-10-15T18:30:00Z', '2026-10-15T21:00:00Z', 'Haight Game Cafe', 37.7697, -122.4486, 30, 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=900&q=80', true, false),
  ('00000000-0000-4000-8000-000000000015', 'Sunset Community Run', 'A casual five-kilometer run with pace groups and post-run snacks.', 'fitness', 0, '2026-10-16T17:30:00Z', '2026-10-16T19:00:00Z', 'Crissy Field East Beach', 37.8037, -122.455, 40, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80', true, true),
  ('00000000-0000-4000-8000-000000000016', 'Open Mic Storytelling', 'Share a five-minute story or listen to local voices over coffee.', 'social', 5, '2026-10-17T19:00:00Z', '2026-10-17T21:00:00Z', 'Bernal Heights Community Hall', 37.7398, -122.4148, 35, 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80', true, false),
  ('00000000-0000-4000-8000-000000000017', 'Forest Bathing Walk', 'Slow down with a guided sensory walk among eucalyptus and redwoods.', 'wellness', 15, '2026-10-18T09:00:00Z', '2026-10-18T11:00:00Z', 'Presidio Visitor Center', 37.7989, -122.4662, 18, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80', true, true),
  ('00000000-0000-4000-8000-000000000018', 'Community Mural Paint Day', 'Help add color to a neighborhood mural with local artists.', 'art', 0, '2026-10-19T11:00:00Z', '2026-10-19T15:00:00Z', 'Dogpatch Arts District', 37.7561, -122.3882, 25, 'https://images.unsplash.com/photo-1561839561-b13bcfe95249?auto=format&fit=crop&w=900&q=80', true, false),
  ('00000000-0000-4000-8000-000000000019', 'Intro to Urban Gardening', 'Plant herbs in a take-home container and learn seasonal growing basics.', 'volunteering', 12, '2026-10-20T17:30:00Z', '2026-10-20T19:00:00Z', 'Potrero Hill Garden', 37.7561, -122.4012, 16, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80', true, false),
  ('00000000-0000-4000-8000-000000000020', 'Indie Book Club Meetup', 'Discuss a short novel with neighbors over tea in a quiet bookstore.', 'culture', 0, '2026-10-21T18:30:00Z', '2026-10-21T20:00:00Z', 'Civic Center Books', 37.7793, -122.4162, 20, 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=900&q=80', true, false)
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
