const Db = require("../../models/libs/Db");
const ExcelJS = require('exceljs');

class AdminManager {
  static async getDashboardStats() {
    const db = await Db.getQueryBuilder();

    const [teamsCount] = await db('teams').where({ is_deleted: false }).count();
    const [membersCount] = await db('members').where({ is_deleted: false }).count();

    // Check-in count (mapping 'check-in' to meal_type)
    const [checkedInCount] = await db('qr_scans')
      .join('meals', 'qr_scans.meal_id', 'meals.meal_id')
      .where('meals.meal_type', 'check-in')
      .count();

    // Lunch count
    const [lunchCount] = await db('qr_scans')
      .join('meals', 'qr_scans.meal_id', 'meals.meal_id')
      .where('meals.meal_type', 'lunch')
      .count();

    // Breakfast count
    const [breakfastCount] = await db('qr_scans')
      .join('meals', 'qr_scans.meal_id', 'meals.meal_id')
      .where('meals.meal_type', 'breakfast')
      .count();

    return {
      totalTeams: parseInt(teamsCount.count) || 0,
      totalMembers: parseInt(membersCount.count) || 0,
      checkedIn: parseInt(checkedInCount.count) || 0,
      lunchCount: parseInt(lunchCount.count) || 0,
      breakfastCount: parseInt(breakfastCount.count) || 0
    };
  }

  static async exportToExcel() {
    const db = await Db.getQueryBuilder();

    // Fetch all members with their team and event info
    const data = await db('members')
      .select(
        'members.member_id',
        'members.name',
        'members.email',
        'members.college',
        'events.name as event_name',
        'teams.name as team_name'
      )
      .leftJoin('events', 'members.event_id', 'events.event_id')
      .leftJoin('team_members', 'members.member_id', 'team_members.member_id')
      .leftJoin('teams', 'team_members.team_id', 'teams.team_id')
      .where('members.is_deleted', false);

    // Fetch all scans for these members
    const scans = await db('qr_scans')
      .select('member_id', 'meals.meal_type')
      .join('meals', 'qr_scans.meal_id', 'meals.meal_id');

    // Process data into a map for easy lookup
    const scanMap = {};
    scans.forEach(scan => {
      if (!scanMap[scan.member_id]) scanMap[scan.member_id] = [];
      scanMap[scan.member_id].push(scan.meal_type);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participants');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'College', key: 'college', width: 25 },
      { header: 'Event', key: 'event', width: 20 },
      { header: 'Team', key: 'team', width: 25 },
      { header: 'Check-In', key: 'checkin', width: 12 },
      { header: 'Breakfast', key: 'breakfast', width: 12 },
      { header: 'Lunch', key: 'lunch', width: 12 },
      { header: 'Dinner', key: 'dinner', width: 12 },
      { header: 'Check-Out', key: 'checkout', width: 12 }
    ];

    data.forEach(m => {
      const userScans = scanMap[m.member_id] || [];
      worksheet.addRow({
        id: m.member_id,
        name: m.name,
        email: m.email,
        college: m.college,
        event: m.event_name,
        team: m.team_name || 'N/A',
        checkin: userScans.includes('check-in') ? 'YES' : 'NO',
        breakfast: userScans.includes('breakfast') ? 'YES' : 'NO',
        lunch: userScans.includes('lunch') ? 'YES' : 'NO',
        dinner: userScans.includes('dinner') ? 'YES' : 'NO',
        checkout: userScans.includes('checkout') ? 'YES' : 'NO'
      });
    });

    // Formatting
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  static async exportLeaderboardToExcel(domain) {
    const db = await Db.getQueryBuilder();
    console.log(`[Export] Starting leaderboard export for domain: ${domain}`);

    // Unified domain mapping to handle variations from different frontends
    const domainMap = {
      'web': ['web', 'Web', 'Web Dev', 'WEB DEVELOPMENT', 'Web development', 'WEB'],
      'aiml': ['aiml', 'AI/ML', 'AI / ML', 'AI', 'ML', 'Machine Learning', 'AI/ML']
    };

    let query = db('team_scores')
      .select('teams.team_id', 'teams.name as team_name', 'teams.domain as team_domain', 'team_scores.domain as score_domain')
      .sum('team_scores.total_score as total_score')
      .innerJoin('teams', 'team_scores.team_id', 'teams.team_id')
      .where('teams.is_deleted', false)
      .groupBy('teams.team_id', 'teams.name', 'teams.domain', 'team_scores.domain')
      .orderByRaw('SUM(team_scores.total_score) DESC');

    if (domain && domain !== 'all' && domain !== 'All') {
      const searchTerms = domainMap[domain.toLowerCase()] || [domain];
      console.log(`[Export] Filtering by search terms:`, searchTerms);
      query = query.whereIn('team_scores.domain', searchTerms);
    }

    const teams = await query;
    console.log(`[Export] Found ${teams.length} teams for export`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${domain ? domain.toUpperCase() : 'ALL'} Leaderboard`);

    worksheet.columns = [
      { header: 'Rank', key: 'rank', width: 10 },
      { header: 'Team Name', key: 'team_name', width: 30 },
      { header: 'Domain', key: 'domain', width: 25 },
      { header: 'Team ID', key: 'team_id', width: 15 },
      { header: 'Total Score', key: 'total_score', width: 15 }
    ];

    teams.forEach((t, index) => {
      const score = parseFloat(t.total_score || 0);
      worksheet.addRow({
        rank: index + 1,
        team_name: t.team_name,
        domain: t.score_domain || t.team_domain || 'N/A',
        team_id: t.team_id,
        total_score: score.toFixed(2)
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    return await workbook.xlsx.writeBuffer();
  }

  static async getLeaderboard(domain) {
    const db = await Db.getQueryBuilder();

    const domainMap = {
      'web': ['web', 'Web', 'Web Dev', 'WEB DEVELOPMENT', 'Web development', 'WEB'],
      'aiml': ['aiml', 'AI/ML', 'AI / ML', 'AI', 'ML', 'Machine Learning', 'AI/ML']
    };

    let query = db('team_scores')
      .select('teams.team_id', 'teams.name as team_name', 'teams.domain as team_domain', 'team_scores.domain as score_domain')
      .sum('team_scores.total_score as total_score')
      .innerJoin('teams', 'team_scores.team_id', 'teams.team_id')
      .where('teams.is_deleted', false)
      .groupBy('teams.team_id', 'teams.name', 'teams.domain', 'team_scores.domain')
      .orderByRaw('SUM(team_scores.total_score) DESC');

    if (domain && domain !== 'all' && domain !== 'All') {
      const searchTerms = domainMap[domain.toLowerCase()] || [domain];
      query = query.whereIn('team_scores.domain', searchTerms);
    }

    const res = await query;
    return res.map(t => ({
      ...t,
      total_score: parseFloat(t.total_score || 0)
    }));
  }
}

module.exports = AdminManager;
