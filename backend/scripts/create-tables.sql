-- Drop existing tables
drop table if exists notifications;
drop table if exists tasks;
drop table if exists users;

-- Create users table
create table users (
  id uuid primary key default gen_random_uuid(),
  fullname text,
  email text unique,
  password text,
  "createdAt" timestamp default now()
);

-- Create tasks table with ALL required columns
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  status text default 'Pending',
  priority text default 'Low',
  "dueDate" timestamp,
  user_id uuid references users(id),
  owner uuid references users(id),
  "sharedWith" uuid[],
  attachments jsonb,
  pinned boolean default false,
  "isDeleted" boolean default false,
  "deletedAt" timestamp,
  "createdAt" timestamp default now(),
  "updatedAt" timestamp default now()
);

-- Create notifications table
create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient uuid references users(id),
  message text,
  "taskId" uuid references tasks(id),
  type text,
  read boolean default false,
  "createdAt" timestamp default now()
);