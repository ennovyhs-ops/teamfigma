import { projectId, publicAnonKey } from "./supabase/info";
import type { User, Team, JoinRequest, TeamMember, Message, Event, Attendance } from "../types";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-531bc516`;

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem("authToken", token);
}

export function getAuthToken() {
  if (!authToken) {
    authToken = localStorage.getItem("authToken");
  }
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem("authToken");
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Auth API
export const authAPI = {
  signup: (userData: {
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    phone?: string;
    nickname?: string;
  }) => fetchAPI("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  }),

  signin: (credentials: { email: string; password: string }) =>
    fetchAPI("/auth/signin", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
};

// Team API
export const teamAPI = {
  create: (teamData: { name: string; logoUrl?: string; color?: string }) =>
    fetchAPI("/teams", {
      method: "POST",
      body: JSON.stringify(teamData),
    }),

  getById: (teamId: string) => fetchAPI(`/teams/${teamId}`),

  getUserTeams: (userId: string) => fetchAPI(`/users/${userId}/teams`),

  getMembers: (teamId: string) => fetchAPI(`/teams/${teamId}/members`),

  update: (teamId: string, updates: Partial<Team>) =>
    fetchAPI(`/teams/${teamId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  updateMember: (memberId: string, updates: Partial<TeamMember>) =>
    fetchAPI(`/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteMember: (memberId: string) =>
    fetchAPI(`/members/${memberId}`, {
      method: "DELETE",
    }),
};

// Join Request API
export const joinRequestAPI = {
  create: (data: { teamCode: string; role?: string }) =>
    fetchAPI("/join-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getTeamRequests: (teamId: string) => fetchAPI(`/teams/${teamId}/join-requests`),

  approve: (requestId: string, additionalData?: { playerInfo?: any; parentInfo?: any }) =>
    fetchAPI(`/join-requests/${requestId}/approve`, {
      method: "POST",
      body: JSON.stringify(additionalData || {}),
    }),

  reject: (requestId: string) =>
    fetchAPI(`/join-requests/${requestId}/reject`, {
      method: "POST",
    }),
};

// Message API
export const messageAPI = {
  send: (messageData: {
    teamId: string;
    subject: string;
    body: string;
    recipientType: string;
    recipientIds?: string[];
    forwardToParent?: boolean;
    replyToId?: string;
  }) =>
    fetchAPI("/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    }),

  getTeamMessages: (teamId: string) => fetchAPI(`/teams/${teamId}/messages`),
};

// Event API
export const eventAPI = {
  create: (eventData: Partial<Event>) =>
    fetchAPI("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),

  getTeamEvents: (teamId: string) => fetchAPI(`/teams/${teamId}/events`),

  update: (eventId: string, updates: Partial<Event>) =>
    fetchAPI(`/events/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  delete: (eventId: string) =>
    fetchAPI(`/events/${eventId}`, {
      method: "DELETE",
    }),

  getAttendance: (eventId: string) => fetchAPI(`/events/${eventId}/attendance`),
};

// Attendance API
export const attendanceAPI = {
  indicate: (data: {
    eventId: string;
    playerId: string;
    indicatedStatus: string;
    indicatedBy?: string;
  }) =>
    fetchAPI("/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (attendanceId: string, updates: { actualStatus?: string }) =>
    fetchAPI(`/attendance/${attendanceId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
};

// User API
export const userAPI = {
  getById: (userId: string) => fetchAPI(`/users/${userId}`),

  update: (userId: string, updates: Partial<User>) =>
    fetchAPI(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
};
