# teamfigma

This is a code bundle for teamfigma. The original project is available at https://www.figma.com/design/aI3ey4nTGLjgAXTHR8pUo5/teamfigma.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.


## Features

- **Authentication & Personalization**
 - Simple login system for different user types (Coach, Player, Parent) from dropdown.
 - Button to show password and forget password reset request by email input.
   - send reset password link via registered email.
 - Coach, Player and Parent use email and password to register own account.
 - Coach to create new team or request join existing team by entering 8-alphanumeric code set by existing coach of team.
 - Player after login, needs to enter a team 8-alphanumeric code to request joining team, to be approved by coach. 
 - Parent after login, needs to enter Player email to confirm Parent account linkage with Player and a team 8-alphanumeric code to request joining team, to be approved by coach. 
  
- **Coach View:**
 - **Team Selection**
   - Coach select joined team from respective managing team list.
   - Option to create new or join other teams.
 - **Dashboards**
   - View team dashboard with upcoming events and activities and latest messages notofications.
   - Upcoming events and activities and latest messages are expandable to show the three latest and clickable to go into detailed modal.
 - **Roster Management**
   - In list view, view a responsive list of all players on the team, with profile photo, name, nickname, number and position, with sort and filter function.
   - Click a player to open a detailed modal view with full contact information and coaches notes for the player.
   - In detailed modal view, Coach may add notes to Player for coach personal reference and records.
   - Full roster management and edit including profile photo, first name, last name, nickname, number, position, birth month and year, email and phone (add, view, edit, delete players and respective parent contact information).
   - Coach need to confirm new player/parent join team request, show badge with count to notify coach new request.  
   - coach may add/edit new players with details like profile photo, first name, last name, nickname, number, position, email, phone, birth month and year, parent's name, and contact details.
   - Coach option to add note, edit or delete players directly from the player detail view.
     - If Coach has added note to a Player, denote "Notes" with date to remind Coach. 
   - Coach to approve Player/Parent request to unjoin team. 
   - Shortcut for Coach to set 8-alphanumeric code to add new player or parent. 
 - **Message**
   - Select and view message list, with sort and filter options.
   - Messages display in conversation view.
   - Coaches can compose and send or reply messages with a subject and body.
   - Targeted messaging to different groups (everyone, just players, just parents and/or individual players with option to forward to respecitve parent).
   - Centralized message history for coaches, players, and parents.
   - Notification badge with count.
 - **Events**
   - Coach can create new and manage team events (Practice, Game, Meeting, Other) with date, time, location, and details.
   - Coach can edit/update/delete event information or select event cancelled.
   - Coach may check player/parent indicated attend vs player actual attendance for records, in event detail.
   - Coach sees a quick count on indicated replied (Attend, Late, Injured, Absent) vs not yet reply. 
   - Update/manage player attendance and view player/parent indicated attend.
   - All users can view a chronological list of upcoming events.
   - All users can click an event to open a detailed modal view with full information.
 - **Setting**
   - **Team Setting**
     - Coach can upload and display a custom logo and change name for team.
     - Option to select and change managning team.
     - Existing coach to a team may add new coach to join team to help manage by email invitation link. 
     - Create/edit 8-alphanumeric code for Player and Parent to join teams. Each team has its own unique 8-alphanumeric code.
     - Delete team
   - **Profile Setting**
     - Profile Settings to edit profile photo, name, contact email and phone.
     - Delete account.
 - Bottom navigation bar to navigate between different pages.


- **Player View:**
 - **Dashboards**
   - View personal dashboard on upcoming events and activities and latest messages notofications of all joined teams.
   - Upcoming events and activities and latest messages are expandable to show the three latest and clickable to go into detailed modal.
   - If Player has joined mulitple teams, provide option to filter with multiple selection or display all for easier viewing.
   - When displaying multiple team up coming events and activities, use colour code to display different teams.
 - **Team Roster**    
   - View team's coaches name.
   - Only viewing a responsive list of all players on the team, only display profile photo, name, nickname, number and position, with sort and filter function. 
 - **Message**
   - Select and view message list, with sort and filter options.
   - Messages display in conversation view.
   - Player can compose and send or reply messages with a subject and body.
   - Targeted messaging to just coach or everyone.
   - Centralized message history for coaches, players, and parents.
   - Notification badge with count.
 - **Events**
   - Player only view team events (Practice, Game, Meeting, Other) with date, time, location, and details.
   - All users can view a chronological list of upcoming events.
   - All users can click an event to open a detailed modal view with full information.
   - Player to indicate own attendance to events and activities from dropdown options (Attend, Late, Injured, Absent), submissions are time stamp for record.
 - **Setting**
   - **Team Setting**
     - Allow to enter other 8-alphanumeric code to request to join more teams.
     - Send request to respective team coach to unjoin team, needs team's coach approval.
     - Display all joined teams.
   - **Profile Setting**
     - Profile settings to edit profile photo, name, nickname,  contact email and phone.
     - Display linked Parent accounts, if any. Needs Parent approval if unlinked by Player.
     - Delete account.
 - Bottom navigation bar to navigate between different pages.


- **Parent View:**
 - **Dashboards**
   - View and manage respective children Player dashboard on upcoming events and activities and latest messages notofications of all joined teams.
   - Upcoming events and activities and latest messages are expandable to show the three latest and clickable to go into detailed modal.
   - If joined respective child Player has joined mulitple teams or have multiple child Player, provide option to   filter with multiple selection or display all easier viewing.
   - When displaying multiple team up coming events and activities, use colour code to display different teams.
 - **Team Roster**    
   - Only viewing a responsive list of all players on the team only display profile photo, name, nickname, number and position, with sort and filter function. 
 - **Message**
   - Select and view message list, with sort and filter options.
   - Messages display in conversation view.
   - Parent can compose and send or reply messages with a subject and body.
   - Targeted messaging to just coach, everyone or just parent.
   - Centralized message history for coaches, players, and parents.
   - Notification badge with count.
 - **Events**
   - Parent only view team events (Practice, Game, Meeting, Other) with date, time, location, and details.
   - All users can view a chronological list of upcoming events.
   - All users can click an event to open a detailed modal view with full information.
   - Parent to indicate Player attendance to events and activities from dropdown options (Attend, Late, Injured, Absent), submissions are time stamp for record.
 - **Setting**
   - **Team Setting**
     - Allow to enter other 8-alphanumeric code to request to join more teams.
     - Send request to respective team coach to unjoin team, needs team's coach approval.
     - Display all joined teams.
   - **Profile Setting**
     - Profile settings to edit name, nickname, contact email and phone.
     - View and edit respective child Player profile information (first name, last name, contact email and number).
     - Enter Players' registered email to link with respecitve Player account.
     - Display linked Player accounts, if any. Needs Player approval if unlinked by Parent.
     - Delete account.
- Bottom navigation bar to navigate between different pages.

- **AI-Powered Performance Analysis**
  - A dedicated flow (`analyze-performance-data.ts`) to analyze game statistics and player data.
  - Provides overall team analysis, player-specific recommendations, and strategic adjustments.
