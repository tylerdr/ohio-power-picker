-- REVIEW PROPOSAL ONLY. Not a migration applied to any resource.
-- Requires independently verified dedicated Supabase project and existing auth users/sessions.
begin;
create schema if not exists ohio_assessment_private;
revoke all on schema ohio_assessment_private from public, anon, authenticated;
create table ohio_assessment_private.memberships (
 tenant uuid not null, owner uuid not null references auth.users(id), active boolean not null default false,
 primary key(tenant,owner)
);
create table ohio_assessment_private.records (
 id text primary key check (id ~ '^[a-zA-Z0-9_-]{1,80}$'), tenant uuid not null, owner uuid not null,
 registration jsonb not null, saved jsonb, revision bigint not null default 0,
 active boolean not null default true,
 foreign key(tenant,owner) references ohio_assessment_private.memberships(tenant,owner),
 check (registration->>'id'=id and registration->>'tenant'=tenant::text and registration->>'owner'=owner::text),
 check (registration->'scope'->>'kind'='measurement-gap-only' and registration->'scope'->>'priceCents'='50000' and registration->'scope'->>'pilot'='1')
);
create unique index ohio_assessment_one_pilot on ohio_assessment_private.records(tenant) where active;
alter table ohio_assessment_private.memberships enable row level security;
alter table ohio_assessment_private.records enable row level security;
revoke all on all tables in schema ohio_assessment_private from public, anon, authenticated;
-- No client table policy/grant or public registration path. Trusted operator seeds accepted
-- scope/registered invoice/available single slot only after independent business acceptance.
create function public.ohio_assessment_actor(p_owner uuid,p_tenant uuid,p_session uuid)
returns jsonb language sql security definer set search_path='' as $$
 select jsonb_build_object('owner',m.owner,'tenant',m.tenant,'session_id',s.id)
 from ohio_assessment_private.memberships m
 join auth.sessions s on s.user_id=m.owner and s.id=p_session
 where m.owner=p_owner and m.tenant=p_tenant and m.active
 and (s.not_after is null or s.not_after>now());
$$;
create function public.ohio_assessment_load(p_id text,p_owner uuid,p_tenant uuid,p_session uuid)
returns jsonb language sql security definer set search_path='' as $$
 select jsonb_build_object('revision',r.revision,'row',jsonb_strip_nulls(jsonb_build_object('registration',r.registration,'saved',r.saved)))
 from ohio_assessment_private.records r
 join ohio_assessment_private.memberships m using(tenant,owner)
 where r.id=p_id and r.owner=p_owner and r.tenant=p_tenant and r.active and m.active
 and exists(select 1 from auth.sessions s where s.id=p_session and s.user_id=p_owner and (s.not_after is null or s.not_after>clock_timestamp()));
$$;
create function public.ohio_assessment_commit(p_id text,p_owner uuid,p_tenant uuid,p_session uuid,p_revision bigint,p_saved jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare r ohio_assessment_private.records; v bigint; prior_v bigint; begin
 -- NULL must deny; SQL three-valued comparisons cannot authorize CAS.
 if p_revision is null or p_revision < 0 then return false; end if;
 if jsonb_typeof(p_saved) is distinct from 'object' or jsonb_typeof(p_saved->'version') is distinct from 'number' then return false; end if;
 if (p_saved->>'version') !~ '^[1-9][0-9]{0,15}$' then return false; end if;
 if (p_saved->>'version')::numeric > 9007199254740991 then return false; end if;
 v := (p_saved->>'version')::bigint;
 -- Hold the actual owner-session row through CAS. A concurrent session DELETE must
 -- serialize before denial or after this transaction; a deleted session cannot commit.
 perform 1 from auth.sessions s where s.id=p_session and s.user_id=p_owner
 and (s.not_after is null or s.not_after>clock_timestamp()) for share;
 if not found then return false; end if;
 select * into r from ohio_assessment_private.records where id=p_id and owner=p_owner and tenant=p_tenant and active for update;
 if not found or r.revision is distinct from p_revision or not exists(select 1 from ohio_assessment_private.memberships where owner=p_owner and tenant=p_tenant and active) then return false; end if;
 if not exists(select 1 from auth.sessions s where s.id=p_session and s.user_id=p_owner and (s.not_after is null or s.not_after>clock_timestamp())) then return false; end if;
 if p_saved->'registration' is distinct from r.registration or jsonb_typeof(p_saved->'original') is distinct from 'object' then return false; end if;
 if r.saved is not null then
   if p_saved->'original' is distinct from r.saved->'original' then return false; end if;
   if jsonb_typeof(r.saved->'version') is distinct from 'number' or (r.saved->>'version') !~ '^[1-9][0-9]{0,15}$' then return false; end if;
   if (r.saved->>'version')::numeric > 9007199254740991 then return false; end if;
   prior_v := (r.saved->>'version')::bigint;
   if p_saved is distinct from r.saved and v is distinct from prior_v+1 then return false; end if;
 else
   if v is distinct from 1 or p_saved->'original'->'scope' is distinct from r.registration->'scope' then return false; end if;
 end if;
 update ohio_assessment_private.records set saved=p_saved,revision=revision+1 where id=p_id;
 return true;
end $$;
revoke all on function public.ohio_assessment_actor(uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function public.ohio_assessment_load(text,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function public.ohio_assessment_commit(text,uuid,uuid,uuid,bigint,jsonb) from public,anon,authenticated;
grant execute on function public.ohio_assessment_actor(uuid,uuid,uuid) to service_role;
grant execute on function public.ohio_assessment_load(text,uuid,uuid,uuid) to service_role;
grant execute on function public.ohio_assessment_commit(text,uuid,uuid,uuid,bigint,jsonb) to service_role;
commit;
