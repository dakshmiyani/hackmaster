export const mockTeamData = [
  {
    teamId: "TM-001",
    teamName: "Code Crusaders",
    category: "Hackathon",
    members: [
      { id: "M01", name: "Alex Johnson", email: "alex@example.com", phone: "9876543210", college: "MIT", checkIn: true, checkOut: false, qrAssigned: true, breakfast: true, lunch: false, midnight_snacks: false, snacks: false, dinner: false },
      { id: "M02", name: "Sam Smith", email: "sam@example.com", phone: "9876543211", college: "MIT", checkIn: true, checkOut: false, qrAssigned: true, breakfast: true, lunch: false, midnight_snacks: false, snacks: false, dinner: false },
    ]
  },
  {
    teamId: "TM-002",
    teamName: "Byte Builders",
    category: "Hackathon",
    members: [
      { id: "M03", name: "Sarah Chen", email: "sarah@example.com", phone: "9876543212", college: "Stanford", checkIn: false, checkOut: false, qrAssigned: false, breakfast: false, lunch: false, midnight_snacks: false, snacks: false, dinner: false },
    ]
  },
  {
    teamId: "TM-003",
    teamName: "Data Dragons",
    category: "UI/UX",
    members: [
      { id: "M04", name: "Emily Rodriguez", email: "emily@example.com", phone: "9876543214", college: "NYU", checkIn: true, checkOut: true, qrAssigned: true, breakfast: true, lunch: true, midnight_snacks: true, snacks: false, dinner: true },
    ]
  }
];

export const mockLeaderboardData = {
  web: [
    { team_id: "T-100", team_name: "Web Wizards", total_score: 95 },
    { team_id: "T-101", team_name: "DOM Destroyers", total_score: 88 },
    { team_id: "T-102", team_name: "React Rangers", total_score: 82 },
  ],
  aiml: [
    { team_id: "T-200", team_name: "Neural Ninjas", total_score: 98 },
    { team_id: "T-201", team_name: "Tensor Titans", total_score: 91 },
    { team_id: "T-202", team_name: "Data Miners", total_score: 85 },
  ]
};

export const mockMentorRequests = [
  {
    id: "1",
    teamName: "Code Crusaders",
    leaderName: "Alex Johnson",
    domain: "AI/ML",
    problemStatement: "Smart Healthcare Assistant",
    requestTime: "2 minutes ago",
    status: "pending",
  },
  {
    id: "2",
    teamName: "Byte Builders",
    leaderName: "Sarah Chen",
    domain: "Web Dev",
    problemStatement: "Decentralized Voting System",
    requestTime: "5 minutes ago",
    status: "pending",
  },
  {
    id: "3",
    teamName: "Neural Ninjas",
    leaderName: "Marcus Williams",
    domain: "IoT",
    problemStatement: "Smart Campus Energy Management",
    requestTime: "12 minutes ago",
    status: "pending",
  },
];
