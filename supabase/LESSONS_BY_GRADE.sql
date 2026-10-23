-- حماية إضافية من قاعدة البيانات: الطالب لا يستطيع قراءة دروس صف غير صفه
-- حتى لو حاول طلبها مباشرة من الـ API.
-- (الموقع نفسه يخفيها بالفعل، هذا الملف اختياري ويُشغَّل مرة واحدة في SQL Editor.)
--
-- الدرس بدون صف (grade_id فارغ) يظهر لكل الصفوف.
-- المدير يرى كل الدروس.

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
