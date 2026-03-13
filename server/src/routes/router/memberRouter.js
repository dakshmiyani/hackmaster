const express = require('express');
const router = express.Router();

const MemberManager = require('../../businessLogic/managers/MemberManager');
const { appWrapper } = require('../../utils/routeWrapper');

// ✅ CREATE MEMBER
router.post(
  '/create',
  appWrapper(async (req, res) => {
    
    // We safely parse user id in case route used inside open API without login
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    
    const memberData = await MemberManager.createMember(req.body, userId);
      
    res.json({
      success: true,
      data: memberData,
      message: 'Member created successfully',
    });
   
  })
);

// ✅ UPDATE MEMBER
router.post(
  '/update',
  appWrapper(async (req, res) => {
    
    // We safely parse user id in case route used inside open API without login
    const userId = res.locals?.USER_INFO?.user?.user_id || null;

    const {
      member_id,
      name,
      email,
      phone,
      college
    } = req.body;

    const member = await MemberManager.updateMember({
      member_id,
      name,
      email,
      phone_no: phone,
      college
    }, userId);

    res.json({
      success: true,
      data: member,
      message: 'Member updated successfully',
    });
  })
);


// ✅ GET MEMBERS BY EVENT
// Re-implemented through Search
router.get(
  '/by-event/:eventId',
  appWrapper(async (req, res) => {

    const { eventId } = req.params;

    const members = await MemberManager.searchMembers({ event_id: eventId, name: '' });

    res.json({
      success: true,
      data: members,
      message: 'Members fetched by event successfully',
    });

  })
);

// ✅ SEARCH MEMBERS
router.get(
  '/search',
  appWrapper(async (req, res) => {

    const { q, event_id } = req.query;

    if (!event_id) {
      return res.status(400).json({
        success: false,
        message: 'event_id is required'
      });
    }
    
    const members = await MemberManager.searchMembers({
        name: q || '',
        event_id
    });
    
    res.json({
      success: true,
      data: members
    });

  })
);


//✅ GET MEMBER BY ID
router.get(
  '/get/:id',
  appWrapper(async (req, res) => {

    const { id } = req.params;

    const member = await MemberManager.getMemberById(id);

    res.json({
      success: true,
      data: member,
      message: 'Member fetched successfully',
    });

  })
);

module.exports = router;
