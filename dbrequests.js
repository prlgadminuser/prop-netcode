const { axios, userCollection, battlePassCollection, jwt } = require('./index');

const tokenkey = "d8ce40604d359eeb9f2bff31beca4b4b"

async function verifyPlayer(token) {
  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(token, tokenkey);
    const username = decodedToken.username;

    if (!username) {
      throw new Error("Invalid token");
    }

    const userInformation = await userCollection.findOne(
      { username },
      {
        projection: {
          equipped_item: 1,
          equipped_item2: 1,
          equipped_color: 1,
          equipped_hat_color: 1,
          equipped_body_color: 1,
        },
      }
    );

    if (!userInformation) {
      throw new Error("User not found");
    }

    const {
      equipped_item,
      equipped_item2,
      equipped_color,
      equipped_hat_color,
      equipped_body_color,
    } = userInformation;

    return {
      playerId: username,
      hat: equipped_item,
      top: equipped_item2,
      player_color: equipped_color,
      hat_color: equipped_hat_color,
      top_color: equipped_body_color,
    };
  } catch (error) {
    console.error("Error verifying player:", error);
    throw new Error("Internal Server Error");
  }
}

async function increasePlayerDamage(playerId, damage) {
  const username = playerId;
  const damagecount = +damage; 
  
    // Check if damagecount is a valid number
    if (isNaN(damagecount)) {
      return res.status(400).json({ error: "Invalid damage count provided" });
    }
  
    try {
      // Try to increment damage, ignore upsert if the user doesn't exist
      const incrementResult = await userCollection.updateOne(
        { username },
        {
          $inc: { damage: damagecount },
        }
      );
  
  
          await battlePassCollection.updateOne(
        { username },
        {
          $inc: {
            bonusitem_damage: damagecount,
          },
        },
        {
          upsert: true,
        },
      );
  
  
      // If the user doesn't exist, perform an upsert to create the document with the specified damage
      if (incrementResult.matchedCount === 0) {
        const upsertResult = await userCollection.updateOne(
          { username },
          {
            $setOnInsert: {
              damage: damagecount,
            },
          },
          { upsert: true }
        );
  
        if (upsertResult.matchedCount === 0 && upsertResult.upsertedCount === 0) {
          return res.status(404).json({ error: "User not found" });
        }
      }
  
  } catch (error) {
    console.error("Error updating damage in the database:", error);
  }
}

async function increasePlayerKills(playerId, kills) {
  const username = playerId;
  const killcount = +kills; // Convert to a number using the unary plus operator

  // Check if damagecount is a valid number
  if (isNaN(killcount)) {
    return res.status(400).json({ error: "Invalid damage count provided" });
  }

  try {
    // Try to increment damage, ignore upsert if the user doesn't exist
    const incrementResult = await userCollection.updateOne(
      { username },
      {
        $inc: { kills: killcount },
      }
    );

    // If the user doesn't exist, perform an upsert to create the document with the specified damage
    if (incrementResult.matchedCount === 0) {
      const upsertResult = await userCollection.updateOne(
        { username },
        {
          $setOnInsert: {
            kills: killcount,
          },
        },
        { upsert: true }
      );

      if (upsertResult.matchedCount === 0 && upsertResult.upsertedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
    }
  } catch (error) {
    console.error("Error updating damage in the database:", error);
  }
}

async function increasePlayerWins(playerId, wins2) {
  const username = playerId;
  const wins = +wins2; // Convert to a number using the unary plus operator

  // Check if damagecount is a valid number
  if (isNaN(wins)) {
    return res.status(400).json({ error: "Invalid damage count provided" });
  }

  try {
    // Try to increment damage, ignore upsert if the user doesn't exist
    const incrementResult = await userCollection.updateOne(
      { username },
      {
        $inc: { wins: wins },
      }
    );

    // If the user doesn't exist, perform an upsert to create the document with the specified damage
    if (incrementResult.matchedCount === 0) {
      const upsertResult = await userCollection.updateOne(
        { username },
        {
          $setOnInsert: {
            wins: wins,
          },
        },
        { upsert: true }
      );

      if (upsertResult.matchedCount === 0 && upsertResult.upsertedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
    }
  } catch (error) {
    console.error("Error updating damage in the database:", error);
  }
}

async function increasePlayerPlace(playerId, place2) {
  const username = playerId;
  const place = +place2; // Convert to a number using the unary plus operator

  // Check if place is a valid number
  if (isNaN(place) || place < 1 || place > 5) {
    return res.status(400).json({ error: "Invalid place provided. Place should be a number between 1 and 5." });
  }
  
  const place_counts = [16, 7, 1, -2, -4];
  const ss_counts = [25, 17, 12, 10, 7];

  try {
    const skillpoints = place_counts[place - 1];
    const season_coins = ss_counts[place - 1];
    
    // Update skill points, ensuring it doesn't drop below 0
    const updateResult = await userCollection.updateOne(
      { username },
      [
        {
          $set: {
            sp: {
              $add: [
                { $ifNull: ["$sp", 0] }, // If sp doesn't exist, default to 0
                skillpoints // Add the skill points adjustment directly
              ]
            }
          }
        },
        {
          $set: {
            sp: {
              $max: [ "$sp", 0 ] // Ensure sp doesn't drop below 0
            }
          }
        }
      ]
    );

    await battlePassCollection.updateOne(
      { username },
      {
        $inc: {
          season_coins: season_coins,
        },
      },
      {
        upsert: true,
      },
    );

    // Check if the user exists
    if (updateResult.matchedCount === 0 && updateResult.modifiedCount === 0) {
      // If not, perform an upsert to create the document with the specified skill points
      const upsertResult = await userCollection.updateOne(
        { username },
        {
          $setOnInsert: {
            sp: { $max: [ skillpoints, 0 ] } // Ensure sp doesn't drop below 0
          },
        },
        { upsert: true }
      );

      if (upsertResult.matchedCount === 0 && upsertResult.upsertedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
    }
  } catch (error) {
    console.error("Error updating damage in the database:", error);
  }
}


module.exports = {
  increasePlayerDamage,
  increasePlayerKills,
  increasePlayerPlace,
  increasePlayerWins,
  verifyPlayer,

};