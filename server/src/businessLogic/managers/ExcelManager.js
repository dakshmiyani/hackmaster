const XLSX = require('xlsx');
const EventModel = require('../../models/EventModel');
const MemberManager = require('./MemberManager');

class ExcelManager {

  static async processExcel(buffer, userId, { eventId, eventName: passedEventName } = {}) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      throw new Error('Excel file is empty');
    }

    const eventModel = new EventModel(userId);
    let event = null;

    // 1. Identify Event
    if (eventId) {
      event = await eventModel.findById(eventId);
    }

    if (!event && passedEventName) {
      event = await eventModel.findByNameNormalized(passedEventName);
    }

    if (!event) {
      // Try to find Event Name or ID from columns
      const firstRow = rows[0];
      const cleanFirstRow = {};
      for (const key in firstRow) cleanFirstRow[key.trim().toLowerCase()] = firstRow[key];

      const eventIdFromExcel = cleanFirstRow['event_id'] || cleanFirstRow['id'];
      if (eventIdFromExcel) {
        event = await eventModel.findById(eventIdFromExcel);
      }

      if (!event) {
        const eventNameKey = Object.keys(firstRow).find(k => k.toLowerCase().includes('event') && k.toLowerCase().includes('name'));
        if (eventNameKey) {
          const eventNameFromExcel = firstRow[eventNameKey].toString().trim();
          event = await eventModel.findByNameNormalized(eventNameFromExcel);
        }
      }
    }

    if (!event) {
      throw new Error('Could not identify event. Please provide eventId/eventName in request or "Event_name" column in Excel.');
    }

    const org_id = event.organization_id || event.org_id;
    const finalEventName = event.event_name || event.name;

    let successCount = 0;
    const failures = [];

    for (const row of rows) {
      try {
        const cleanRow = {};
        // Normalize keys (trim and lower) for easier access
        for (const key in row) {
          const k = key.trim().toLowerCase();
          cleanRow[k] = row[key];
        }

        const eventNameLower = finalEventName.toLowerCase();

        // Helper to get value from multiple common column names
        const getVal = (row, keys) => {
          for (const k of keys) {
            if (row[k] !== undefined) return row[k];
          }
          return null;
        };

        const isTallFormat = getVal(cleanRow, ['member_name', 'name', 'student_name', 'full_name', 'member']);
        const teamName = getVal(cleanRow, ['team_name', 'team']);

        if (isTallFormat) {
          // 🏃 Tall Format: One row per member
          await MemberManager.createMember({
            name: isTallFormat,
            email: getVal(cleanRow, ['email', 'email_id', 'mail']),
            college: getVal(cleanRow, ['college', 'university', 'institute', 'college_name']),
            team_name: teamName,
            event_id: event.event_id,
            org_id
          }, userId);
        } else if (eventNameLower.includes('uiux') || getVal(cleanRow, ['team_leader', 'leader_name'])) {
          // 👥 Wide Format (Team centered)
          // Leader
          const leaderName = getVal(cleanRow, ['team_leader', 'leader_name', 'leader']);
          const leaderEmail = getVal(cleanRow, ['leader_email', 'leader_email_id']);
          if (leaderName && leaderEmail) {
            await MemberManager.createMember({
              name: leaderName,
              email: leaderEmail,
              team_name: teamName,
              event_id: event.event_id,
              org_id,
              college: getVal(cleanRow, ['leader_college', 'leader_college_name', 'college'])
            }, userId);
          }
          // Member
          const memberName = getVal(cleanRow, ['team_member', 'member_name', 'member']);
          const memberEmail = getVal(cleanRow, ['team_member_email', 'member_email']);
          if (memberName && memberEmail) {
            await MemberManager.createMember({
              name: memberName,
              email: memberEmail,
              team_name: teamName,
              event_id: event.event_id,
              org_id,
              college: getVal(cleanRow, ['member_college', 'member_college_name', 'college'])
            }, userId);
          }
        } else {
          // Default logic for Wide Hackathon format (Member 1, 2, 3)
          const members = [
            { name: getVal(cleanRow, ['team_member_1', 'member_1']), email: getVal(cleanRow, ['team_member_email_1', 'member_email_1']), college: getVal(cleanRow, ['member1_college', 'college']) },
            { name: getVal(cleanRow, ['team_member_2', 'member_2']), email: getVal(cleanRow, ['team_member_email_2', 'member_email_2']), college: getVal(cleanRow, ['member2_college', 'college']) },
            { name: getVal(cleanRow, ['team_member_3', 'member_3']), email: getVal(cleanRow, ['team_member_email_3', 'member_email_3']), college: getVal(cleanRow, ['member3_college', 'college']) }
          ];

          for (const m of members) {
            if (m.name && m.email) {
              await MemberManager.createMember({
                name: m.name,
                email: m.email,
                college: m.college,
                team_name: teamName,
                event_id: event.event_id,
                org_id
              }, userId);
            }
          }
        }

        successCount++;
      } catch (err) {
        failures.push({
          row: row,
          error: err.message
        });
      }
    }

    return {
      total: rows.length,
      success: successCount,
      failed: failures.length,
      failureDetails: failures
    };
  }
}

module.exports = ExcelManager;
