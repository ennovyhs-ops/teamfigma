// User Types
export type UserRole = "coach" | "player" | "parent";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  nickname?: string;
  phone?: string;
  photoUrl?: string;
  createdAt: string;
};

// Team Types
export type Team = {
  id: string;
  name: string;
  code: string; // 8-digit code
  logoUrl?: string;
  createdAt: string;
  createdBy: string; // coach user id
  color?: string; // for multi-team display
};

export type TeamMember = {
  id: string;
  teamId: string;
  userId: string;
  role: UserRole;
  status: "active" | "pending" | "rejected";
  joinedAt?: string;
  notes?: string; // coach notes for players
  playerInfo?: PlayerInfo;
  parentInfo?: ParentInfo;
};

export type PlayerInfo = {
  position: string;
  jerseyNumber: number;
  birthMonth?: number;
  birthYear?: number;
  parentId?: string; // link to parent user
};

export type ParentInfo = {
  childrenIds: string[]; // player user ids
};

// Message Types
export type Message = {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  subject: string;
  body: string;
  recipientType: "everyone" | "players" | "parents" | "coaches" | "individual";
  recipientIds?: string[]; // for individual messages
  forwardToParent: boolean;
  createdAt: string;
  replyToId?: string;
};

export type MessageThread = {
  message: Message;
  replies: Message[];
  unreadCount: number;
};

// Event Types
export type EventType = "practice" | "game" | "meeting" | "other";

export type Event = {
  id: string;
  teamId: string;
  type: EventType;
  title: string;
  date: string;
  time: string;
  location: string;
  details?: string;
  createdBy: string;
  createdAt: string;
  // game-specific fields
  opponent?: string;
  homeScore?: number;
  awayScore?: number;
  isHome?: boolean;
};

export type AttendanceStatus = "attend" | "late" | "injured" | "absent" | "pending";

export type Attendance = {
  id: string;
  eventId: string;
  userId: string; // player id
  indicatedStatus?: AttendanceStatus;
  indicatedAt?: string;
  indicatedBy?: string; // could be player or parent
  actualStatus?: AttendanceStatus;
  recordedAt?: string;
  recordedBy?: string; // coach who recorded actual attendance
};

// Join Request Types
export type JoinRequest = {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // coach id
};

// Analytics Types
export type PlayerStats = {
  playerId: string;
  gamesPlayed: number;
  totalPoints: number;
  avgPoints: number;
  attendance: number;
};

export type TeamStats = {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPlayers: number;
  activePlayers: number;
};
