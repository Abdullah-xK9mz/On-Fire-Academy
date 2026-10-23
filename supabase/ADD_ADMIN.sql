-- إضافة مدير جديد بجانب المدير الحالي (لا يغيّر أي حساب آخر).
-- شغّل هذا الملف مرة واحدة من Supabase → SQL Editor.
-- مهم: يجب أن يكون صاحب البريد قد أنشأ حسابًا على الموقع أولًا.

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
    raise exception 'لا يوجد حساب بالبريد %. سجّل حسابًا على الموقع بهذا البريد أولًا ثم أعد تشغيل الملف.', target_email;
  end if;

  insert into public.profiles (id, full_name, role)
  values (target_id, split_part(target_email, '@', 1), 'admin')
  on conflict (id) do update set role = 'admin';

  raise notice 'تم: % أصبح مديرًا.', target_email;
end $$;

-- عرض كل المديرين للتأكد (يجب أن يظهر البريد الجديد مع البريد القديم).
select u.email, p.full_name, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin'
order by u.email;
