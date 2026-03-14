const puppeteer = require('puppeteer');
const QrGenerator = require('../../utils/qrCodeGeneration');
const QrModel = require('../../models/QrModel');

class PDFManager {
  static async generateQRBandsPDF({ template, qrSize = 150, perPage = 30, format = 'A4', count = 30 }, userId) {
    const qrModel = new QrModel(userId);
    const db = await qrModel.getQueryBuilder();
    
    // Fetch only the requested count, sorted by latest
    const qrs = await db('qrs')
      .select('*')
      .orderBy('qr_id', 'desc')
      .limit(count);

    if (!qrs || qrs.length === 0) {
      throw new Error('No QR codes found in database');
    }

    const qrImages = await Promise.all(
      qrs.map(async (qr) => {
        const qrCode = qr.qr_code;
        const dataUrl = await QrGenerator.generateImage(qrCode);
        return { id: qr.qr_id, code: qrCode, dataUrl };
      })
    );

    const pages = [];
    for (let i = 0; i < qrImages.length; i += perPage) {
      pages.push(qrImages.slice(i, i + perPage));
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page { size: A4; margin: 0; }
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            box-sizing: border-box;
            background: #fff;
            -webkit-print-color-adjust: exact;
          }
          .page {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: hidden;
            box-sizing: border-box;
          }
          /* This class will be applied if the user doesn't provide a class in their template */
          .qr-band-item {
            width: 210mm;
            height: 30mm;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          ${template.includes('<style>') ? template.split('<style>')[1].split('</style>')[0] : ''}
        </style>
      </head>
      <body>
        ${pages.map(page => `
          <div class="page">
            ${page.map(qr => {
              // Inject the image into the placeholder
              const qrImageHtml = `<img src="${qr.dataUrl}" style="width: 20mm; height: 20mm; display: block;" />`;
              let itemHtml = template.replace('{{QR_CODE}}', qrImageHtml);
              
              // If the template is just the inner content, wrap it or ensure it has the item height
              if (!template.includes('class=') && !template.includes('style=')) {
                return `<div class="qr-band-item">${itemHtml}</div>`;
              }
              return itemHtml;
            }).join('')}
          </div>
        `).join('')}
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: "new"
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: format,
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    await browser.close();
    return pdfBuffer;
  }
}

module.exports = PDFManager;
