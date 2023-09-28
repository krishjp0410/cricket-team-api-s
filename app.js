const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

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
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertToDbObjectToResponseObject = (dbObject) => {
    return {
        playerId = dbObject.player_id,
        playerName = dbObject.player_name,
        jerseyNumber = dbObject.jersey_number,
        role = dbObject.role
    };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELEcT 
      * 
    FROM 
      cricket_team 
    ORDER BY 
      player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
      playersArray.map((eachPlayer) => {
         convertToDbObjectToResponseObject(eachPlayer); 
      });
  );
});

app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const postPlayerQuery = `
    INSERT INTO 
      cricket_team (player_name, jersey_number, role)
    VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  const newPlayer = await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      *
    FROM 
      cricket_team 
    WHERE 
      player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertToDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
    UPDATE 
      cricket_team
    SET 
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
    WHERE 
      player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM 
      cricket_team
    WHERE 
      player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
