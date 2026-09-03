-- Milich Project Manager - secure single-user Supabase schema
create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  name text not null,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'انجام نشده',
  priority text not null default 'عادی',
  do_date date,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.tasks enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;

create policy "owner projects select" on public.projects for select to authenticated using ((select auth.uid()) = owner_id);
create policy "owner projects insert" on public.projects for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "owner projects update" on public.projects for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "owner projects delete" on public.projects for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "owner tasks select" on public.tasks for select to authenticated using ((select auth.uid()) = owner_id);
create policy "owner tasks insert" on public.tasks for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "owner tasks update" on public.tasks for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "owner tasks delete" on public.tasks for delete to authenticated using ((select auth.uid()) = owner_id);

create index if not exists projects_owner_idx on public.projects(owner_id);
create index if not exists tasks_owner_idx on public.tasks(owner_id);
create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_deadline_idx on public.tasks(deadline);
