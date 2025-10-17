import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", cors({ origin: "*" }));
app.use("*", logger(console.log));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Helper function to verify auth
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

// Generate 8-digit team code
function generateTeamCode(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// ========== AUTH ROUTES ==========

app.post("/make-server-531bc516/auth/signup", async (c) => {
  try {
    const { email, password, role, firstName, lastName, phone, nickname } = await c.req.json();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, firstName, lastName, phone, nickname },
    });

    if (authError) {
      console.log(`Signup error: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    // Store user profile
    const user = {
      id: authData.user.id,
      email,
      role,
      firstName,
      lastName,
      nickname: nickname || "",
      phone: phone || "",
      photoUrl: "",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}`, user);

    return c.json({ success: true, user });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Signup failed" }, 500);
  }
});

app.post("/make-server-531bc516/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Signin error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Get user profile
    const user = await kv.get(`user:${data.user.id}`);

    return c.json({
      success: true,
      accessToken: data.session.access_token,
      user,
    });
  } catch (error) {
    console.log(`Signin error: ${error}`);
    return c.json({ error: "Signin failed" }, 500);
  }
});

// ========== TEAM ROUTES ==========

app.post("/make-server-531bc516/teams", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { name, logoUrl, color } = await c.req.json();
    const code = generateTeamCode();

    const team = {
      id: `team_${Date.now()}`,
      name,
      code,
      logoUrl: logoUrl || "",
      color: color || "#3b82f6",
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    await kv.set(`team:${team.id}`, team);
    await kv.set(`team:code:${code}`, team.id);

    // Add creator as coach member
    const member = {
      id: `member_${Date.now()}`,
      teamId: team.id,
      userId,
      role: "coach",
      status: "active",
      joinedAt: new Date().toISOString(),
    };

    await kv.set(`member:${member.id}`, member);

    // Add to user's teams
    const userTeams = (await kv.get(`user:${userId}:teams`)) || [];
    userTeams.push(team.id);
    await kv.set(`user:${userId}:teams`, userTeams);

    return c.json({ success: true, team, code });
  } catch (error) {
    console.log(`Create team error: ${error}`);
    return c.json({ error: "Failed to create team" }, 500);
  }
});

app.get("/make-server-531bc516/teams/:teamId", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const teamId = c.req.param("teamId");
    const team = await kv.get(`team:${teamId}`);

    if (!team) return c.json({ error: "Team not found" }, 404);

    return c.json({ success: true, team });
  } catch (error) {
    console.log(`Get team error: ${error}`);
    return c.json({ error: "Failed to get team" }, 500);
  }
});

app.patch("/make-server-531bc516/teams/:teamId", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const teamId = c.req.param("teamId");
    const team = await kv.get(`team:${teamId}`);

    if (!team) return c.json({ error: "Team not found" }, 404);

    // Verify user is a coach of this team
    if (team.createdBy !== userId) {
      return c.json({ error: "Only team creator can update team" }, 403);
    }

    const updates = await c.req.json();
    const updatedTeam = { ...team, ...updates };
    await kv.set(`team:${teamId}`, updatedTeam);

    return c.json({ success: true, team: updatedTeam });
  } catch (error) {
    console.log(`Update team error: ${error}`);
    return c.json({ error: "Failed to update team" }, 500);
  }
});

app.get("/make-server-531bc516/users/:userId/teams", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const targetUserId = c.req.param("userId");
    if (userId !== targetUserId) return c.json({ error: "Forbidden" }, 403);

    const teamIds = (await kv.get(`user:${userId}:teams`)) || [];
    const teams = await Promise.all(
      teamIds.map(async (id: string) => await kv.get(`team:${id}`))
    );

    return c.json({ success: true, teams: teams.filter(Boolean) });
  } catch (error) {
    console.log(`Get user teams error: ${error}`);
    return c.json({ error: "Failed to get teams" }, 500);
  }
});

// ========== JOIN REQUEST ROUTES ==========

app.post("/make-server-531bc516/join-requests", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { teamCode, role } = await c.req.json();

    // Get team by code
    const teamId = await kv.get(`team:code:${teamCode}`);
    if (!teamId) return c.json({ error: "Invalid team code" }, 404);

    const user = await kv.get(`user:${userId}`);
    if (!user) return c.json({ error: "User not found" }, 404);

    const request = {
      id: `request_${Date.now()}`,
      teamId,
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      userRole: role || user.role,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };

    await kv.set(`request:${request.id}`, request);

    // Add to team's pending requests
    const teamRequests = (await kv.get(`team:${teamId}:requests`)) || [];
    teamRequests.push(request.id);
    await kv.set(`team:${teamId}:requests`, teamRequests);

    return c.json({ success: true, request });
  } catch (error) {
    console.log(`Create join request error: ${error}`);
    return c.json({ error: "Failed to create join request" }, 500);
  }
});

app.get("/make-server-531bc516/teams/:teamId/join-requests", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const teamId = c.req.param("teamId");
    const requestIds = (await kv.get(`team:${teamId}:requests`)) || [];
    
    const requests = await Promise.all(
      requestIds.map(async (id: string) => await kv.get(`request:${id}`))
    );

    const pendingRequests = requests.filter((r) => r && r.status === "pending");

    return c.json({ success: true, requests: pendingRequests });
  } catch (error) {
    console.log(`Get join requests error: ${error}`);
    return c.json({ error: "Failed to get join requests" }, 500);
  }
});

app.post("/make-server-531bc516/join-requests/:requestId/approve", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const requestId = c.req.param("requestId");
    const { playerInfo, parentInfo } = await c.req.json();
    
    const request = await kv.get(`request:${requestId}`);
    if (!request) return c.json({ error: "Request not found" }, 404);

    // Update request
    request.status = "approved";
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = userId;
    await kv.set(`request:${requestId}`, request);

    // Create team member
    const member = {
      id: `member_${Date.now()}`,
      teamId: request.teamId,
      userId: request.userId,
      role: request.userRole,
      status: "active",
      joinedAt: new Date().toISOString(),
      notes: "",
      playerInfo: playerInfo || null,
      parentInfo: parentInfo || null,
    };

    await kv.set(`member:${member.id}`, member);

    // Add to user's teams
    const userTeams = (await kv.get(`user:${request.userId}:teams`)) || [];
    if (!userTeams.includes(request.teamId)) {
      userTeams.push(request.teamId);
      await kv.set(`user:${request.userId}:teams`, userTeams);
    }

    // Add to team's members
    const teamMembers = (await kv.get(`team:${request.teamId}:members`)) || [];
    teamMembers.push(member.id);
    await kv.set(`team:${request.teamId}:members`, teamMembers);

    return c.json({ success: true, member });
  } catch (error) {
    console.log(`Approve join request error: ${error}`);
    return c.json({ error: "Failed to approve request" }, 500);
  }
});

app.post("/make-server-531bc516/join-requests/:requestId/reject", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const requestId = c.req.param("requestId");
    const request = await kv.get(`request:${requestId}`);
    
    if (!request) return c.json({ error: "Request not found" }, 404);

    request.status = "rejected";
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = userId;
    await kv.set(`request:${requestId}`, request);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Reject join request error: ${error}`);
    return c.json({ error: "Failed to reject request" }, 500);
  }
});

// ========== TEAM MEMBER ROUTES ==========

app.get("/make-server-531bc516/teams/:teamId/members", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const teamId = c.req.param("teamId");
    const memberIds = (await kv.get(`team:${teamId}:members`)) || [];
    
    const members = await Promise.all(
      memberIds.map(async (id: string) => {
        const member = await kv.get(`member:${id}`);
        if (member) {
          const user = await kv.get(`user:${member.userId}`);
          return { ...member, user };
        }
        return null;
      })
    );

    return c.json({ success: true, members: members.filter(Boolean) });
  } catch (error) {
    console.log(`Get team members error: ${error}`);
    return c.json({ error: "Failed to get members" }, 500);
  }
});

app.patch("/make-server-531bc516/members/:memberId", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const memberId = c.req.param("memberId");
    const updates = await c.req.json();
    
    const member = await kv.get(`member:${memberId}`);
    if (!member) return c.json({ error: "Member not found" }, 404);

    const updated = { ...member, ...updates };
    await kv.set(`member:${memberId}`, updated);

    return c.json({ success: true, member: updated });
  } catch (error) {
    console.log(`Update member error: ${error}`);
    return c.json({ error: "Failed to update member" }, 500);
  }
});

app.delete("/make-server-531bc516/members/:memberId", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const memberId = c.req.param("memberId");
    const member = await kv.get(`member:${memberId}`);
    
    if (!member) return c.json({ error: "Member not found" }, 404);

    // Verify user is a coach of this team
    const team = await kv.get(`team:${member.teamId}`);
    if (!team || team.createdBy !== userId) {
      return c.json({ error: "Only team creator can delete members" }, 403);
    }

    // Remove from team's members list
    const teamMembers = (await kv.get(`team:${member.teamId}:members`)) || [];
    const updatedMembers = teamMembers.filter((id: string) => id !== memberId);
    await kv.set(`team:${member.teamId}:members`, updatedMembers);

    // Remove from user's teams list
    const userTeams = (await kv.get(`user:${member.userId}:teams`)) || [];
    const updatedUserTeams = userTeams.filter((id: string) => id !== member.teamId);
    await kv.set(`user:${member.userId}:teams`, updatedUserTeams);

    // Delete the member record
    await kv.del(`member:${memberId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete member error: ${error}`);
    return c.json({ error: "Failed to delete member" }, 500);
  }
});

// ========== MESSAGE ROUTES ==========

app.post("/make-server-531bc516/messages", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { teamId, subject, body, recipientType, recipientIds, forwardToParent, replyToId } = await c.req.json();
    
    const user = await kv.get(`user:${userId}`);
    
    const message = {
      id: `message_${Date.now()}`,
      teamId,
      senderId: userId,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: user.role,
      subject,
      body,
      recipientType,
      recipientIds: recipientIds || [],
      forwardToParent: forwardToParent || false,
      createdAt: new Date().toISOString(),
      replyToId: replyToId || null,
    };

    await kv.set(`message:${message.id}`, message);

    // Add to team messages
    const teamMessages = (await kv.get(`team:${teamId}:messages`)) || [];
    teamMessages.unshift(message.id);
    await kv.set(`team:${teamId}:messages`, teamMessages);

    return c.json({ success: true, message });
  } catch (error) {
    console.log(`Create message error: ${error}`);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

app.get("/make-server-531bc516/teams/:teamId/messages", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const teamId = c.req.param("teamId");
    const messageIds = (await kv.get(`team:${teamId}:messages`)) || [];
    
    const messages = await Promise.all(
      messageIds.map(async (id: string) => await kv.get(`message:${id}`))
    );

    return c.json({ success: true, messages: messages.filter(Boolean) });
  } catch (error) {
    console.log(`Get messages error: ${error}`);
    return c.json({ error: "Failed to get messages" }, 500);
  }
});

// ========== EVENT ROUTES ==========

app.post("/make-server-531bc516/events", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const eventData = await c.req.json();
    
    const event = {
      ...eventData,
      id: `event_${Date.now()}`,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`event:${event.id}`, event);

    // Add to team events
    const teamEvents = (await kv.get(`team:${event.teamId}:events`)) || [];
    teamEvents.push(event.id);
    await kv.set(`team:${event.teamId}:events`, teamEvents);

    return c.json({ success: true, event });
  } catch (error) {
    console.log(`Create event error: ${error}`);
    return c.json({ error: "Failed to create event" }, 500);
  }
});

app.get("/make-server-531bc516/teams/:teamId/events", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const teamId = c.req.param("teamId");
    const eventIds = (await kv.get(`team:${teamId}:events`)) || [];
    
    const events = await Promise.all(
      eventIds.map(async (id: string) => await kv.get(`event:${id}`))
    );

    return c.json({ success: true, events: events.filter(Boolean) });
  } catch (error) {
    console.log(`Get events error: ${error}`);
    return c.json({ error: "Failed to get events" }, 500);
  }
});

app.patch("/make-server-531bc516/events/:eventId", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const eventId = c.req.param("eventId");
    const updates = await c.req.json();
    
    const event = await kv.get(`event:${eventId}`);
    if (!event) return c.json({ error: "Event not found" }, 404);

    const updated = { ...event, ...updates };
    await kv.set(`event:${eventId}`, updated);

    return c.json({ success: true, event: updated });
  } catch (error) {
    console.log(`Update event error: ${error}`);
    return c.json({ error: "Failed to update event" }, 500);
  }
});

app.delete("/make-server-531bc516/events/:eventId", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const eventId = c.req.param("eventId");
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) return c.json({ error: "Event not found" }, 404);

    await kv.del(`event:${eventId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete event error: ${error}`);
    return c.json({ error: "Failed to delete event" }, 500);
  }
});

// ========== ATTENDANCE ROUTES ==========

app.post("/make-server-531bc516/attendance", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const { eventId, playerId, indicatedStatus, indicatedBy } = await c.req.json();
    
    const attendance = {
      id: `attendance_${Date.now()}_${playerId}`,
      eventId,
      userId: playerId,
      indicatedStatus,
      indicatedAt: new Date().toISOString(),
      indicatedBy: indicatedBy || userId,
    };

    await kv.set(`attendance:${attendance.id}`, attendance);
    await kv.set(`attendance:${eventId}:${playerId}`, attendance.id);

    return c.json({ success: true, attendance });
  } catch (error) {
    console.log(`Create attendance error: ${error}`);
    return c.json({ error: "Failed to record attendance" }, 500);
  }
});

app.get("/make-server-531bc516/events/:eventId/attendance", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const eventId = c.req.param("eventId");
    const attendanceList = await kv.getByPrefix(`attendance:${eventId}:`);
    
    const attendance = await Promise.all(
      attendanceList.map(async (id: string) => await kv.get(id))
    );

    return c.json({ success: true, attendance: attendance.filter(Boolean) });
  } catch (error) {
    console.log(`Get attendance error: ${error}`);
    return c.json({ error: "Failed to get attendance" }, 500);
  }
});

app.patch("/make-server-531bc516/attendance/:attendanceId", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const attendanceId = c.req.param("attendanceId");
    const updates = await c.req.json();
    
    const attendance = await kv.get(`attendance:${attendanceId}`);
    if (!attendance) return c.json({ error: "Attendance not found" }, 404);

    const updated = {
      ...attendance,
      ...updates,
      recordedAt: new Date().toISOString(),
      recordedBy: userId,
    };
    await kv.set(`attendance:${attendanceId}`, updated);

    return c.json({ success: true, attendance: updated });
  } catch (error) {
    console.log(`Update attendance error: ${error}`);
    return c.json({ error: "Failed to update attendance" }, 500);
  }
});

// ========== USER PROFILE ROUTES ==========

app.get("/make-server-531bc516/users/:userId", async (c) => {
  try {
    const authUserId = await verifyAuth(c.req.header("Authorization"));
    if (!authUserId) return c.json({ error: "Unauthorized" }, 401);

    const userId = c.req.param("userId");
    const user = await kv.get(`user:${userId}`);
    
    if (!user) return c.json({ error: "User not found" }, 404);

    return c.json({ success: true, user });
  } catch (error) {
    console.log(`Get user error: ${error}`);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

app.patch("/make-server-531bc516/users/:userId", async (c) => {
  try {
    const authUserId = await verifyAuth(c.req.header("Authorization"));
    if (!authUserId) return c.json({ error: "Unauthorized" }, 401);

    const userId = c.req.param("userId");
    if (authUserId !== userId) return c.json({ error: "Forbidden" }, 403);

    const updates = await c.req.json();
    const user = await kv.get(`user:${userId}`);
    
    if (!user) return c.json({ error: "User not found" }, 404);

    const updated = { ...user, ...updates };
    await kv.set(`user:${userId}`, updated);

    return c.json({ success: true, user: updated });
  } catch (error) {
    console.log(`Update user error: ${error}`);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

Deno.serve(app.fetch);
