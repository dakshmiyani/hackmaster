const cloudinary = require('../../utils/cloudinary');
const QrGenerator = require('../../utils/qrCodeGeneration');
const QrModel = require('../../models/QrModel');
const QrScanModel = require('../../models/QrScanModel');
const MealModel = require('../../models/MealModel');
const MemberModel = require('../../models/MemberModel');
const Db = require('../../models/libs/Db');

class QRCodeManager {

  // ======================================
  // 🔹 GENERATE QR
  // ======================================

  static async generate(count, userId) {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error('count must be a positive integer');
    }

    const knex = await Db.getQueryBuilder();
    const qrModel = new QrModel(userId);

    return await knex.transaction(async (trx) => {

      for (let i = 0; i < count; i++) {
        // 1. Generate base object
        const qr = await qrModel.createBase(trx);

        // 2. Encrypt value utilizing DB ID
        const qr_code = QrGenerator.generateValue(Number(qr.qr_id));
        const image = await QrGenerator.generateImage(qr_code);

        // 3. Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: 'qrcodes',
          public_id: qr_code
        });
        
        const qr_url = uploadResult.secure_url;

        // 4. Update the record
        await qrModel.updateQRUrl(qr.qr_id, qr_code, qr_url, trx);
      }

      return true;
    });
  }

  // ======================================
  // 🔹 HANDLE SCAN
  // ======================================

  static async handleScan({ code, type }, userId) {
    if (!code || !type) throw new Error('QR code and scan type required');

    const qrModel = new QrModel(userId);
    const memberModel = new MemberModel(userId);
    const mealModel = new MealModel(userId);
    const scanModel = new QrScanModel(userId);

    // 1. Validate QR
    const qr = await qrModel.findByCode(code);
    if (!qr || !qr.member_id) throw new Error('QR not assigned');

    // 2. Fetch Member
    const member = await memberModel.findById(qr.member_id);
    if (!member) throw new Error('Member not found');

    // Note: The previous logic relied entirely on hardcoded names like 'uiux' and 'dsa'.
    // The new approach dynamically checks the database `event_meals` cross-referenced with `meals`.
    // The 'type' parameter string passed in from frontend should ideally map to `meals.meal_name`.

    // 3. Look up allowed meals for the members event
    const allowedMeals = await mealModel.getAllowedMealsForEvent(member.event_id);

    // If 'check_in' or 'check_out', we assume these are still allowed directly on the member model or scan table depending on schema extensions.
    // For this rewrite, we will map ALL scans to `qr_scans` table matching `type` to `meal_name`.

    const targetMeal = allowedMeals.find(m => m.meal_type === type);

    if (!targetMeal) {
        throw new Error(`The scan type '${type}' is not allowed for this participant's event.`);
    }

    // 4. Ensure it hasn't been scanned already
    const existingScan = await scanModel.hasScannedMeal(member.member_id, targetMeal.meal_id);
    
    if (existingScan) {
      throw new Error(`${type} already marked`);
    }

    // 5. Log the Scan
    await scanModel.createScan({
      member_id: member.member_id,
      org_id: member.org_id,
      event_id: member.event_id,
      meal_id: targetMeal.meal_id
    });

    return {
      message: `${type} marked successfully`,
      member_id: member.member_id,
      member_name: member.name
    };
  }

  // ======================================
  // 🔹 UPDATE QR ASSIGNMENT
  // ======================================

  static async updateQR({ qr_code, member_id }, userId) {

    if (!qr_code) throw new Error('qr_code required');
    if (!member_id) throw new Error('member_id required to assign');

    const qrModel = new QrModel(userId);
    const memberModel = new MemberModel(userId);

    const qr = await qrModel.findByCode(qr_code);
    if (!qr) throw new Error('QR not found');

    const member = await memberModel.findById(member_id);
    if (!member) throw new Error('Member not found');
    
    // Check if the member already has a QR
    const existingQRAssignment = await qrModel.findByMemberId(member_id);
    if (existingQRAssignment) throw new Error('Member already has a QR code assigned');

    const updated = await qrModel.assignToMember({ qr_code, member_id });

    return {
      message: 'QR assignment updated successfully',
      data: updated
    };
  }
}

module.exports = QRCodeManager;
