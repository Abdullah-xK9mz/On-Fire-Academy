/*
 * On Fire Academy — دعم روابط الفيديو من أي منصة أو استضافة.
 * يُحمَّل قبل الحزمة الرئيسية ويعرّف window.OFVideo.
 *
 * التخزين: روابط YouTube تُخزَّن كمعرّف من 11 حرفًا (متوافق مع الدروس القديمة)،
 * وأي رابط آخر يُخزَّن كاملًا في عمود youtube_id نفسه.
 */
(function () {
  'use strict';

  var YT_ID = /^[A-Za-z0-9_-]{11}$/;
  var DIRECT_FILE = /\.(mp4|m4v|webm|ogv|ogg|mov|mkv|3gp|m3u8|mpd)(\?|#|$)/i;

  function host(u) {
    return u.hostname.replace(/^(www|m|mobile)\./i, '').toLowerCase();
  }

  function segments(u) {
    return u.pathname.split('/').filter(Boolean);
  }

  function extractFromEmbedCode(raw) {
    var m = raw.match(/<(?:iframe|video|source|embed)[^>]*\ssrc\s*=\s*["']([^"']+)["']/i);
    return m ? m[1].replace(/&amp;/g, '&') : raw;
  }

  function toUrl(raw) {
    var value = String(raw || '').trim();
    if (!value) return null;
    value = extractFromEmbedCode(value);
    if (value.indexOf('//') === 0) value = 'https:' + value;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(value) && /^[\w-]+(\.[\w-]+)+(\/|$)/.test(value)) {
      value = 'https://' + value;
    }
    try {
      var u = new URL(value);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
      return u;
    } catch (e) {
      return null;
    }
  }

  function youtubeId(u) {
    var h = host(u);
    var seg = segments(u);
    if (h === 'youtu.be') return seg[0] || '';
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(h)) {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      var known = ['embed', 'shorts', 'live', 'v', 'e'];
      if (seg.length >= 2 && known.indexOf(seg[0]) !== -1) return seg[1];
    }
    return '';
  }

  function youtubeStart(u) {
    var t = u.searchParams.get('t') || u.searchParams.get('start');
    if (!t) return 0;
    if (/^\d+$/.test(t)) return Number(t);
    var m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
    return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : 0;
  }

  /** يحوّل أي رابط معروف إلى رابط مشغّل قابل للتضمين. */
  function toEmbed(u) {
    var h = host(u);
    var seg = segments(u);
    var id;

    // Vimeo
    if (h === 'vimeo.com' || h === 'player.vimeo.com') {
      var nums = seg.filter(function (s) { return /^\d+$/.test(s); });
      id = nums[0];
      if (id) {
        var after = seg[seg.indexOf(id) + 1];
        var hash = u.searchParams.get('h') || (after && /^[a-f0-9]{6,}$/i.test(after) ? after : '');
        return { type: 'iframe', src: 'https://player.vimeo.com/video/' + id + (hash ? '?h=' + hash : '') };
      }
    }

    // Google Drive / Docs
    if (h === 'drive.google.com' || h === 'docs.google.com') {
      var di = seg.indexOf('d');
      id = di !== -1 ? seg[di + 1] : u.searchParams.get('id');
      if (id) return { type: 'iframe', src: 'https://drive.google.com/file/d/' + id + '/preview' };
    }

    // Dailymotion
    if (h === 'dailymotion.com' || h === 'dai.ly' || h === 'geo.dailymotion.com') {
      id = u.searchParams.get('video') || (h === 'dai.ly' ? seg[0] : seg[seg.indexOf('video') + 1]);
      if (id) return { type: 'iframe', src: 'https://geo.dailymotion.com/player.html?video=' + id.split('_')[0] };
    }

    // Facebook
    if (/(^|\.)facebook\.com$/.test(h) || h === 'fb.watch') {
      if (seg[0] === 'plugins') return { type: 'iframe', src: u.href };
      return {
        type: 'iframe',
        src: 'https://www.facebook.com/plugins/video.php?show_text=false&href=' + encodeURIComponent(u.href),
      };
    }

    // Instagram
    if (h === 'instagram.com') {
      var ii = Math.max(seg.indexOf('p'), seg.indexOf('reel'), seg.indexOf('reels'), seg.indexOf('tv'));
      if (ii !== -1 && seg[ii + 1]) return { type: 'iframe', src: 'https://www.instagram.com/p/' + seg[ii + 1] + '/embed' };
    }

    // TikTok
    if (h === 'tiktok.com') {
      var ti = seg.indexOf('video');
      if (ti !== -1 && seg[ti + 1]) return { type: 'iframe', src: 'https://www.tiktok.com/embed/v2/' + seg[ti + 1] };
    }

    // Loom
    if (h === 'loom.com') {
      id = seg[seg.length - 1];
      if (id) return { type: 'iframe', src: 'https://www.loom.com/embed/' + id };
    }

    // Streamable
    if (h === 'streamable.com') {
      id = seg[0] === 'e' || seg[0] === 'o' ? seg[1] : seg[0];
      if (id) return { type: 'iframe', src: 'https://streamable.com/e/' + id };
    }

    // Twitch
    if (h === 'twitch.tv' || h === 'player.twitch.tv' || h === 'clips.twitch.tv') {
      var parent = location.hostname || 'localhost';
      if (h === 'clips.twitch.tv' || seg[1] === 'clip') {
        id = h === 'clips.twitch.tv' ? seg[0] : seg[2];
        return { type: 'iframe', src: 'https://clips.twitch.tv/embed?clip=' + id + '&parent=' + parent };
      }
      if (seg[0] === 'videos' && seg[1]) {
        return { type: 'iframe', src: 'https://player.twitch.tv/?video=' + seg[1] + '&parent=' + parent };
      }
    }

    // Mux
    if (h === 'stream.mux.com') {
      id = (seg[0] || '').replace(/\.(m3u8|mp4)$/i, '');
      if (id) return { type: 'iframe', src: 'https://player.mux.com/' + id };
    }

    // Bunny Stream
    if (h === 'iframe.mediadelivery.net' || h === 'video.bunnycdn.com') {
      if (seg[0] === 'play' || seg[0] === 'embed') {
        return { type: 'iframe', src: 'https://iframe.mediadelivery.net/embed/' + seg[1] + '/' + seg[2] };
      }
    }

    // Wistia
    if (/wistia\.(com|net)$/.test(h) || h === 'wi.st') {
      var wi = seg.indexOf('medias');
      id = wi !== -1 ? seg[wi + 1] : seg[seg.length - 1];
      if (id && seg[0] !== 'embed') return { type: 'iframe', src: 'https://fast.wistia.net/embed/iframe/' + id };
    }

    // Rumble
    if (h === 'rumble.com' && seg[0] === 'embed') return { type: 'iframe', src: u.href };

    // OK.ru
    if (h === 'ok.ru') {
      var oi = seg.indexOf('video');
      if (oi !== -1 && seg[oi + 1]) return { type: 'iframe', src: 'https://ok.ru/videoembed/' + seg[oi + 1] };
    }

    // Dropbox: رابط تحميل مباشر يعمل داخل مشغّل HTML5
    if (h === 'dropbox.com' || h === 'dl.dropbox.com') {
      var dbx = new URL(u.href);
      dbx.hostname = 'dl.dropboxusercontent.com';
      dbx.searchParams.delete('dl');
      dbx.searchParams.set('raw', '1');
      return { type: 'video', src: dbx.href };
    }

    // OneDrive / SharePoint
    if (h === '1drv.ms' || h === 'onedrive.live.com' || /sharepoint\.com$/.test(h)) {
      return { type: 'iframe', src: u.href.replace('/redir?', '/embed?') };
    }

    // ملف فيديو مباشر من أي استضافة
    if (DIRECT_FILE.test(u.pathname) || DIRECT_FILE.test(u.href)) {
      return { type: 'video', src: u.href };
    }

    // أي منصة أخرى: تضمين عام
    return { type: 'iframe', src: u.href };
  }

  /**
   * يحلّل ما يكتبه المدير: رابط من أي منصة، أو كود تضمين <iframe>، أو معرّف YouTube.
   * يعيد { stored } للحفظ في قاعدة البيانات أو null إذا كان غير صالح.
   */
  function parse(raw) {
    var value = String(raw || '').trim();
    if (!value) return null;
    if (YT_ID.test(value)) return { stored: value, platform: 'youtube' };
    var u = toUrl(value);
    if (!u) return null;
    var yt = youtubeId(u);
    if (yt && YT_ID.test(yt)) {
      var start = youtubeStart(u);
      return { stored: start ? 'https://www.youtube.com/watch?v=' + yt + '&t=' + start : yt, platform: 'youtube' };
    }
    if (u.protocol === 'http:') u.protocol = 'https:';
    return { stored: u.href, platform: host(u) };
  }

  /** يحوّل القيمة المخزّنة إلى مشغّل. */
  function resolve(stored) {
    var value = String(stored || '').trim();
    if (!value) return null;
    if (YT_ID.test(value)) {
      return { type: 'iframe', src: 'https://www.youtube-nocookie.com/embed/' + value + '?rel=0&modestbranding=1' };
    }
    var u = toUrl(value);
    if (!u) return null;
    var yt = youtubeId(u);
    if (yt && YT_ID.test(yt)) {
      var start = youtubeStart(u);
      return {
        type: 'iframe',
        src: 'https://www.youtube-nocookie.com/embed/' + yt + '?rel=0&modestbranding=1' + (start ? '&start=' + start : ''),
      };
    }
    return toEmbed(u);
  }

  /** يُستدعى من الحزمة الرئيسية لرسم المشغّل بـ React.createElement. */
  function render(h, lesson) {
    var title = (lesson && lesson.title) || 'درس تعليمي';
    var player = resolve(lesson && lesson.youtubeId);
    if (!player) {
      return h('div', { className: 'of-video-error', role: 'alert' }, 'رابط الفيديو غير صالح. عدّل الدرس وأضف رابطًا صحيحًا.');
    }
    if (player.type === 'video') {
      return h('video', {
        key: player.src,
        title: title,
        src: player.src,
        controls: true,
        playsInline: true,
        preload: 'metadata',
        controlsList: 'nodownload',
        className: 'of-video-player',
      });
    }
    return h('iframe', {
      key: player.src,
      title: title,
      src: player.src,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen',
      referrerPolicy: 'strict-origin-when-cross-origin',
      allowFullScreen: true,
      loading: 'lazy',
    });
  }

  var PLATFORM_NAMES = [
    [/youtu\.?be/, 'يوتيوب'],
    [/vimeo/, 'فيميو'],
    [/google\.com/, 'جوجل درايف'],
    [/dailymotion|dai\.ly/, 'ديلي موشن'],
    [/facebook|fb\.watch/, 'فيسبوك'],
    [/instagram/, 'إنستجرام'],
    [/tiktok/, 'تيك توك'],
    [/loom/, 'لوم'],
    [/streamable/, 'ستريمبل'],
    [/twitch/, 'تويتش'],
    [/dropbox/, 'دروب بوكس'],
    [/1drv|onedrive|sharepoint/, 'ون درايف'],
    [/mediadelivery|bunny/, 'باني ستريم'],
    [/wistia|wi\.st/, 'ويستيا'],
    [/mux/, 'خدمة Mux'],
  ];

  /** اسم المنصة بالعربية لعرضه تحت المشغّل. */
  function platformName(stored) {
    var value = String(stored || '').trim();
    if (YT_ID.test(value)) return 'يوتيوب';
    var u = toUrl(value);
    if (!u) return 'منصة خارجية';
    var h = host(u);
    for (var i = 0; i < PLATFORM_NAMES.length; i++) {
      if (PLATFORM_NAMES[i][0].test(h)) return PLATFORM_NAMES[i][1];
    }
    return 'استضافة خارجية (' + h + ')';
  }

  window.OFVideo = { parse: parse, resolve: resolve, render: render, platformName: platformName };
})();
