-- On Fire Academy: كل الإصلاحات في ملف واحد.
-- انسخ الملف كله والصقه في Supabase → SQL Editor ثم اضغط Run مرة واحدة.
-- آمن وقابل لإعادة التشغيل، ولا يحذف أي بيانات.

-- ===== 1) روابط الفيديو من أي منصة =====
alter table public.lessons
  alter column youtube_id type text;

do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.lessons'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%youtube_id%'
  loop
    execute format('alter table public.lessons drop constraint %I', c.conname);
  end loop;
end $$;

-- ===== 2) الطالب يرى دروس صفه فقط (والدرس بدون صف يظهر للجميع، والمدير يرى الكل) =====
alter table public.lessons enable row level security;

drop policy if exists "lessons_same_grade_only" on public.lessons;

create policy "lessons_same_grade_only"
  on public.lessons
  as restrictive
  for select
  to authenticated
  using (
    lessons.grade_id is null
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'admin' or p.grade_id = lessons.grade_id)
    )
  );

-- ===== 3) إضافة مدير جديد بجانب المدير الحالي =====
-- لو البريد لم يسجّل حسابًا بعد، تظهر رسالة تنبيه فقط ويكتمل باقي الملف.
do $$
declare
  target_email text := 'abdallah11messi@gmail.com';
  target_id uuid;
begin
  select id into target_id
  from auth.users
  where lower(email) = lower(target_email)
  limit 1;

  if target_id is null then
    raise notice 'لا يوجد حساب بالبريد %. سجّل حسابًا على الموقع بهذا البريد ثم شغّل الملف مرة أخرى.', target_email;
    return;
  end if;

  insert into public.profiles (id, full_name, role)
  values (target_id, split_part(target_email, '@', 1), 'admin')
  on conflict (id) do update set role = 'admin';

  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = target_id;
end $$;

-- ===== 4) تأكيد بريد كل الحسابات العالقة (يحل مشكلة "البريد لم يتأكد" فورًا) =====
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;

-- ===== النتيجة: قائمة المديرين =====
select u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin'
order by u.email;
