(function () {
  var script = document.currentScript;
  var channelId = script && script.getAttribute('data-channel-id');
  if (!channelId) return;

  var origin = (script.src || '').replace(/\/chat-widget\.js.*$/, '') || window.location.origin;
  var chatUrl = origin + '/chat?channelId=' + channelId;
  var isMobile = window.matchMedia('(max-width: 520px)').matches;

  var btn = document.createElement('button');
  btn.innerText = '在线咨询';
  btn.setAttribute('aria-label', '打开在线客服');
  btn.style.cssText = [
    'position:fixed',
    'right:' + (isMobile ? '16px' : '24px'),
    'bottom:' + (isMobile ? 'max(16px, env(safe-area-inset-bottom))' : '24px'),
    'z-index:99999',
    'border:none',
    'border-radius:999px',
    'padding:' + (isMobile ? '14px 18px' : '12px 20px'),
    'background:linear-gradient(135deg,#5eead4,#14b8a6)',
    'color:#115e59',
    'font-size:14px',
    'font-weight:600',
    'cursor:pointer',
    'box-shadow:0 8px 24px rgba(20,184,166,.3)',
    '-webkit-tap-highlight-color:transparent'
  ].join(';');

  var panel = document.createElement('iframe');
  panel.src = chatUrl;
  panel.title = '在线客服';
  panel.setAttribute('allow', 'clipboard-write');

  function applyPanelLayout() {
    var mobile = window.matchMedia('(max-width: 520px)').matches;
    if (mobile) {
      panel.style.cssText = [
        'position:fixed',
        'inset:0',
        'width:100%',
        'height:100%',
        'border:none',
        'border-radius:0',
        'box-shadow:none',
        'z-index:99999',
        'background:#fff'
      ].join(';');
    } else {
      panel.style.cssText = [
        'position:fixed',
        'right:24px',
        'bottom:84px',
        'width:420px',
        'height:min(640px, calc(100vh - 120px))',
        'border:none',
        'border-radius:20px',
        'box-shadow:0 16px 40px rgba(15,23,42,.18)',
        'z-index:99999',
        'background:#fff'
      ].join(';');
    }
    panel.style.display = panelOpen ? 'block' : 'none';
  }

  var panelOpen = false;
  btn.onclick = function () {
    panelOpen = !panelOpen;
    applyPanelLayout();
  };

  window.addEventListener('resize', applyPanelLayout);
  applyPanelLayout();

  document.body.appendChild(btn);
  document.body.appendChild(panel);
})();
