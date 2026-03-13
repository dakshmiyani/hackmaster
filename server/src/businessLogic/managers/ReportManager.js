const XLSX = require('xlsx');
const MemberModel = require('../../models/MemberModel');
const QrScanModel = require('../../models/QrScanModel');
const QrModel = require('../../models/QrModel');
const MealModel = require('../../models/MealModel');

class ReportManager {
  static async generateEventReport(eventId, userId) {
    const memberModel = new MemberModel(userId);
    const scanModel = new QrScanModel(userId);
    const mealModel = new MealModel(userId);

    // 1. Fetch Data
    const members = await memberModel.getDetailedMembersByEvent(eventId);
    const scans = await scanModel.getAllScansForEvent(eventId);
    const allowedMeals = await mealModel.getAllowedMealsForEvent(eventId);

    // 2. Process Data
    const reportData = members.map(member => {
      const memberScans = scans.filter(s => s.member_id === member.member_id);
      
      const row = {
        'Member ID': member.member_id,
        'Name': member.name,
        'Email': member.email,
        'College': member.college,
        'Team': member.team_name || 'N/A',
        'Registration Date': member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'
      };

      // Add Check-ins / Meals status
      // We assume types can be 'check_in', 'check_out', or various meal names
      // Get unique meal types from allowedMeals + standard ones
      const scanTypes = [...new Set([...allowedMeals.map(m => m.meal_type), 'check_in', 'check_out'])];

      scanTypes.forEach(type => {
        const hasScanned = memberScans.some(s => s.meal_type === type);
        row[this.capitalize(type)] = hasScanned ? 'YES' : 'NO';
      });

      return row;
    });

    // 3. Generate Excel
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Event Report');

    // Return as buffer
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  static async getStats({ type, event_id }, userId) {
    if (!type || !event_id) {
      throw new Error('type and event_id are required');
    }

    const typeLower = type.toLowerCase();

    if (typeLower === 'qr_assigned' || typeLower === 'qr assigned') {
      const qrModel = new QrModel(userId);
      const result = await qrModel.countAssignedByEvent(event_id);
      return { count: parseInt(result.total) || 0 };
    } else {
      // Assume it's a scan type (lunch, dinner, check_in, etc.)
      const scanModel = new QrScanModel(userId);
      const result = await scanModel.countByEventAndType(event_id, typeLower);
      return { count: parseInt(result.total) || 0 };
    }
  }

  static capitalize(str) {
    if (!str) return '';
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}

module.exports = ReportManager;
