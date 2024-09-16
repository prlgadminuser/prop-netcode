const { WORLD_HEIGHT, WORLD_WIDTH, game_win_rest_time, server_tick_rate } = require('./config');

const { increasePlayerPlace, increasePlayerWins } = require('./dbrequests')
const { endGame } = require('./game')

// Function to check if player is within the zone
//function isWithinZone(room, playerX, playerY) {
//    return playerX >= room.zoneStartX && playerX <= room.zoneEndX &&
//           playerY >= room.zoneStartY && playerY <= room.zoneEndY;
//}


function saveRoomState(room) {
  const stateSnapshot = {
    timestamp: new Date().getTime(),
    players: room.players,
    //walls: JSON.parse(JSON.stringify(room.walls))
  };

  room.snap.push(stateSnapshot);

  // Keep only the last 60 states
  if (room.snap.length > 30) {
    room.snap.shift();
  }
}


function isWithinZone(room, playerX, playerY) {
    return playerX - 40 >= room.zoneStartX && playerX + 40 <= room.zoneEndX &&
           playerY - 60  >= room.zoneStartY && playerY + 60 <= room.zoneEndY;
}
shrinkspeed = 1.7 / 1000
// Function to shrink the game zone
function shrinkZone(room) {
   dealDamage(room);
    if (room.zoneEndX > 2 && room.zoneEndY > 2) {
        
      room.zoneStartX += shrinkspeed * room.mapWidth;
      room.zoneStartY += shrinkspeed * room.mapHeight;
      room.zoneEndX -= shrinkspeed * room.mapWidth;
      room.zoneEndY -= shrinkspeed * room.mapHeight;

        room.zoneStartX = Math.round(room.zoneStartX);
        room.zoneStartY = Math.round(room.zoneStartY);
        room.zoneEndX = Math.round(room.zoneEndX);
        room.zoneEndY = Math.round(room.zoneEndY);

    room.zone = room.zoneStartX + "," + room.zoneStartY
      //  setTimeout(() => {
         //   room.zone = undefined;
         // }, 100);


      //  console.log(room.zoneEndX, room.zoneEndY);
    } else {
        console.log("Zone cannot shrink further.");
        clearInterval(room.shrinkInterval);
         room.zonefulldamage = setInterval(() => dealDamage(room), 250);
    }
}

function dealDamage(room) {
    room.players.forEach((player) => {
         
        if (player.visible !== false && !isWithinZone(room, player.x, player.y)) {

                if (room.winner === 0) {
            player.health -= 5;
            player.last_hit_time = new Date().getTime();
            if (1 > player.health) {
              handleElimination(room, player);
            
          
            }
          }
      }
  });
}
             
         

function pingPlayers(room) {
  // First setTimeout

 
 setTimeout(() => {
    room.players.forEach((player) => {
        if (player.visible !== false) {
            player.lastping = new Date().getTime();
        }
    });
    room.sendping = 1;
}, 200);

  // Second setTimeout
  setTimeout(() => {
      room.sendping = undefined;
  }, 500);

  //pingPlayers(room);
}
   


function UseZone(room) {

  room.zoneStartX -= room.mapWidth / 2
  room.zoneStartY -= room.mapHeight / 2
  room.zoneEndX += room.mapWidth / 2
  room.zoneEndY += room.mapHeight / 2
 
    room.shrinkInterval = setInterval(() => shrinkZone(room), 250);
   /* pingPlayers(room);
 
    room.snapInterval = setInterval(() => {
      saveRoomState(room);
    }, server_tick_rate - 2); 
  room.pinger = setInterval(() => {
      // Ensure sendping is undefined before calling pingPlayers again
      if (room.sendping === undefined) {
          pingPlayers(room);
      }
  }, 1000);

  */

    
};



function handleElimination(room, player) {
     const eliminatedPlayers = [];

       player.visible = false;

          if (
            Array.from(room.players.values()).filter(
              (player) => player.visible !== false,
            ).length === 1 &&
            room.winner === 0
          ) {
            // Only one player remains, the eliminated player gets 2nd place
            player.place = 2;
          } else {
            // More than one player remains, assign place based on remaining players
            player.place = room.players.size - eliminatedPlayers.length;
          }

          const existingPlace = eliminatedPlayers.find(
            (player) => player.place === player.place,
          );


          if (existingPlace) {
            if (player.place === room.maxplayers) {
              player.place--;
            } else {
              player.place++;
            }
          }

          room.eliminatedPlayers.push({
            username: player.playerId,
            place: player.place,
               });

          increasePlayerPlace(player.playerId, player.place);

          player.visible = false;


    if (
      Array.from(room.players.values()).filter(
        (player) => player.visible !== false
      ).length === 0
    ) {
      setTimeout(() => {
        endGame(room);
      }, game_win_rest_time);
    }
        

  if (
    Array.from(room.players.values()).filter(
     (player) => player.visible !== false,
        ).length === 1 &&
        room.winner === 0
          ) {
            const remainingPlayer = Array.from(room.players.values()).find(
              (player) => player.visible !== false,
            );

            room.winner = remainingPlayer.playerId;
            console.log(`Last player standing! ${room.winner} wins!`);

            increasePlayerWins(room.winner, 1);
            increasePlayerPlace(room.winner, 1);

            room.eliminatedPlayers.push({
              username: room.winner,
              place: 1,
            });

            setTimeout(() => {
              endGame(room);
            }, game_win_rest_time);
          }
    }

module.exports = {
    UseZone,
};

