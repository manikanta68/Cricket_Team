const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1
app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(playersQuery);
  const ans = (playersList) => {
    return {
      playerId: playersList.player_id,
      playerName: playersList.player_name,
      jerseyNumber: playersList.jersey_number,
      role: playersList.role,
    };
  };
  response.send(playersArray.map((eachPlayer) => ans(eachPlayer)));
});

//API 2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  const ans = (playersList) => {
    return {
      playerId: playersList.player_id,
      playerName: playersList.player_name,
      jerseyNumber: playersList.jersey_number,
      role: playersList.role,
    };
  };
  response.send(ans(player));
});

//API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const updatePlayerQuery = `UPDATE cricket_team SET player_name='${playerName}' 
  jersey_number=${jerseyNumber} role:'${role}' WHERE player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
