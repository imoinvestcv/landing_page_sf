// Vercel Serverless Function — envia o formulário de contacto via Resend.
// A chave NUNCA fica no código: vive na variável de ambiente RESEND_API_KEY
// (Vercel → Project → Settings → Environment Variables).

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nome = '', email = '', mensagem = '', empresa = '', lang = 'pt' } = req.body || {};

  // Honeypot: campo invisível no formulário — se vier preenchido, é um bot.
  if (empresa) return res.status(200).json({ ok: true });

  if (!nome.trim() || !mensagem.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid fields' });
  }
  if (nome.length > 200 || email.length > 200 || mensagem.length > 5000) {
    return res.status(400).json({ error: 'Too long' });
  }

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0c2630">
      <h2 style="margin:0 0 16px;font-weight:600">Novo contacto — site IMO INVEST</h2>
      <p><strong>Nome:</strong> ${esc(nome)}<br>
      <strong>Email:</strong> ${esc(email)}<br>
      <strong>Idioma do site:</strong> ${esc(lang).toUpperCase()}</p>
      <p style="white-space:pre-wrap;border-left:3px solid #2698ca;padding:4px 0 4px 12px">${esc(mensagem)}</p>
    </div>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Após verificar o domínio em resend.com/domains, trocar para:
      // from: 'IMO INVEST <site@imo-invest.cv>',
      from: 'IMO INVEST <onboarding@resend.dev>',
      to: 'imoinvestcaboverde@gmail.com',
      reply_to: email,
      subject: `Novo contacto — ${nome}`,
      html,
    }),
  });

  if (!r.ok) {
    console.error('Resend error:', await r.text());
    return res.status(502).json({ error: 'Email service error' });
  }
  return res.status(200).json({ ok: true });
}
