const express = require('express');
const router = express.Router();

const QRCodeManager = require('../../businessLogic/managers/qrManager');
const PDFManager = require('../../businessLogic/managers/pdfManager');
const QrModel = require('../../models/QrModel');
const MemberModel = require('../../models/MemberModel');

// ✅ Generate QR codes (ADMIN)
router.post('/generate', async (req, res) => {
  try {
    const { count } = req.body;
    const userId = res.locals?.USER_INFO?.user?.user_id || null; // For RouteMap integration if auth enabled on this endpoint

    if (!count || count <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid count',
      });
    }

    await QRCodeManager.generate(count, userId);

    return res.json({
      success: true,
      message: `${count} QR codes generated successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Scan QR and assign / fetch member
router.post('/assign', async (req, res) => {
  try {
    const { qr_code, member_id } = req.body;
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    
    console.log(`📝 /assign called with qr_code: ${qr_code}, member_id: ${member_id}`);
    
    if (!qr_code) {
      return res.status(400).json({
        success: false,
        message: 'QR code is required',
      });
    }

    const qrModel = new QrModel(userId);
    const qr = await qrModel.findByCode(qr_code);
    
    if (!qr) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code',
      });
    }

    // 🟢 If QR already assigned → fetch member
    if (qr.member_id) {
      const memberModel = new MemberModel(userId);
      const member = await memberModel.findById(qr.member_id);

      return res.json({
        success: true,
        data: member,
        message: 'QR already assigned',
      });
    }

    if (!member_id) {
      return res.status(400).json({
        success: false,
        message: 'member_id required to assign unassigned QR',
      });
    }

    // 🟡 Assign QR to member
    const updatedQR = await QRCodeManager.updateQR({ qr_code, member_id }, userId);

    return res.json({
      success: true,
      data: updatedQR.data,
      message: updatedQR.message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Unified Scan Route (Tracking event meals/scans into qr_scans table)
router.post('/scans', async (req, res) => {
  try {
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    const result = await QRCodeManager.handleScan(req.body, userId);

    return res.json({
      success: true,
      message: result.message,
      member_id: result.member_id,
      member_name: result.member_name
    });

  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});
// ✅ List all QR codes
router.get('/list', async (req, res) => {
  try {
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    const qrModel = new QrModel(userId);
    const db = await qrModel.getQueryBuilder();
    const qrs = await db('qrs').select('*');
    return res.json({ success: true, data: qrs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Generate PDF for QR Bands
router.post('/generate-pdf', async (req, res) => {
  try {
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    const pdfBuffer = await PDFManager.generateQRBandsPDF(req.body, userId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=qr-bands.pdf');
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
