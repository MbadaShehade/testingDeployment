import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      hiveId,
      temperature,
      humidity,
      chatId,
      temperature_image,
      humidity_image,
      username,
      reportType,
      airPumpStatus
    } = data;

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ success: false, message: 'TELEGRAM_BOT_TOKEN is not set' }, { status: 500 });
    }
    if (!chatId) {
      return NextResponse.json({ success: false, message: 'chatId is required' }, { status: 400 });
    }

    // 1. Send a text message summarizing the report
    let text = `🐝 Hive Report\n`;
    if (username) text += `User: ${username}\n`;
    if (hiveId) text += `Hive ID: ${hiveId}\n`;
    if (typeof temperature === 'number') text += `Temperature: ${temperature}°C\n`;
    if (typeof humidity === 'number') text += `Humidity: ${humidity}%\n`;
    if (airPumpStatus) text += `Air Pump: ${airPumpStatus}\n`;
    if (reportType) text += `Report Type: ${reportType}\n`;

    const sendMessageUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const sendPhotoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

    // Send the text message
    const msgRes = await fetch(sendMessageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const msgData = await msgRes.json();
    if (!msgData.ok) {
      return NextResponse.json({ success: false, message: 'Failed to send Telegram message', error: msgData.description }, { status: 500 });
    }

    // Helper to send a base64 image as photo
    async function sendBase64Image(base64, caption) {
      if (!base64) return;
      // Remove data URL prefix if present
      const matches = base64.match(/^data:image\/(png|jpeg);base64,(.+)$/);
      const b64 = matches ? matches[2] : base64;
      const buffer = Buffer.from(b64, 'base64');
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('photo', new Blob([buffer], { type: 'image/png' }), 'chart.png');
      if (caption) formData.append('caption', caption);
      const res = await fetch(sendPhotoUrl, { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.ok) throw new Error(data.description || 'Failed to send photo');
    }

    // Send temperature image if provided
    if (temperature_image) {
      await sendBase64Image(temperature_image, 'Temperature Chart');
    }
    // Send humidity image if provided
    if (humidity_image) {
      await sendBase64Image(humidity_image, 'Humidity Chart');
    }

    return NextResponse.json({ success: true, message: 'Telegram report sent successfully' });
  } catch (error) {
    console.error('Error sending Telegram report:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 
