أكاديمية أون فاير — الإصدار 3
==============================

ما الجديد في هذا الإصدار:
1) روابط الفيديو من أي منصة أو استضافة:
   YouTube (عادي / غير مدرج / Shorts / Live)، Vimeo (عام أو خاص)، Google Drive، Dailymotion،
   Facebook، Instagram، TikTok، Loom، Streamable، Twitch، Dropbox، OneDrive، Bunny Stream، Wistia،
   Mux، OK.ru، أو رابط مباشر لملف فيديو (MP4 / WebM / MOV)، أو لصق كود التضمين <iframe> كاملًا.
   أي منصة أخرى تُعرض تلقائيًا داخل مشغّل مضمَّن.
   الدروس القديمة المحفوظة بروابط YouTube تعمل كما هي دون أي تعديل.
2) الموقع كله بالعربية: العنوان، اسم المنصة، التذييل، ورسائل الأخطاء القادمة من الخادم
   (تسجيل الدخول، الاتصال، الصلاحيات...) تُترجم تلقائيًا إلى العربية.
3) يعمل على أي استضافة: كل المسارات أصبحت نسبية (./)، فيعمل على Vercel وGitHub Pages
   (حتى داخل مجلد فرعي مثل username.github.io/repo) وNetlify وCloudflare Pages وأي استضافة ملفات ثابتة.

خطوة مطلوبة مرة واحدة في Supabase:
افتح SQL Editor وشغّل الملف: supabase/VIDEO_LINKS_ANY_PLATFORM.sql
(يجعل عمود الفيديو يقبل الروابط الطويلة من أي منصة، ولا يحذف أي بيانات).

ملاحظة عن رفع ملف من الجهاز:
رفع ملف فيديو مباشرة يحتاج خدمة Mux (Edge Functions) على Supabase، وهي غير مُعدّة حاليًا.
البديل الأسهل: ارفع الفيديو على YouTube (غير مدرج) أو Google Drive أو Vimeo أو Bunny، ثم الصق الرابط.
روابط Google Drive يجب أن تكون مشاركتها «أي شخص لديه الرابط».

النشر:
- Vercel: اربط المستودع واضغط Deploy؛ لا يحتاج أي إعداد (ملف vercel.json جاهز).
- GitHub Pages: ارفع كل الملفات إلى المستودع، ثم Settings ← Pages ← Deploy from branch ← (root).
- Netlify / Cloudflare Pages: اترك أمر البناء فارغًا ومجلد النشر هو الجذر.
- المعاينة المحلية: npm run dev ثم افتح http://localhost:3000

الملفات المهمة:
- index.html                      صفحة الدخول للموقع
- assets/index-OFv3.js / .css     التطبيق
- assets/video-links.js           تحويل أي رابط فيديو إلى مشغّل
- assets/arabic-messages.js       تعريب رسائل الخادم
- supabase/*.sql                  ملفات إعداد قاعدة البيانات
