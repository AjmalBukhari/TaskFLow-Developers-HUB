require('dotenv').config();
const supabase = require('./config/supabase');

async function setupDatabase() {
  console.log('Setting up Supabase tables...');

  // Create users table via SQL (via RPC or direct query)
  const createUsers = `
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      fullname text,
      email text unique,
      password text,
      created_at timestamp default now()
    )
  `;

  const createTasks = `
    create table if not exists tasks (
      id uuid primary key default gen_random_uuid(),
      title text,
      description text,
      status text default 'Pending',
      priority text default 'Medium',
      dueDate timestamp,
      user uuid references users(id),
      owner uuid references users(id),
      sharedWith uuid[],
      attachments jsonb,
      isDeleted boolean default false,
      deletedAt timestamp,
      created_at timestamp default now(),
      updated_at timestamp default now()
    )
  `;

  const createNotifications = `
    create table if not exists notifications (
      id uuid primary key default gen_random_uuid(),
      recipient uuid references users(id),
      message text,
      taskId uuid references tasks(id),
      type text,
      read boolean default false,
      created_at timestamp default now()
    )
  `;

  try {
    // Try to insert a test record to check if tables exist
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.message.includes('relation "users" does not exist')) {
      console.log('Tables do not exist. Please create them manually in Supabase SQL editor:');
      console.log(createUsers);
      console.log(createTasks);
      console.log(createNotifications);
    } else {
      console.log('Tables exist or there was another error');
    }
  } catch (err) {
    console.log('Error checking tables:', err.message);
  }
}

setupDatabase();