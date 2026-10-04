create or replace function public.events_nearby(
  lat double precision,
  lng double precision,
  radius_km double precision
)
returns setof public.events
language sql
stable
security definer
set search_path = public
as $$
  select event.*
  from public.events as event
  where 2 * 6371 * asin(sqrt(
    power(sin(radians(event.latitude - lat) / 2), 2)
    + cos(radians(lat))
      * cos(radians(event.latitude))
      * power(sin(radians(event.longitude - lng) / 2), 2)
  )) <= radius_km
  order by event.start_time nulls last;
$$;

grant execute on function public.events_nearby(double precision, double precision, double precision)
to anon, authenticated, service_role;
