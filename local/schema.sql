create table if not exists archive_files (
  id uuid primary key,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  category text not null check (category in ('image', 'text', 'document', 'other')),
  storage_path text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_archive_files_created_at on archive_files (created_at desc);
create index if not exists idx_archive_files_category on archive_files (category);

