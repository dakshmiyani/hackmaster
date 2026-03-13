const crypto = require('crypto');
const QRCode = require('qrcode');

const SECRET = process.env.QR_SECRET || 'super_secret_key';

class QrGenerator {

  // 🔐 Encrypt/sign n+1
  static generateValue(nextNumber) {
    if (typeof nextNumber !== 'number') {
      throw new Error('nextNumber must be a number');
    }

    const payload = `QR-${nextNumber}`;

    const signature = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex');

    return `${payload}.${signature}`;
  }

  // ✅ Verify QR later
  static verifyValue(qrValue) {
    const [payload, signature] = qrValue.split('.');

    const expected = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex');

    return signature === expected;
  }

  static async generateImage(value) {
    if (!value) throw new Error('QR value is empty');
    return QRCode.toDataURL(value);
  }
}

module.exports = QrGenerator;
