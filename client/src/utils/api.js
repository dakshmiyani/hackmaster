import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

// Axios instance with auth token
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Helpers ──────────────────────────────────────────────

const get = async (url, params) => {
  const res = await api.get(url, { params });
  return res.data?.data ?? res.data;
};

const post = async (url, body) => {
  const res = await api.post(url, body);
  return res.data?.data ?? res.data;
};

// ── Teams ─────────────────────────────────────────────────

export const getTeamsByEvent = (event_id) =>
  get(`/open/api/team/by-event/${event_id}`);

export const searchTeams = (event_id, name) =>
  get("/open/api/team/search", { event_id, name });

export const getTeamLeader = (team_id) =>
  get(`/open/api/team/leader/${team_id}`);

// ── Members ───────────────────────────────────────────────

export const getMembersByEvent = (event_id) =>
  get(`/open/api/member/by-event/${event_id}`);

export const searchMembers = (event_id, name) =>
  get("/open/api/member/search", { event_id, name });

export const registerMember = (data) =>
  post("/open/api/member/create", data);

// ── Judging ───────────────────────────────────────────────

export const getCriteriaByEvent = (event_id) =>
  get(`/open/api/judging/criteria/by-event/${event_id}`);

export const createCriteria = (data) =>
  post("/open/api/judging/criteria/create", data);

export const submitScore = (data) =>
  post("/open/api/judging/score/submit", data);

export const getScoresByTeam = (team_id) =>
  get(`/open/api/judging/score/by-team/${team_id}`);

export const getTeamTotalScore = (team_id) =>
  get(`/open/api/judging/score/total/${team_id}`);

export const getLeaderboard = (event_id) =>
  get(`/open/api/judging/leaderboard/${event_id}`);

// ── QR / Scans ────────────────────────────────────────────

export const submitQrScan = (data) =>
  post("/open/api/qr/scans", data);

export const assignQr = (data) =>
  post("/open/api/qr/assign", data);

export const getScanStats = (data) =>
  post("/open/api/qr/stats", data);

// ── Auth ─────────────────────────────────────────────────

export const loginApi = (data) =>
  post("/open/api/auth/login", data);

export const registerApi = (data) =>
  post("/open/api/auth/register", data);

export default api;
