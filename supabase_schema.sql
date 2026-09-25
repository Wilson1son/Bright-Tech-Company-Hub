-- Run this in your Supabase project's SQL Editor (left sidebar -> SQL Editor -> New query)
-- It creates the installations table used by the Installation Records tab.

create table if not exists installations (
  id text primary key,
  customer text not null,
  address text not null,
  serial text not null,
  engineer text default 'Unassigned',
  status text default 'Pending' check (status in ('Pending', 'Testing', 'Complete')),
  install_date date default current_date,
  created_at timestamp with time zone default now()
);

-- Enable row level security
alter table installations enable row level security;

-- Allow anyone using the app's anon key to read and write.
-- This is fine for an internal prototype behind the app's own role screen,
-- but a production version should tighten this to authenticated staff only.
create policy "Allow all access to installations"
  on installations
  for all
  using (true)
  with check (true);

-- Seed a few starter rows so the table is not empty on first load
insert into installations (id, customer, address, serial, engineer, status, install_date) values
  ('INS-1042', 'Adebayo Motors', '14 Ijaye Rd, Abeokuta', 'CPE-88213', 'Tunde B.', 'Complete', '2026-09-02'),
  ('INS-1043', 'Grace Fashion House', 'Onikolobo, Abeokuta', 'CPE-88214', 'Wale O.', 'Testing', '2026-09-05'),
  ('INS-1044', 'Femi Okafor (Residential)', 'Kotopo Estate, Abeokuta', 'CPE-88215', 'Tunde B.', 'Pending', '2026-09-08')
on conflict (id) do nothing;
