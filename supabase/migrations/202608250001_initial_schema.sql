-- ことばの地図: 将来接続用の初期案。Supabase未接続のため未適用。
create type public.verification_status as enum ('demo', 'community', 'reviewed');
create type public.moderation_status as enum ('submitted', 'under_review', 'approved', 'rejected');
create type public.reaction_kind as enum ('use', 'heard', 'new');
create table public.prefectures (id uuid primary key default gen_random_uuid(), code smallint unique not null check (code between 1 and 47), name text not null, area text not null, summary text not null default '');
create table public.regions (id uuid primary key default gen_random_uuid(), prefecture_id uuid not null references public.prefectures on delete cascade, name text not null, description text not null default '', unique(prefecture_id, name));
create table public.dialect_expressions (id uuid primary key default gen_random_uuid(), phrase text not null, reading text not null default '', standard_japanese text not null, description text not null default '', example_dialect text, example_standard text, prefecture_id uuid not null references public.prefectures, region_id uuid references public.regions, municipality text, age_groups text[] not null default '{}', usage_contexts text[] not null default '{}', emotion_tags text[] not null default '{}', usage_frequency text, recording_year smallint, verification_status public.verification_status not null default 'community', source_type text not null default 'submission', audio_path text, video_path text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.sources (id uuid primary key default gen_random_uuid(), source_type text not null, title text, organization text, url text, note text, checked_at date, created_at timestamptz not null default now());
create table public.dialect_sources (dialect_id uuid not null references public.dialect_expressions on delete cascade, source_id uuid not null references public.sources on delete cascade, summary_note text, primary key(dialect_id, source_id));
create table public.conversations (id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', prefecture_id uuid not null references public.prefectures, region_id uuid references public.regions, usage_context text, recorded_year smallint, verification_status public.verification_status not null default 'community', created_at timestamptz not null default now());
create table public.conversation_lines (id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations on delete cascade, position smallint not null, speaker_label text not null, dialect_text text not null, standard_text text not null, dialect_id uuid references public.dialect_expressions, unique(conversation_id, position));
create table public.submissions (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users, type text not null check(type in ('dialect','conversation')), payload jsonb not null, status public.moderation_status not null default 'submitted', moderation_note text, reviewed_by uuid references auth.users, submitted_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.favorites (user_id uuid not null references auth.users on delete cascade, dialect_id uuid not null references public.dialect_expressions on delete cascade, created_at timestamptz not null default now(), primary key(user_id, dialect_id));
create table public.reactions (user_id uuid not null references auth.users on delete cascade, dialect_id uuid not null references public.dialect_expressions on delete cascade, kind public.reaction_kind not null, created_at timestamptz not null default now(), primary key(user_id, dialect_id));
alter table public.dialect_expressions enable row level security; alter table public.conversations enable row level security; alter table public.submissions enable row level security; alter table public.favorites enable row level security; alter table public.reactions enable row level security;
create policy "public reads reviewed expressions" on public.dialect_expressions for select using (verification_status in ('demo','reviewed'));
create policy "public reads reviewed conversations" on public.conversations for select using (verification_status in ('demo','reviewed'));
create policy "users create own submissions" on public.submissions for insert to authenticated with check (auth.uid() = user_id);
create policy "users read own submissions" on public.submissions for select to authenticated using (auth.uid() = user_id);
create policy "users manage own favorites" on public.favorites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own reactions" on public.reactions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- moderator/admin policies should use a private role table checked by a security-definer function; never trust client metadata alone.

create index dialect_expressions_prefecture_idx on public.dialect_expressions(prefecture_id);
create index dialect_expressions_region_idx on public.dialect_expressions(region_id);
create index dialect_expressions_phrase_idx on public.dialect_expressions(lower(phrase));
create index dialect_expressions_standard_idx on public.dialect_expressions(lower(standard_japanese));
create index dialect_expressions_age_groups_gin on public.dialect_expressions using gin(age_groups);
create index dialect_expressions_contexts_gin on public.dialect_expressions using gin(usage_contexts);
create index dialect_expressions_emotions_gin on public.dialect_expressions using gin(emotion_tags);
-- 日本語部分一致は単純なPostgres辞書では不十分。導入環境で許可される場合はpg_bigm、
-- それ以外はアプリ側でNFKC/かな正規化したsearch_text列 + trigram indexを追加する。
