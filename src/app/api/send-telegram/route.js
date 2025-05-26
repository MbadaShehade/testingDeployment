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

    return NextResponse.json({ success: true, message: 'Telegram report sent successfully' });
  } catch (error) {
    console.error('Error sending Telegram report:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 
