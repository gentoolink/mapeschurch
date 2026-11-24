/*
 * Seasonal Christmas decorations: string lights under the nav, a greeting
 * banner, and gentle snowfall.
 *
 * Turns on automatically on December 1 and off on December 27 (visitor's
 * local date), every year. Nothing needs to be edited to switch it on or off.
 *
 * Preview any time:  page.html?christmas=on   (or ?christmas=off to hide)
 */
(function () {
  var START_MONTH = 11, START_DAY = 1;   // December 1 (months are 0-based)
  var END_MONTH = 11, END_DAY = 27;      // off from December 27

  var override = (location.search.match(/[?&]christmas=(on|off)/) || [])[1];
  var now = new Date();
  var md = now.getMonth() * 100 + now.getDate();
  var inSeason = md >= START_MONTH * 100 + START_DAY && md < END_MONTH * 100 + END_DAY;
  if (override === 'off' || (!inSeason && override !== 'on')) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = [
    /* String lights hanging just below the nav */
    '.xmas-lights{position:absolute;left:0;right:0;top:100%;height:22px;margin:0;padding:0 1rem;list-style:none;display:flex;justify-content:space-between;pointer-events:none;overflow:hidden;z-index:-1}',
    '.xmas-lights::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:#2b3a2b}',
    '.xmas-lights li{position:relative;width:9px;height:15px;margin-top:4px;border-radius:50%;background:var(--c);box-shadow:0 3px 10px 1px var(--c);animation:xmas-twinkle 2.4s ease-in-out infinite;animation-delay:var(--d)}',
    '.xmas-lights li::before{content:"";position:absolute;top:-4px;left:2px;width:5px;height:5px;border-radius:2px;background:#3d4a3d}',
    '@keyframes xmas-twinkle{0%,100%{opacity:1}50%{opacity:.35;box-shadow:0 2px 4px 0 var(--c)}}',
    /* Greeting banner */
    '.xmas-banner{position:relative;background:linear-gradient(90deg,#7a1f2b,#a3283a 50%,#7a1f2b);color:#fff;text-align:center;padding:1.4rem 1rem .6rem;font-size:.95rem;letter-spacing:.02em}',
    '.xmas-banner strong{color:#f4e3b5;font-weight:600}',
    '.xmas-banner a{color:#f4e3b5;text-decoration:underline;text-underline-offset:2px}',
    '.xmas-banner a:hover{color:#fff}',
    /* Snow layer */
    '.xmas-snow{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90}',
    '@media (prefers-reduced-motion: reduce){.xmas-lights li{animation:none}}',
    '@media print{.xmas-lights,.xmas-banner,.xmas-snow{display:none}}'
  ].join('\n');

  function init() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    document.documentElement.classList.add('christmas');

    var nav = document.querySelector('nav');
    if (nav) {
      // Lights
      var colors = ['#e0352b', '#f2c14e', '#2e9e4f', '#3a7bd5', '#e86fb0'];
      var lights = document.createElement('ul');
      lights.className = 'xmas-lights';
      lights.setAttribute('aria-hidden', 'true');
      var count = Math.max(12, Math.round(window.innerWidth / 38));
      for (var i = 0; i < count; i++) {
        var li = document.createElement('li');
        li.style.setProperty('--c', colors[i % colors.length]);
        li.style.setProperty('--d', (-(i * 0.37) % 2.4).toFixed(2) + 's');
        lights.appendChild(li);
      }
      nav.appendChild(lights);

      // Greeting banner
      var onHome = /(^|\/)(index\.html)?$/.test(location.pathname);
      var banner = document.createElement('div');
      banner.className = 'xmas-banner';
      banner.innerHTML = '✨ <strong>Merry Christmas</strong> from Mapes Baptist Church — ' +
        '“For unto you is born this day… a Saviour, which is Christ the Lord.” (Luke 2:11) ' +
        '&middot; <a href="' + (onHome ? '#calendar' : 'index.html#calendar') + '">See what&rsquo;s coming up</a>';
      nav.parentNode.insertBefore(banner, nav.nextSibling);
    }

    if (!reduceMotion) startSnow();
  }

  function startSnow() {
    var canvas = document.createElement('canvas');
    canvas.className = 'xmas-snow';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var w, h, dpr, flakes = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.round(Math.min(70, w / 18));
      while (flakes.length < target) flakes.push(makeFlake(true));
      flakes.length = target;
    }
    function makeFlake(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -10,
        r: 1.2 + Math.random() * 2.6,
        vy: 0.35 + Math.random() * 0.8,
        sway: Math.random() * Math.PI * 2,
        a: 0.45 + Math.random() * 0.4
      };
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.vy;
        f.sway += 0.01;
        f.x += Math.sin(f.sway) * 0.4;
        if (f.y > h + 10) flakes[i] = f = makeFlake(false);
        // Soft blue-white so flakes show on both the cream and navy sections
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(176,198,224,' + f.a + ')';
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
