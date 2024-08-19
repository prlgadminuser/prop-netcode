"use strict";

const wallblocksize = 50


function isCollisionWithWalls(walls, x, y) {
  const halfBlockSize = wallblocksize / 2;
  
  for (const wall of walls) {
      const wallLeft = wall.x - halfBlockSize;
      const wallRight = wall.x + halfBlockSize;
      const wallTop = wall.y - halfBlockSize;
      const wallBottom = wall.y + halfBlockSize;

      if (
      x + 20 > wallLeft &&
      x - 20 < wallRight &&
      y + 45 > wallTop &&
      y - 45 < wallBottom
      ) {
          return true;  // Collision detected
      }
  }

  return false;  // No collision detected
}

function isCollisionWithBullet(walls, x, y, height, width) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  // Iterate through each wall
  for (const wall of walls) {
    // Determine the boundaries of the wall
    const wallLeft = wall.x - wallblocksize / 2;
    const wallRight = wall.x + wallblocksize / 2;
    const wallTop = wall.y - wallblocksize / 2;
    const wallBottom = wall.y + wallblocksize / 2;

    // Check if the bullet's bounding box intersects with the wall's bounding box
    if (
      x - halfWidth < wallRight &&
      x + halfWidth > wallLeft &&
      y - halfHeight < wallBottom &&
      y + halfHeight > wallTop
    ) {
      return true; // Collision detected
    }
  }

  return false; // No collision detected
}

function adjustBulletDirection(bullet, wall, wallBlockSize) {
  const halfBlockSize = wallBlockSize / 2;

  // Calculate the differences between the bullet's position and the wall's center
  const deltaX = bullet.x - wall.x;
  const deltaY = bullet.y - wall.y;

  let normalAngle;

  // Determine which side of the wall the bullet is hitting
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // The bullet is closer to the left or right of the wall
    if (deltaX < -halfBlockSize) {
      normalAngle = 180; // Left side
    } else if (deltaX > halfBlockSize) {
      normalAngle = 0;   // Right side
    }
  } else {
    // The bullet is closer to the top or bottom of the wall
    if (deltaY < -halfBlockSize) {
      normalAngle = 90;  // Top side
    } else if (deltaY > halfBlockSize) {
      normalAngle = 270; // Bottom side
    }
  }

  // Calculate the reflection angle based on the incoming angle and the wall's normal angle
  const incomingAngle = bullet.direction * (Math.PI / 180);
  const normalAngleRadians = normalAngle * (Math.PI / 180);
  const reflectionAngle = 2 * normalAngleRadians - incomingAngle;
  const reflectionAngleDegrees = (reflectionAngle * 180) / Math.PI;
  bullet.direction = Math.round(reflectionAngleDegrees % 360);

}




module.exports = {
  isCollisionWithWalls,
  isCollisionWithBullet,
  wallblocksize,
  adjustBulletDirection,
};
