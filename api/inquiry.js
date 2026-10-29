// 견적 문의 받기 — 키는 환경변수에서만 읽는다
const SB_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const clip = (v, n) => String(v ?? '').trim().slice(0, n);
const sbHeaders = () => ({
  apikey: SB_KEY,
  ...(String(SB_KEY).startsWith('eyJ') ? { Authorization: `Bearer ${SB_KEY}` } : {}),
  'Content-Type': 'application/json',
});
const TYPES = ['유통센터', '횟집', '어선', '활어차', '기타'];
const PRODUCTS = ['산소발생기 본체', '산소분산기 (해수용)', '산소분산기 (내수용)', '잘 모르겠음'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 가능해요' });
  if (!SB_URL || !SB_KEY) return res.status(500).json({ error: '지금은 접수할 수 없어요. 전화 010-9796-7989로 문의해 주세요.' });
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  if (b.website) return res.status(200).json({ ok: true }); // 스팸 함정 칸(사람에게는 안 보임)
  const row = {
    name: clip(b.name, 50),
    contact: clip(b.contact, 100),
    business_type: TYPES.includes(b.business_type) ? b.business_type : null,
    product: PRODUCTS.includes(b.product) ? b.product : null,
    message: clip(b.message, 1000),
    consent: b.consent === true,
  };
  if (!row.name || !row.contact) return res.status(400).json({ error: '업체명과 연락처를 적어 주세요' });
  if (!row.consent) return res.status(400).json({ error: '개인정보 수집·이용에 동의해 주세요' });
  const r = await fetch(`${SB_URL}/rest/v1/inquiries`, { method: 'POST', headers: { ...sbHeaders(), Prefer: 'return=minimal' }, body: JSON.stringify(row) });
  if (!r.ok) return res.status(500).json({ error: '저장하지 못했어요. 잠시 뒤 다시 시도하거나 전화로 문의해 주세요.' });
  return res.status(200).json({ ok: true });
};
