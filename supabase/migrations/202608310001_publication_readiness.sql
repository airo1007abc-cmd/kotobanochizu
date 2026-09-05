-- Publication-readiness hardening. Apply after 202608250001_initial_schema.sql.
-- This migration is intentionally not applied automatically by the frontend build.

alter type public.verification_status add value if not exists 'needs_review';
alter type public.verification_status add value if not exists 'community_confirmed';
alter type public.verification_status add value if not exists 'reference_confirmed';

create type public.staff_role as enum ('moderator', 'admin');
create type public.media_scope as enum ('site_only', 'education', 'commercial_license');
create type public.speaker_display as enum ('anonymous', 'age_and_region', 'credited');
create type public.correction_status as enum ('received', 'investigating', 'resolved', 'dismissed');

create table public.staff_roles (
  user_id uuid primary key references auth.users on delete cascade,
  role public.staff_role not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users
);

alter table public.staff_roles enable row level security;

create or replace function public.is_staff(required_role public.staff_role default 'moderator')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_roles
    where user_id = auth.uid()
      and (role = required_role or role = 'admin')
  );
$$;

revoke all on function public.is_staff(public.staff_role) from public;
grant execute on function public.is_staff(public.staff_role) to authenticated;

create policy "staff read staff roles"
on public.staff_roles for select to authenticated
using (public.is_staff('moderator'));

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  dialect_id uuid references public.dialect_expressions on delete cascade,
  conversation_id uuid references public.conversations on delete cascade,
  published_storage_path text,
  mime_type text not null check (mime_type in ('audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'video/mp4', 'video/webm')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 104857600),
  duration_seconds numeric(8,2) check (duration_seconds > 0 and duration_seconds <= 900),
  transcript text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((dialect_id is not null)::int + (conversation_id is not null)::int = 1),
  check (not published or published_storage_path is not null)
);

create table public.media_asset_private (
  media_asset_id uuid primary key references public.media_assets on delete cascade,
  private_storage_path text not null,
  checksum_sha256 text not null check (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now()
);

create table public.media_consents (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid not null unique references public.media_assets on delete cascade,
  consent_version text not null,
  consent_recorded_at timestamptz not null,
  scope public.media_scope not null,
  speaker_display public.speaker_display not null default 'anonymous',
  guardian_consent boolean not null default false,
  subject_was_minor boolean not null default false,
  withdrawal_contact_configured boolean not null default false,
  withdrawn_at timestamptz,
  evidence_private_path text not null,
  recorded_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  check (not subject_was_minor or guardian_consent),
  check (withdrawn_at is null or withdrawn_at >= consent_recorded_at)
);

create table public.correction_requests (
  id uuid primary key default gen_random_uuid(),
  dialect_id uuid references public.dialect_expressions on delete set null,
  conversation_id uuid references public.conversations on delete set null,
  request_type text not null check (request_type in ('factual_error', 'regional_difference', 'rights', 'consent_withdrawal', 'harmful_context', 'other')),
  message text not null check (char_length(message) between 10 and 4000),
  contact_email text,
  status public.correction_status not null default 'received',
  assigned_to uuid references auth.users,
  resolution_note text,
  submitted_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (dialect_id is not null or conversation_id is not null),
  check (resolved_at is null or status in ('resolved', 'dismissed'))
);

create table public.moderation_events (
  id bigint generated always as identity primary key,
  submission_id uuid references public.submissions on delete set null,
  dialect_id uuid references public.dialect_expressions on delete set null,
  actor_id uuid not null references auth.users,
  action text not null,
  from_status text,
  to_status text,
  note text,
  created_at timestamptz not null default now()
);

alter table public.submissions
  add column if not exists consent_version text,
  add column if not exists rights_confirmed_at timestamptz,
  add column if not exists withdrawal_terms_accepted boolean not null default false;

alter table public.media_assets enable row level security;
alter table public.media_asset_private enable row level security;
alter table public.media_consents enable row level security;
alter table public.correction_requests enable row level security;
alter table public.moderation_events enable row level security;

create policy "public reads consented published media metadata"
on public.media_assets for select to anon, authenticated
using (
  published
  and exists (
    select 1 from public.media_consents consent
    where consent.media_asset_id = id
      and consent.withdrawn_at is null
      and consent.withdrawal_contact_configured
  )
);

create policy "staff manage media assets"
on public.media_assets for all to authenticated
using (public.is_staff('moderator'))
with check (public.is_staff('moderator'));

create policy "staff manage private media records"
on public.media_asset_private for all to authenticated
using (public.is_staff('moderator'))
with check (public.is_staff('moderator'));

create policy "staff manage private consent records"
on public.media_consents for all to authenticated
using (public.is_staff('moderator'))
with check (public.is_staff('moderator'));

create policy "anyone submits correction requests"
on public.correction_requests for insert to anon, authenticated
with check (status = 'received' and assigned_to is null and resolution_note is null and resolved_at is null);

create policy "staff manage correction requests"
on public.correction_requests for all to authenticated
using (public.is_staff('moderator'))
with check (public.is_staff('moderator'));

create policy "staff read moderation audit"
on public.moderation_events for select to authenticated
using (public.is_staff('moderator'));

create policy "staff append moderation audit"
on public.moderation_events for insert to authenticated
with check (public.is_staff('moderator') and actor_id = auth.uid());

create policy "staff review submissions"
on public.submissions for update to authenticated
using (public.is_staff('moderator'))
with check (public.is_staff('moderator'));

create index media_assets_dialect_idx on public.media_assets(dialect_id) where dialect_id is not null;
create index media_assets_conversation_idx on public.media_assets(conversation_id) where conversation_id is not null;
create index correction_requests_status_idx on public.correction_requests(status, submitted_at);
create index moderation_events_submission_idx on public.moderation_events(submission_id, created_at);

-- Storage policies must be created after bucket provisioning. Keep originals and
-- consent evidence in private buckets. Only a trusted server/moderator workflow may
-- copy a transformed asset into the public bucket after the media_assets +
-- media_consents publication predicate above is satisfied.
