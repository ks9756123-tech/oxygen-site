// 견적 문의 폼: /api/inquiry 로 보낸다. 브라우저 쪽에는 키가 하나도 없다.
(function () {
  var form = document.getElementById('quote-form');
  if (!form) return;
  var msg = document.getElementById('form-msg');
  var btn = form.querySelector('button[type=submit]');

  // 제품 안내 페이지에서 ?type=…&product=… 로 오면 미리 골라 둔다
  var q = new URLSearchParams(location.search);
  var type = q.get('type');
  var product = q.get('product');
  if (type) {
    var r = form.querySelector('input[name=business_type][value="' + CSS.escape(type) + '"]');
    if (r) r.checked = true;
  }
  if (product) {
    var sel = form.elements.product;
    for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === product) sel.selectedIndex = i;
  }

  function show(text, kind) {
    msg.textContent = text;
    msg.className = 'form-msg ' + (kind || '');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = form.elements;
    var picked = form.querySelector('input[name=business_type]:checked');
    var data = {
      name: f.name.value.trim(),
      contact: f.contact.value.trim(),
      business_type: picked ? picked.value : '',
      product: f.product.value,
      message: f.message.value.trim(),
      website: f.website.value,
      consent: document.getElementById('f-consent').checked
    };
    if (!data.name) { show('업체명을 적어 주세요.', 'err'); f.name.focus(); return; }
    if (!data.contact) { show('연락처를 적어 주세요.', 'err'); f.contact.focus(); return; }
    if (!data.consent) { show('개인정보 수집·이용에 동의해 주세요.', 'err'); document.getElementById('f-consent').focus(); return; }

    btn.disabled = true;
    show('보내는 중이에요…');
    try {
      var res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      var out = await res.json().catch(function () { return {}; });
      if (!res.ok) throw new Error(out.error || '보내지 못했어요. 잠시 뒤 다시 시도하거나 전화로 문의해 주세요.');
      form.reset();
      show('견적 문의가 접수됐어요. 확인 후 연락드릴게요.', 'ok');
    } catch (err) {
      show(err.message || '보내지 못했어요. 전화 010-9796-7989로 문의해 주세요.', 'err');
    } finally {
      btn.disabled = false;
    }
  });
})();
