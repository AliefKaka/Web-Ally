import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  let body;

  try {
    body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
  } catch (err) {
    console.error('❌ Body tidak valid:', err);
    return res.status(400).json({ message: 'Format body tidak valid' });
  }

  const { name, whatsapp, divisi, level, reason } = body;

  if (!name?.trim() || !whatsapp?.trim() || !divisi?.trim() || !level?.trim() || !reason?.trim()) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const blobToken = process.env.ABSOLUTE_READ_WRITE_TOKEN;
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!blobToken) {
    return res.status(500).json({ message: 'Token penyimpanan tidak tersedia.' });
  }

  const blobData = {
    name: name.trim(),
    whatsapp: whatsapp.trim(),
    divisi: divisi.trim(),
    level: level.trim(),
    reason: reason.trim(),
    timestamp,
  };

  const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `pendaftaran-${Date.now()}-${safeName}.json`;

  try {
    const blob = await put(filename, JSON.stringify(blobData, null, 2), {
      access: 'public',
      token: blobToken,
    });

    console.log('✅ Data berhasil disimpan di Blob:', blob.url);

    // Kirim notifikasi Discord dengan Embed
    if (webhookUrl) {
      const discordEmbed = {
        username: 'Notifier Pendaftaran',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/686/686589.png',
        embeds: [
          {
            title: '📥 Pendaftaran Baru',
            color: 0x00b0f4,
            fields: [
              { name: '👤 Nama', value: name, inline: true },
              { name: '📱 WhatsApp', value: whatsapp, inline: true },
              { name: '🏢 Divisi', value: divisi, inline: true },
              { name: '📱 Level Akun', value: level, inline: true },
              { name: '📝 Alasan', value: reason },
              { name: '🕒 Waktu', value: timestamp, inline: false },
              { name: '📁 File', value: `[Lihat Data](${blob.url})`, inline: false },
            ],
            footer: {
              text: 'Bot Pendaftaran Otomatis',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordEmbed),
        });
        console.log('✅ Embed Discord terkirim');
      } catch (err) {
        console.error('❌ Gagal kirim embed Discord:', err);
      }
    }

    return res.status(200).json({
      message: 'Pendaftaran berhasil!\n\nNote: Kami akan segera menghubungi dalam 10-20 menit.',
      blobUrl: blob.url,
    });
  } catch (error) {
    console.error('❌ Gagal menyimpan ke Blob:', error);
    return res.status(500).json({
      message: 'Gagal menyimpan data',
      error: error.message,
    });
  }
}
