update public.events
set category = case category
  when 'Outdoors' then 'outdoors'
  when 'Creative' then 'art'
  when 'Explore' then 'social'
  when 'Movement' then 'athletic'
  when 'Culture' then 'culture'
  when 'Community' then 'volunteering'
  when 'Film' then 'culture'
  when 'Wellness' then 'wellness'
  when 'Food' then 'food'
  else lower(category)
end
where category is not null;
