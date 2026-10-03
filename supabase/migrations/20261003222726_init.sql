create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text, 
  avatar_url text,
  current_streak int default 0,
  google_refresh_token text,
  created_at timestamptz default now()
);

create table preferences (
  preference_id uuid references profiles(id) on delete cascade,
  interests text[] default '{}',
  radius_km int default 10,
  min_price int default 0,
  max_price int default 50,
  group_pref text default 'either'   -- 'solo' | 'group' | 'either'
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'general',
  price numeric not null default 0,
  is_free boolean generated always as (price = 0) stored,
  start_time timestamptz,
  end_time timestamptz,
  address text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  capacity int not null default 20,
  image_url text,
  is_group_activity boolean default false,
  is_outdoor boolean default false,
  source_url text unique,
  created_at timestamptz default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_id uuid references events(id),
  media_url text not null,
  media_type text not null check (media_type in ('image','video')),
  caption text not null default '',
  created_at timestamptz default now()
);

create table weekly_prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null default 'general',
  event_id uuid references events(id),
  week_start date not null unique
);

create table event_participants (
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  calendar_event_id text,
  primary key (event_id, user_id)
);

create table friendships (
  user_id uuid references profiles(id) on delete cascade,
  friend_id uuid references profiles(id) on delete cascade,
  primary key (user_id, friend_id)
);

create table push_tokens (
  user_id uuid references profiles(id) on delete cascade,
  token text primary key
);