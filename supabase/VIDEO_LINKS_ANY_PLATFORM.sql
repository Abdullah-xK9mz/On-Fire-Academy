-- On Fire Academy: السماح بحفظ روابط فيديو من أي منصة أو استضافة.
-- آمن وقابل لإعادة التشغيل، ولا يحذف أي بيانات.
-- روابط YouTube القديمة (معرّف 11 حرفًا) تظل تعمل كما هي.

-- 1) اجعل عمود الفيديو نصًا بطول مفتوح (الروابط الطويلة مثل Google Drive وFacebook).
alter table public.lessons
  alter column youtube_id type text;

-- 2) احذف أي قيد يجبر العمود على صيغة YouTube فقط.
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

-- 3) تحقق: يجب أن تكون النتيجة text ولا توجد قيود على العمود.
select data_type, character_maximum_length
from information_schema.columns
where table_schema = 'public' and table_name = 'lessons' and column_name = 'youtube_id';
