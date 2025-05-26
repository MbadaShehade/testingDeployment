import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

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

    // 1. Generate PDF in memory
    const doc = new PDFDocument({ autoFirstPage: false });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    // Add a page and write content
    doc.addPage();
    doc.fontSize(20).text('🐝 Hive Report', { align: 'center' });
    doc.moveDown();
    if (username) doc.fontSize(14).text(`User: ${username}`);
    if (hiveId) doc.fontSize(14).text(`Hive ID: ${hiveId}`);
    if (typeof temperature === 'number') doc.fontSize(14).text(`Temperature: ${temperature}°C`);
    if (typeof humidity === 'number') doc.fontSize(14).text(`Humidity: ${humidity}%`);
    if (airPumpStatus) doc.fontSize(14).text(`Air Pump: ${airPumpStatus}`);
    if (reportType) doc.fontSize(14).text(`Report Type: ${reportType}`);
    doc.moveDown();

    // Helper to embed base64 PNG image
    function embedBase64Image(base64, label) {
      if (!base64) return;
      const matches = base64.match(/^data:image\/(png|jpeg);base64,(.+)$/);
      const b64 = matches ? matches[2] : base64;
      const buffer = Buffer.from(b64, 'base64');
      doc.addPage();
      doc.fontSize(16).text(label, { align: 'center' });
      doc.moveDown();
      try {
        doc.image(buffer, {
          fit: [450, 400],
          align: 'center',
          valign: 'center',
        });
      } catch (e) {
        doc.fontSize(12).fillColor('red').text('Failed to embed image.', { align: 'center' });
      }
      doc.moveDown();
    }

    // Embed images if provided
    if (temperature_image) {
      embedBase64Image(temperature_image, 'Temperature Chart');
    }
    if (humidity_image) {
      embedBase64Image(humidity_image, 'Humidity Chart');
    }

    doc.end();

    // Wait for PDF buffer
    await new Promise(resolve => doc.on('end', resolve));
    const pdfBuffer = Buffer.concat(buffers);

    // 2. Send PDF to Telegram
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', new Blob([pdfBuffer], { type: 'application/pdf' }), 'HiveReport.pdf');

    const sendDocUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
    const res = await fetch(sendDocUrl, { method: 'POST', body: formData });
    const tgData = await res.json();
    if (!tgData.ok) {
      return NextResponse.json({ success: false, message: 'Failed to send PDF', error: tgData.description }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'PDF report sent successfully' });
  } catch (error) {
    console.error('Error sending Telegram PDF:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 
