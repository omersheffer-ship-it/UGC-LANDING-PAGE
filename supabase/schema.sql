-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Creates the leads table and locks it down so the anon (browser) key
-- can only INSERT — no SELECT, UPDATE, or DELETE from outside.

create extension if not exists pgcrypto; -- provides gen_random_uuid()

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  source text default 'landing-page',
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.leads enable row level security;

-- Allow ONLY inserts from the anon (public/browser) role.
create policy "Allow public insert for leads"
on public.leads
for insert
to anon
with check (true);

-- Deliberately no select/update/delete policies:
-- under RLS, operations with no matching policy are denied by default.

-- Grant table-level INSERT to the anon role. RLS policies only take
-- effect once a role already has the underlying table privilege —
-- without this grant, PostgREST returns "permission denied for table"
-- before RLS is even evaluated, blocking legitimate inserts too.
-- Deliberately NOT granting select/update/delete to anon.
grant insert on public.leads to anon;
