import { teamAPI, eventAPI, messageAPI, joinRequestAPI } from "./api";

export async function setupDemoData(userId: string) {
  try {
    // Check if user already has teams (skip if they do)
    const teamsResponse = await teamAPI.getUserTeams(userId);
    if (teamsResponse.teams && teamsResponse.teams.length > 0) {
      return teamsResponse.teams[0]; // Return existing team
    }

    // Create demo team
    const teamResponse = await teamAPI.create({
      name: "Warriors Basketball",
      color: "#3b82f6",
    });

    const team = teamResponse.team;
    const teamId = team.id;

    // Create demo events
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const demoEvents = [
      {
        teamId,
        type: "practice" as const,
        title: "Team Practice",
        date: tomorrow.toISOString().split("T")[0],
        time: "16:00",
        location: "Main Gym",
        details: "Focus on defensive drills and team plays",
      },
      {
        teamId,
        type: "game" as const,
        title: "Championship Game",
        date: nextWeek.toISOString().split("T")[0],
        time: "19:00",
        location: "Home Court",
        details: "Final game of the season",
        opponent: "Central High",
        isHome: true,
      },
      {
        teamId,
        type: "meeting" as const,
        title: "Parent-Coach Meeting",
        date: new Date(today.setDate(today.getDate() + 3)).toISOString().split("T")[0],
        time: "18:30",
        location: "Conference Room",
        details: "Discuss end of season plans",
      },
    ];

    for (const event of demoEvents) {
      await eventAPI.create(event);
    }

    // Create demo messages
    const demoMessages = [
      {
        teamId,
        subject: "Welcome to the Team!",
        body: "Welcome everyone to the Warriors Basketball team! This is your central hub for all team communications. Feel free to reach out anytime.",
        recipientType: "everyone",
      },
      {
        teamId,
        subject: "Practice Schedule Update",
        body: "Reminder: Practice tomorrow at 4 PM. Please arrive 15 minutes early for warm-ups.",
        recipientType: "players",
      },
      {
        teamId,
        subject: "Championship Game Details",
        body: "Important information about next week's championship game. Players should arrive at 6 PM for pre-game preparation.",
        recipientType: "everyone",
      },
    ];

    for (const message of demoMessages) {
      await messageAPI.send(message);
    }

    return team;
  } catch (error) {
    console.error("Failed to setup demo data:", error);
    throw error;
  }
}
