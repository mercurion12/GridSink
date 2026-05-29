export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, E-Mail und Nachricht sind Pflichtfelder.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Gridsink Kontakt <noreply@gridsink.com>',
        to:   'gridsink@gmail.com',
        reply_to: email,
        subject: `Neue Nachricht${subject ? ': ' + subject : ''} — von ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:8px">
            <h2 style="margin:0 0 24px;font-size:20px;color:#08090d">Neue Kontaktanfrage</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:10px 0;color:#666;font-size:13px;width:100px">Name</td>
                <td style="padding:10px 0;color:#08090d;font-size:14px;font-weight:600">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#666;font-size:13px">E-Mail</td>
                <td style="padding:10px 0;color:#08090d;font-size:14px"><a href="mailto:${email}" style="color:#0066ff">${email}</a></td>
              </tr>
              ${subject ? `<tr><td style="padding:10px 0;color:#666;font-size:13px">Betreff</td><td style="padding:10px 0;color:#08090d;font-size:14px">${subject}</td></tr>` : ''}
            </table>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e0e0e0">
            <p style="color:#666;font-size:13px;margin:0 0 8px">Nachricht</p>
            <p style="color:#08090d;font-size:14px;line-height:1.7;white-space:pre-wrap;margin:0">${message}</p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e0e0e0">
            <p style="color:#aaa;font-size:11px;margin:0">Gesendet über das Kontaktformular auf gridsink.com</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden.' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Serverfehler.' });
  }
}
