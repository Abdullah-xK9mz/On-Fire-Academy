/*
 * On Fire Academy — تعريب رسائل الأخطاء القادمة من الخادم (Supabase / الشبكة).
 * الواجهة كلها عربية، لكن بعض رسائل الخادم تصل بالإنجليزية؛ هذا الملف يترجمها فور ظهورها.
 */
(function () {
  'use strict';

  var SQL_HINT = ' شغّل ملف supabase/VIDEO_LINKS_ANY_PLATFORM.sql من SQL Editor ثم أعد المحاولة.';

  var RULES = [
    [/invalid login credentials/i, 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
    [/email not confirmed/i, 'لم يتم تأكيد البريد الإلكتروني بعد. افتح رسالة التأكيد في بريدك.'],
    [/user already registered|already been registered/i, 'هذا الحساب مسجّل بالفعل. سجّل الدخول بدلًا من إنشاء حساب جديد.'],
    [/password should be at least (\d+) characters?/i, 'كلمة المرور يجب ألا تقل عن $1 أحرف.'],
    [/password is known to be weak|weak.?password/i, 'كلمة المرور ضعيفة. اختر كلمة مرور أقوى.'],
    [/new password should be different/i, 'كلمة المرور الجديدة يجب أن تختلف عن القديمة.'],
    [/unable to validate email address|invalid format|email address .* is invalid/i, 'صيغة البريد الإلكتروني غير صحيحة.'],
    [/signups? not allowed|signup is disabled/i, 'إنشاء حسابات جديدة غير متاح حاليًا.'],
    [/user not found/i, 'المستخدم غير موجود.'],
    [/email rate limit exceeded/i, 'خادم البريد وصل للحد الأقصى لرسائل التأكيد في الساعة. حاول لاحقًا.'],
    [/rate limit|too many requests/i, 'طلبات كثيرة من نفس الشبكة خلال وقت قصير. انتظر 5 دقائق ثم حاول مرة أخرى.'],
    [/for security purposes, you can only request this after (\d+) seconds?/i, 'لأسباب أمنية، يمكنك المحاولة مرة أخرى بعد $1 ثانية.'],
    [/token has expired or is invalid|otp.*expired/i, 'انتهت صلاحية الرمز أو أنه غير صحيح.'],
    [/jwt expired|auth session missing|session.*(expired|not found)|refresh token/i, 'انتهت جلسة الدخول. سجّل الدخول مرة أخرى.'],
    [/value too long for type/i, 'الرابط أطول من المسموح به في قاعدة البيانات.' + SQL_HINT],
    [/violates check constraint/i, 'قاعدة البيانات رفضت هذه القيمة.' + SQL_HINT],
    [/duplicate key value|already exists/i, 'هذا العنصر موجود بالفعل.'],
    [/violates foreign key constraint/i, 'لا يمكن تنفيذ العملية لأن العنصر مرتبط ببيانات أخرى.'],
    [/row-level security|permission denied|not authorized|unauthorized|forbidden/i, 'ليس لديك صلاحية لتنفيذ هذا الإجراء.'],
    [/could not find the function|function .* does not exist/i, 'وظيفة قاعدة البيانات غير موجودة. تأكد من تشغيل ملفات SQL في Supabase.'],
    [/relation .* does not exist|could not find the table/i, 'جدول قاعدة البيانات غير موجود. تأكد من تشغيل ملفات SQL في Supabase.'],
    [/column .* does not exist/i, 'عمود في قاعدة البيانات غير موجود. تأكد من تشغيل آخر ملفات SQL.'],
    [/failed to send a request to the edge function|edge function returned a non-2xx|functionsfetcherror|functionshttperror/i, 'خدمة رفع ملفات الفيديو غير مُعدّة على الخادم. استخدم رابط فيديو من أي منصة بدلًا من رفع ملف.'],
    [/failed to fetch|networkerror|network request failed|load failed|fetch failed/i, 'تعذّر الاتصال بالخادم. تحقق من اتصال الإنترنت وحاول مرة أخرى.'],
    [/timeout|timed out/i, 'انتهت مهلة الاتصال. حاول مرة أخرى.'],
    [/^HTTP (\d{3})$/i, 'حدث خطأ من الخادم (رمز $1).'],
    [/internal server error/i, 'حدث خطأ داخلي في الخادم. حاول لاحقًا.'],
  ];

  var LATIN = /[A-Za-z]{3,}/;
  var ARABIC = /[\u0600-\u06FF]/;

  function translate(text) {
    if (!text || !LATIN.test(text) || ARABIC.test(text)) return text;
    for (var i = 0; i < RULES.length; i++) {
      var m = text.match(RULES[i][0]);
      if (m) return RULES[i][1].replace(/\$(\d)/g, function (_, n) { return m[Number(n)] || ''; });
    }
    return text;
  }

  function fixNode(node) {
    if (node.nodeType === 3) {
      var parent = node.parentNode;
      if (!parent || /^(SCRIPT|STYLE|CODE|PRE|TEXTAREA)$/.test(parent.nodeName)) return;
      var next = translate(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    } else if (node.nodeType === 1 && node.childNodes.length) {
      for (var i = 0; i < node.childNodes.length; i++) fixNode(node.childNodes[i]);
    }
  }

  window.OFTranslate = translate;

  var nativeAlert = window.alert;
  window.alert = function (msg) { return nativeAlert.call(window, translate(String(msg))); };

  function start() {
    var root = document.getElementById('root') || document.body;
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.type === 'characterData') fixNode(r.target);
        for (var j = 0; j < r.addedNodes.length; j++) fixNode(r.addedNodes[j]);
      }
    }).observe(root, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
