-- On Fire Academy: الصفوف والمواد وتعيينات المدرسين
-- قابل لإعادة التشغيل: لا ينشئ الصف أو المادة أو التعيين مرتين.

-- 1) تأكد من وجود الصفوف الستة.
insert into public.grades (name, position)
select v.name, v.position
from (values
  ('الصف الأول الإعدادي', 1),
  ('الصف الثاني الإعدادي', 2),
  ('الصف الثالث الإعدادي', 3),
  ('الصف الأول الثانوي', 4),
  ('الصف الثاني الثانوي', 5),
  ('الصف الثالث الثانوي', 6)
) as v(name, position)
where not exists (select 1 from public.grades g where g.name = v.name);

-- 2) تأكد من وجود المواد المطلوبة.
insert into public.subjects (name)
select v.name
from (values
  ('عربي'), ('فلسفة'), ('علوم'), ('علوم متكاملة'), ('كيمياء'),
  ('دراسات'), ('تاريخ'), ('جيولوجيا'), ('رياضيات'), ('فرنساوي'), ('إنجليزي')
) as v(name)
where not exists (select 1 from public.subjects s where s.name = v.name);

-- 3) اربط كل تعيين بصف دراسي. المدرس نفسه قد يظهر في أكثر من صف/مادة.
alter table public.subject_teachers
  add column if not exists grade_id uuid references public.grades(id) on delete cascade;

-- القيد القديم كان يمنع تكرار اسم المدرس في المادة عبر الصفوف.
alter table public.subject_teachers
  drop constraint if exists subject_teachers_subject_id_name_key;

create index if not exists subject_teachers_grade_subject_idx
  on public.subject_teachers (grade_id, subject_id);

with assignments(teacher, subject_name, position) as (
  values
    ('علاء الجالي','فلسفة',4), ('علاء الجالي','فلسفة',5),
    ('محمد فهمي','عربي',1), ('محمد فهمي','عربي',2), ('محمد فهمي','عربي',3),
    ('محمد فهمي','عربي',4), ('محمد فهمي','عربي',5), ('محمد فهمي','عربي',6),
    ('هيثم ثابت','عربي',1), ('هيثم ثابت','عربي',2), ('هيثم ثابت','عربي',3),
    ('بيتر رضا','علوم',1), ('بيتر رضا','علوم',2), ('بيتر رضا','علوم',3),
    ('بيتر رضا','علوم متكاملة',4), ('بيتر رضا','كيمياء',5), ('بيتر رضا','كيمياء',6),
    ('إبراهيم الدوسري','دراسات',1), ('إبراهيم الدوسري','دراسات',2), ('إبراهيم الدوسري','دراسات',3),
    ('إبراهيم الدوسري','تاريخ',4), ('إبراهيم الدوسري','تاريخ',5), ('إبراهيم الدوسري','تاريخ',6),
    ('محمود حسان','علوم',1), ('محمود حسان','علوم',2), ('محمود حسان','علوم',3),
    ('محمود حسان','علوم متكاملة',4), ('محمود حسان','جيولوجيا',6),
    ('إسلام سليمان','رياضيات',4), ('إسلام سليمان','رياضيات',5), ('إسلام سليمان','رياضيات',6),
    ('محمد الشيخ','رياضيات',4), ('محمد الشيخ','رياضيات',5), ('محمد الشيخ','رياضيات',6),
    ('عبد الرحمن عبيد','فرنساوي',1), ('عبد الرحمن عبيد','فرنساوي',2), ('عبد الرحمن عبيد','فرنساوي',3),
    ('عبد الرحمن عبيد','فرنساوي',4), ('عبد الرحمن عبيد','فرنساوي',5), ('عبد الرحمن عبيد','فرنساوي',6),
    ('سلمى جمعة','إنجليزي',1), ('سلمى جمعة','إنجليزي',2), ('سلمى جمعة','إنجليزي',3)
)
update public.subject_teachers st
set grade_id = (
  select g.id
  from assignments a
  join public.subjects s on s.name = a.subject_name
  join public.grades g on g.position = a.position
  where a.teacher = st.name and s.id = st.subject_id
  order by a.position
  limit 1
)
where st.grade_id is null
  and exists (
    select 1 from assignments a
    join public.subjects s on s.name = a.subject_name
    where a.teacher = st.name and s.id = st.subject_id
  );

with assignments(teacher, subject_name, position) as (
  values
    ('علاء الجالي','فلسفة',4), ('علاء الجالي','فلسفة',5),
    ('محمد فهمي','عربي',1), ('محمد فهمي','عربي',2), ('محمد فهمي','عربي',3),
    ('محمد فهمي','عربي',4), ('محمد فهمي','عربي',5), ('محمد فهمي','عربي',6),
    ('هيثم ثابت','عربي',1), ('هيثم ثابت','عربي',2), ('هيثم ثابت','عربي',3),
    ('بيتر رضا','علوم',1), ('بيتر رضا','علوم',2), ('بيتر رضا','علوم',3),
    ('بيتر رضا','علوم متكاملة',4), ('بيتر رضا','كيمياء',5), ('بيتر رضا','كيمياء',6),
    ('إبراهيم الدوسري','دراسات',1), ('إبراهيم الدوسري','دراسات',2), ('إبراهيم الدوسري','دراسات',3),
    ('إبراهيم الدوسري','تاريخ',4), ('إبراهيم الدوسري','تاريخ',5), ('إبراهيم الدوسري','تاريخ',6),
    ('محمود حسان','علوم',1), ('محمود حسان','علوم',2), ('محمود حسان','علوم',3),
    ('محمود حسان','علوم متكاملة',4), ('محمود حسان','جيولوجيا',6),
    ('إسلام سليمان','رياضيات',4), ('إسلام سليمان','رياضيات',5), ('إسلام سليمان','رياضيات',6),
    ('محمد الشيخ','رياضيات',4), ('محمد الشيخ','رياضيات',5), ('محمد الشيخ','رياضيات',6),
    ('عبد الرحمن عبيد','فرنساوي',1), ('عبد الرحمن عبيد','فرنساوي',2), ('عبد الرحمن عبيد','فرنساوي',3),
    ('عبد الرحمن عبيد','فرنساوي',4), ('عبد الرحمن عبيد','فرنساوي',5), ('عبد الرحمن عبيد','فرنساوي',6),
    ('سلمى جمعة','إنجليزي',1), ('سلمى جمعة','إنجليزي',2), ('سلمى جمعة','إنجليزي',3)
)
insert into public.subject_teachers (subject_id, name, grade_id)
select s.id, a.teacher, g.id
from assignments a
join public.subjects s on s.name = a.subject_name
join public.grades g on g.position = a.position
where not exists (
  select 1 from public.subject_teachers st
  where st.subject_id = s.id and st.name = a.teacher and st.grade_id = g.id
);

create unique index if not exists subject_teachers_assignment_unique
  on public.subject_teachers (subject_id, grade_id, name);

-- المتوقع: 43 تعيينًا، 10 مدرسين، ولا توجد تعيينات بلا صف.
select count(*) as total_assignments,
       count(distinct name) as total_teachers,
       count(*) filter (where grade_id is null) as assignments_without_grade
from public.subject_teachers;
