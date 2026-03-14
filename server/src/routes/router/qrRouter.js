const express = require('express');
const router = express.Router();

const QRCodeManager = require('../../businessLogic/managers/qrManager');
const QrModel = require('../../models/QrModel');
const MemberModel = require('../../models/MemberModel');
const ReportManager = require('../../businessLogic/managers/ReportManager');

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

// ✅ Get Scan Statistics
router.post('/stats', async (req, res) => {
  try {
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    const { count } = await ReportManager.getStats(req.body, userId);

    return res.json({
      success: true,
      count
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Get ALL QR codes with their image URLs (+ optional event_id filter)
router.get('/all', async (req, res) => {
  try {
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    const { event_id } = req.query;

    const qrModel = new QrModel(userId);
    const db = await qrModel.getQueryBuilder();

    let query = db('qrs')
      .leftJoin('members', 'qrs.member_id', 'members.member_id')
      .select(
        'qrs.qr_id',
        'qrs.qr_code',
        'qrs.qr_url',
        'qrs.member_id',
        'members.name as member_name',
        'members.email as member_email',
        'members.event_id'
      )
      .orderBy('qrs.qr_id', 'asc');

    // Optional: filter by event
    if (event_id) {
      query = query.where('members.event_id', event_id);
    }

    const qrs = await query;

    return res.json({
      success: true,
      count: qrs.length,
      data: qrs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ Get QR for a specific member
router.get('/by-member/:member_id', async (req, res) => {
  try {
    const { member_id } = req.params;
    const userId = res.locals?.USER_INFO?.user?.user_id || null;

    const qrModel = new QrModel(userId);
    const qr = await qrModel.findByMemberId(member_id);

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: 'No QR found for this member',
      });
    }

    return res.json({
      success: true,
      data: qr,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
