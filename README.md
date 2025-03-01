# Debate Tournament Management System

A complete debate tournament management system featuring both front-end and back-end components. This system allows administrators to manage tournament matches, update match details, set winners, and automatically advance teams through the bracket. At the same time, regular users can view the tournament bracket, vote for their favorite teams for the Best Popularity Award, and see real-time voting rankings. The project uses Vue 3 and Element Plus for the front-end, and Express with SQLite for the back-end.

## Features

### Front-end
- **Tournament Bracket Visualization:**  
  Display the tournament schedule in a dynamic, graphical bracket format. The bracket supports automatic connection lines between matches and updates as match results are entered.
  
- **Admin and User Views:**  
  - **Admin:**  
    - Admin login (default username: `cxy`, password: `cxy`)
    - Ability to edit match details (time, location, topic, team information)
    - Set the winner of each match and automatically advance the winning team to the next round
  - **Regular User:**  
    - View the tournament bracket and match details
    - Vote for the Best Popularity Award (voting does not affect match outcomes)
    - View the live voting leaderboard (each IP address is allowed only one vote)

- **Responsive & Modern UI:**  
  The front-end uses Element Plus for a polished, professional look and responsive design.

### Back-end
- **RESTful API:**  
  The Express back-end provides APIs for:
  - Admin login and authentication (using JWT)
  - Retrieving teams and matches data
  - Updating match information and setting winners
  - Handling user votes with IP-based restrictions (each IP can only vote once)
  - Retrieving voting results for the popularity award ranking

- **SQLite Database:**  
  The system uses SQLite to store persistent data. The database includes tables for teams, matches, and votes. The match table is designed with self-referential foreign keys (using `DEFERRABLE INITIALLY DEFERRED` to handle bracket relationships).

## Installation

### Prerequisites
- **Node.js:** Ensure you have Node.js (preferably an LTS version, e.g., v18.x or v20.x) installed.
- **SQLite:** No separate installation is needed; the project uses the SQLite npm package.

### Clone the Repository
```bash
git clone <repository_url>
cd <repository_directory>
```

### Install Dependencies
For the front-end and back-end, run the following commands in the project root:
```bash
npm install
```
*(If you use pnpm or yarn, adjust the command accordingly.)*

## Database Initialization

The project includes an SQLite initialization script (`init_debate.sql`) that creates the necessary tables and inserts initial data. To initialize the database:

1. Ensure the SQLite CLI or a GUI tool is available.
2. Run the following command in your terminal (assuming the SQLite CLI is installed):
   ```bash
   sqlite3 debate.db < init_debate.sql
   ```
   This will create a `debate.db` file in the project root with the following tables:
   - **teams:** Contains 16 initial teams.
   - **matches:** Contains the match schedule with bracket relationships.
   - **votes:** Records user votes for the Best Popularity Award.

## Running the Project

### Back-end Server
Start the Express server by running:
```bash
node app.js
```
This will start the back-end on port **3000**.

### Front-end Server
Start the Vue front-end development server (using Vite) by running:
```bash
npm run dev
```
This will start the front-end on port **5173** (by default).

The front-end is configured to use Axios with a base URL of `http://localhost:3000`, so API requests will be correctly forwarded to the back-end.

## API Documentation

### Admin Authentication
- **POST /api/admin/login**  
  **Description:** Authenticate admin user.  
  **Request Body:**  
  ```json
  { "username": "cxy", "password": "cxy" }
  ```  
  **Response:**  
  ```json
  { "token": "<JWT token>" }
  ```

### Teams API
- **GET /api/teams**  
  Retrieves a list of all teams.

- **POST /api/teams** (Admin only)  
  Add a new team.  
  **Request Body:**  
  ```json
  { "name": "New Team Name" }
  ```

- **PUT /api/teams/:id** (Admin only)  
  Update team information.

### Matches API
- **GET /api/matches**  
  Retrieves all matches (for tournament bracket visualization).  
  Each match includes fields such as `id`, `round`, `team1_id`, `team1_name`, `team2_id`, `team2_name`, and `winner_id`.

- **PUT /api/matches/:id** (Admin only)  
  Update match information and set the winner.  
  **Request Body:**  
  ```json
  { "winner": <winning_team_id> }
  ```
  The back-end will automatically update the next match's team slot if applicable.

### Votes API (Best Popularity Award)
- **GET /api/votes/popularity**  
  Retrieves the popularity voting leaderboard. Returns an array of teams with vote counts, sorted by votes (descending).

- **POST /api/votes/popularity**  
  Submit a vote for a team.  
  **Request Body:**  
  ```json
  { "teamId": <team_id> }
  ```
  Each IP is restricted to one vote. If the same IP attempts to vote again, an error is returned.

## Additional Notes

- **Admin vs. User Views:**  
  The front-end distinguishes between admin and regular users. Admin functionalities (such as editing matches and setting winners) are only available when an admin is logged in (as determined by the presence of a valid JWT token stored in localStorage). Regular users only have access to view the bracket and vote.

- **Bracket Visualization:**  
  The tournament bracket is rendered using a third-party component (`vue-tournament-bracket`). Ensure it is installed via npm.

- **CORS:**  
  The back-end uses the `cors` middleware to allow cross-origin requests from the front-end during development.

- **Error Handling:**  
  API endpoints return appropriate HTTP status codes and error messages. The front-end uses Element Plus's message components to display errors and success notifications.
