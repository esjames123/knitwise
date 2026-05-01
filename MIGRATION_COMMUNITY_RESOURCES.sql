-- community_resources table
create table if not exists community_resources (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users,
  title         text not null,
  link          text not null,
  category      text not null check (category in ('beginner_knitting','crochet','weaving','spinning','felting','dyeing','other')),
  description   text,
  image_url     text,
  creator_name  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  flag_count    int not null default 0,
  is_flagged    bool not null default false,
  unique (user_id, link)
);

-- community_resource_flags table
create table if not exists community_resource_flags (
  id          uuid primary key default gen_random_uuid(),
  resource_id uuid not null references community_resources(id) on delete cascade,
  user_id     uuid not null references auth.users(id),
  reason      text,
  created_at  timestamptz not null default now(),
  unique (resource_id, user_id)
);

-- Indices
create index if not exists idx_community_resources_user_id    on community_resources (user_id);
create index if not exists idx_community_resources_category   on community_resources (category);
create index if not exists idx_community_resources_is_flagged on community_resources (is_flagged);
create index if not exists idx_community_resource_flags_pair  on community_resource_flags (resource_id, user_id);

-- RLS on community_resources
alter table community_resources enable row level security;

create policy "public_select_unflagged_resources"
  on community_resources for select
  using (is_flagged = false);

create policy "auth_insert_resource"
  on community_resources for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "owner_update_resource"
  on community_resources for update
  to authenticated
  using (user_id = auth.uid());

create policy "owner_delete_resource"
  on community_resources for delete
  to authenticated
  using (user_id = auth.uid());

-- RLS on community_resource_flags
alter table community_resource_flags enable row level security;

create policy "auth_insert_resource_flag"
  on community_resource_flags for insert
  to authenticated
  with check (user_id = auth.uid());

-- Trigger: increment flag_count and auto-hide at 5 flags
create or replace function handle_community_resource_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update community_resources
  set
    flag_count = flag_count + 1,
    is_flagged = case when flag_count + 1 >= 5 then true else is_flagged end
  where id = NEW.resource_id;
  return NEW;
end;
$$;

create trigger on_community_resource_flag_insert
  after insert on community_resource_flags
  for each row execute procedure handle_community_resource_flag();
