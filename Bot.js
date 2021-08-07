function randomChoice(li) {
    const ind = Math.floor(Math.random() * li.length);
    return li[ind];
}

function smartBotUpdate(){
    this.smartBotIDs.forEach((id) => {
        if (!(id in this.players) ) {
          this.addPlayer(id, id);
        }
        let x = this.players[id].gridX;
        let y = this.players[id].gridY;
        if (id == "Dodger (Bot)") {
          if (this.numNearbyAlive(x, y) === 3) {
            let safeDirections = [];
            if (
              !(this.numNearbyAlive(x - 1, y - 1) in [, , 2, 3]) ||
              (this.isAlive(x - 1, y - 1) == false &&
                this.numNearbyAlive(x - 1, y - 1) != 3)
            ) {
              safeDirections.push("NW");
            }
            if (
              !(this.numNearbyAlive(x, y - 1) in [, , 2, 3]) ||
              (this.isAlive(x, y - 1) == false &&
                this.numNearbyAlive(x, y - 1) != 3)
            ) {
              safeDirections.push("N");
            }
            if (
              !(this.numNearbyAlive(x + 1, y - 1) in [, , 2, 3]) ||
              (this.isAlive(x + 1, y - 1) == false &&
                this.numNearbyAlive(x + 1, y - 1) != 3)
            ) {
              safeDirections.push("NE");
            }
            if (
              !(this.numNearbyAlive(x - 1, y) in [, , 2, 3]) ||
              (this.isAlive(x - 1, y) == false &&
                this.numNearbyAlive(x - 1, y) != 3)
            ) {
              safeDirections.push("W");
            }
            if (
              !(this.numNearbyAlive(x + 1, y) in [, , 2, 3]) ||
              (this.isAlive(x + 1, y) == false &&
                this.numNearbyAlive(x + 1, y) != 3)
            ) {
              safeDirections.push("E");
            }
            if (
              !(this.numNearbyAlive(x - 1, y + 1) in [, , 2, 3]) ||
              (this.isAlive(x - 1, y + 1) == false &&
                this.numNearbyAlive(x - 1, y + 1) != 3)
            ) {
              safeDirections.push("SW");
            }
            if (
              !(this.numNearbyAlive(x, y + 1) in [, , 2, 3]) ||
              (this.isAlive(x, y + 1) == false &&
                this.numNearbyAlive(x, y + 1) != 3)
            ) {
              safeDirections.push("S");
            }
            if (
              !(this.numNearbyAlive(x + 1, y + 1) in [, , 2, 3]) ||
              (this.isAlive(x + 1, y + 1) == false &&
                this.numNearbyAlive(x + 1, y + 1) != 3)
            ) {
              safeDirections.push("SE");
            }
  
            // console.log(safeDirections.length);
  
            let directionToMove = randomChoice(safeDirections);
            if (directionToMove == "N") {
              this.players[id].movingUp = true;
              this.players[id].movingDown = false;
              this.players[id].movingLeft = false;
              this.players[id].movingRight = false;
            } else if (directionToMove == "S") {
              this.players[id].movingUp = false;
              this.players[id].movingDown = true;
              this.players[id].movingLeft = false;
              this.players[id].movingRight = false;
            } else if (directionToMove == "W") {
              this.players[id].movingUp = false;
              this.players[id].movingDown = false;
              this.players[id].movingLeft = true;
              this.players[id].movingRight = false;
            } else if (directionToMove == "E") {
              this.players[id].movingUp = false;
              this.players[id].movingDown = false;
              this.players[id].movingLeft = false;
              this.players[id].movingRight = true;
            } else if (directionToMove == "NW") {
              this.players[id].movingUp = true;
              this.players[id].movingDown = false;
              this.players[id].movingLeft = true;
              this.players[id].movingRight = false;
            } else if (directionToMove == "NE") {
              this.players[id].movingUp = true;
              this.players[id].movingDown = false;
              this.players[id].movingLeft = false;
              this.players[id].movingRight = true;
            } else if (directionToMove == "SW") {
              this.players[id].movingUp = false;
              this.players[id].movingDown = true;
              this.players[id].movingLeft = true;
              this.players[id].movingRight = false;
            } else if (directionToMove == "SE") {
              this.players[id].movingUp = false;
              this.players[id].movingDown = true;
              this.players[id].movingLeft = false;
              this.players[id].movingRight = true;
            }
          } else {
            this.players[id].movingUp = false;
            this.players[id].movingDown = false;
            this.players[id].movingLeft = false;
            this.players[id].movingRight = false;
          }
  
          let someoneOnNW = false;
          let someoneOnNE = false;
          let someoneOnSW = false;
          let someoneOnSE = false;
          Object.keys(this.players).every((id2) => {
            if (id2 != "Dodger (Bot)") {
              let x2 = this.players[id2].gridX;
              let y2 = this.players[id2].gridY;
              if (Math.abs(x2 + this.numColumns - x) < Math.abs(x2 - x)) {
                x2 = x2 + this.numColumns;
              } else if (Math.abs(x2 - this.numColumns - x) < Math.abs(x2 - x)) {
                x2 = x2 - this.numColumns;
              }
              if (Math.abs(y2 + this.numRows - y) < Math.abs(y2 - y)) {
                y2 = y2 + this.numRows;
              } else if (Math.abs(y2 - this.numRows - y) < Math.abs(y2 - y)) {
                y2 = y2 - this.numRows;
              }
              let attackrange = 6;
              if (
                x2 < x &&
                x2 >= x - attackrange &&
                y2 < y &&
                y2 >= y - attackrange
              ) {
                someoneOnNW = true;
                return false;
              } else if (
                x2 > x &&
                x2 <= x + attackrange &&
                y2 < y &&
                y2 >= y - attackrange
              ) {
                someoneOnNE = true;
                return false;
              } else if (
                x2 < x &&
                x2 >= x - attackrange &&
                y2 > y &&
                y2 <= y + attackrange
              ) {
                someoneOnSW = true;
                return false;
              } else if (
                x2 > x &&
                x2 <= x + attackrange &&
                y2 > y &&
                y2 <= y + attackrange
              ) {
                someoneOnSE = true;
                return false;
              }
              return true;
            } else {
              return true;
            }
          });
          if (someoneOnNW) {
            this.players[id].pressedNW = true;
          } else if (someoneOnNE) {
            this.players[id].pressedNE = true;
          } else if (someoneOnSW) {
            this.players[id].pressedSW = true;
          } else if (someoneOnSE) {
            this.players[id].pressedSE = true;
          } else {
            this.players[id].pressedNW = false;
            this.players[id].pressedNE = false;
            this.players[id].pressedSW = false;
            this.players[id].pressedSE = false;
          }
        } else if (id == "Follower (Bot)") {
          let movementDecided = false;
          Object.keys(this.players).every((id2) => {
            if (id2 != "Follower (Bot)") {
              let x2 = this.players[id2].gridX;
              let y2 = this.players[id2].gridY;
              if (Math.abs(x2 + this.numColumns - x) < Math.abs(x2 - x)) {
                x2 = x2 + this.numColumns;
              } else if (Math.abs(x2 - this.numColumns - x) < Math.abs(x2 - x)) {
                x2 = x2 - this.numColumns;
              }
              if (Math.abs(y2 + this.numRows - y) < Math.abs(y2 - y)) {
                y2 = y2 + this.numRows;
              } else if (Math.abs(y2 - this.numRows - y) < Math.abs(y2 - y)) {
                y2 = y2 - this.numRows;
              }
              let nearbyRange = 10;
              if (Math.max(Math.abs(x - x2), Math.abs(y - y2)) <= nearbyRange) {
                if (
                  x2 < x &&
                  y2 < y &&
                  (!(this.numNearbyAlive(x - 1, y - 1) in [, , 2, 3]) ||
                    (this.isAlive(x - 1, y - 1) == false &&
                      this.numNearbyAlive(x - 1, y - 1) != 3))
                ) {
                  this.players[id].movingUp = true;
                  this.players[id].movingDown = false;
                  this.players[id].movingLeft = true;
                  this.players[id].movingRight = false;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 === x &&
                  y2 < y &&
                  (!(this.numNearbyAlive(x, y - 1) in [, , 2, 3]) ||
                    (this.isAlive(x, y - 1) == false &&
                      this.numNearbyAlive(x, y - 1) != 3))
                ) {
                  this.players[id].movingUp = true;
                  this.players[id].movingDown = false;
                  this.players[id].movingLeft = false;
                  this.players[id].movingRight = false;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 > x &&
                  y2 < y &&
                  (!(this.numNearbyAlive(x + 1, y - 1) in [, , 2, 3]) ||
                    (this.isAlive(x + 1, y - 1) == false &&
                      this.numNearbyAlive(x + 1, y - 1) != 3))
                ) {
                  this.players[id].movingUp = true;
                  this.players[id].movingDown = false;
                  this.players[id].movingLeft = false;
                  this.players[id].movingRight = true;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 < x &&
                  y2 === y &&
                  (!(this.numNearbyAlive(x - 1, y) in [, , 2, 3]) ||
                    (this.isAlive(x - 1, y) == false &&
                      this.numNearbyAlive(x - 1, y) != 3))
                ) {
                  this.players[id].movingUp = false;
                  this.players[id].movingDown = false;
                  this.players[id].movingLeft = true;
                  this.players[id].movingRight = false;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 > x &&
                  y2 === y &&
                  (!(this.numNearbyAlive(x + 1, y) in [, , 2, 3]) ||
                    (this.isAlive(x + 1, y) == false &&
                      this.numNearbyAlive(x + 1, y) != 3))
                ) {
                  this.players[id].movingUp = false;
                  this.players[id].movingDown = false;
                  this.players[id].movingLeft = false;
                  this.players[id].movingRight = true;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 < x &&
                  y2 > y &&
                  (!(this.numNearbyAlive(x - 1, y + 1) in [, , 2, 3]) ||
                    (this.isAlive(x - 1, y + 1) == false &&
                      this.numNearbyAlive(x - 1, y + 1) != 3))
                ) {
                  this.players[id].movingUp = false;
                  this.players[id].movingDown = true;
                  this.players[id].movingLeft = true;
                  this.players[id].movingRight = false;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 === x &&
                  y2 > y &&
                  (!(this.numNearbyAlive(x, y + 1) in [, , 2, 3]) ||
                    (this.isAlive(x, y + 1) == false &&
                      this.numNearbyAlive(x, y + 1) != 3))
                ) {
                  this.players[id].movingUp = false;
                  this.players[id].movingDown = true;
                  this.players[id].movingLeft = false;
                  this.players[id].movingRight = false;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 > x &&
                  y2 > y &&
                  (!(this.numNearbyAlive(x + 1, y + 1) in [, , 2, 3]) ||
                    (this.isAlive(x + 1, y + 1) == false &&
                      this.numNearbyAlive(x + 1, y + 1) != 3))
                ) {
                  this.players[id].movingUp = false;
                  this.players[id].movingDown = true;
                  this.players[id].movingLeft = false;
                  this.players[id].movingRight = true;
                  movementDecided = true;
                  return false;
                }
              }
              return true;
            } else {
              return true;
            }
          });
          if (!movementDecided) {
            let safeDirections = [];
            if (
              !(this.numNearbyAlive(x - 1, y - 1) in [, , 2, 3]) ||
              (this.isAlive(x - 1, y - 1) == false &&
                this.numNearbyAlive(x - 1, y - 1) != 3)
            ) {
              safeDirections.push("NW");
            }
            if (
              !(this.numNearbyAlive(x, y - 1) in [, , 2, 3]) ||
              (this.isAlive(x, y - 1) == false &&
                this.numNearbyAlive(x, y - 1) != 3)
            ) {
              safeDirections.push("N");
            }
            if (
              !(this.numNearbyAlive(x + 1, y - 1) in [, , 2, 3]) ||
              (this.isAlive(x + 1, y - 1) == false &&
                this.numNearbyAlive(x + 1, y - 1) != 3)
            ) {
              safeDirections.push("NE");
            }
            if (
              !(this.numNearbyAlive(x - 1, y) in [, , 2, 3]) ||
              (this.isAlive(x - 1, y) == false &&
                this.numNearbyAlive(x - 1, y) != 3)
            ) {
              safeDirections.push("W");
            }
            if (
              !(this.numNearbyAlive(x + 1, y) in [, , 2, 3]) ||
              (this.isAlive(x + 1, y) == false &&
                this.numNearbyAlive(x + 1, y) != 3)
            ) {
              safeDirections.push("E");
            }
            if (
              !(this.numNearbyAlive(x - 1, y + 1) in [, , 2, 3]) ||
              (this.isAlive(x - 1, y + 1) == false &&
                this.numNearbyAlive(x - 1, y + 1) != 3)
            ) {
              safeDirections.push("SW");
            }
            if (
              !(this.numNearbyAlive(x, y + 1) in [, , 2, 3]) ||
              (this.isAlive(x, y + 1) == false &&
                this.numNearbyAlive(x, y + 1) != 3)
            ) {
              safeDirections.push("S");
            }
            if (
              !(this.numNearbyAlive(x + 1, y + 1) in [, , 2, 3]) ||
              (this.isAlive(x + 1, y + 1) == false &&
                this.numNearbyAlive(x + 1, y + 1) != 3)
            ) {
              safeDirections.push("SE");
            }
            if (safeDirections.length > 0) {
              let directionToMove = randomChoice(safeDirections);
              if (directionToMove == "N") {
                this.players[id].movingUp = true;
                this.players[id].movingDown = false;
                this.players[id].movingLeft = false;
                this.players[id].movingRight = false;
              } else if (directionToMove == "S") {
                this.players[id].movingUp = false;
                this.players[id].movingDown = true;
                this.players[id].movingLeft = false;
                this.players[id].movingRight = false;
              } else if (directionToMove == "W") {
                this.players[id].movingUp = false;
                this.players[id].movingDown = false;
                this.players[id].movingLeft = true;
                this.players[id].movingRight = false;
              } else if (directionToMove == "E") {
                this.players[id].movingUp = false;
                this.players[id].movingDown = false;
                this.players[id].movingLeft = false;
                this.players[id].movingRight = true;
              } else if (directionToMove == "NW") {
                this.players[id].movingUp = true;
                this.players[id].movingDown = false;
                this.players[id].movingLeft = true;
                this.players[id].movingRight = false;
              } else if (directionToMove == "NE") {
                this.players[id].movingUp = true;
                this.players[id].movingDown = false;
                this.players[id].movingLeft = false;
                this.players[id].movingRight = true;
              } else if (directionToMove == "SW") {
                this.players[id].movingUp = false;
                this.players[id].movingDown = true;
                this.players[id].movingLeft = true;
                this.players[id].movingRight = false;
              } else if (directionToMove == "SE") {
                this.players[id].movingUp = false;
                this.players[id].movingDown = true;
                this.players[id].movingLeft = false;
                this.players[id].movingRight = true;
              }
            } else {
              this.players[id].movingUp = false;
              this.players[id].movingDown = false;
              this.players[id].movingLeft = false;
              this.players[id].movingRight = false;
            }
          }
        } else if (id == "Hunter (Bot)") {
          let movementDecided = false;
          let noShooting = true;
          Object.keys(this.players).every((id2) => {
            if (id2 != "Hunter (Bot)") {
              let x2 = this.players[id2].gridX;
              let y2 = this.players[id2].gridY;
              if (Math.abs(x2 + this.numColumns - x) < Math.abs(x2 - x)) {
                x2 = x2 + this.numColumns;
              } else if (Math.abs(x2 - this.numColumns - x) < Math.abs(x2 - x)) {
                x2 = x2 - this.numColumns;
              }
              if (Math.abs(y2 + this.numRows - y) < Math.abs(y2 - y)) {
                y2 = y2 + this.numRows;
              } else if (Math.abs(y2 - this.numRows - y) < Math.abs(y2 - y)) {
                y2 = y2 - this.numRows;
              }
              let nearbyRange = 30;
              let attackRange = 6;
              let approachRange = 4;
              if (Math.max(Math.abs(x - x2), Math.abs(y - y2)) <= nearbyRange) {
                if (
                  x2 < x - approachRange &&
                  y2 < y - approachRange &&
                  (!(this.numNearbyAlive(x - 1, y - 1) in [, , 2, 3]) ||
                    (this.isAlive(x - 1, y - 1) == false &&
                      this.numNearbyAlive(x - 1, y - 1) != 3))
                ) {
                  this.players[id].movingUp = true;
                  this.players[id].movingDown = false;
                  this.players[id].movingLeft = true;
                  this.players[id].movingRight = false;
                  movementDecided = true;
                  if (
                    Math.max(Math.abs(x - x2), Math.abs(y - y2)) <= attackRange
                  ) {
                    this.players[id].pressedNW = true;
                    this.players[id].pressedNE = false;
                    this.players[id].pressedSW = false;
                    this.players[id].pressedSE = false;
                    noShooting = false;
                  }
                  return false;
                } else if (
                  x2 >= x - approachRange &&
                  x2 <= x + approachRange &&
                  y2 < y - approachRange &&
                  (!(this.numNearbyAlive(x, y - 1) in [, , 2, 3]) ||
                    (this.isAlive(x, y - 1) == false &&
                      this.numNearbyAlive(x, y - 1) != 3))
                ) {
                  this.players[id].movingUp = true;
                  this.players[id].movingDown = false;
                  this.players[id].movingLeft = false;
                  this.players[id].movingRight = false;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 > x + approachRange &&
                  y2 < y - approachRange &&
                  (!(this.numNearbyAlive(x + 1, y - 1) in [, , 2, 3]) ||
                    (this.isAlive(x + 1, y - 1) == false &&
                      this.numNearbyAlive(x + 1, y - 1) != 3))
                ) {
                  this.players[id].movingUp = true;
                  this.players[id].movingDown = false;
                  this.players[id].movingLeft = false;
                  this.players[id].movingRight = true;
                  movementDecided = true;
                  if (
                    Math.max(Math.abs(x - x2), Math.abs(y - y2)) <= attackRange
                  ) {
                    this.players[id].pressedNW = false;
                    this.players[id].pressedNE = true;
                    this.players[id].pressedSW = false;
                    this.players[id].pressedSE = false;
                    noShooting = false;
                  }
                  return false;
                } else if (
                  x2 < x - approachRange &&
                  y2 >= y - approachRange &&
                  y2 <= y + approachRange &&
                  (!(this.numNearbyAlive(x - 1, y) in [, , 2, 3]) ||
                    (this.isAlive(x - 1, y) == false &&
                      this.numNearbyAlive(x - 1, y) != 3))
                ) {
                  this.players[id].movingUp = false;
                  this.players[id].movingDown = false;
                  this.players[id].movingLeft = true;
                  this.players[id].movingRight = false;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 > x + approachRange &&
                  y2 >= y - approachRange &&
                  y2 <= y + approachRange &&
                  (!(this.numNearbyAlive(x + 1, y) in [, , 2, 3]) ||
                    (this.isAlive(x + 1, y) == false &&
                      this.numNearbyAlive(x + 1, y) != 3))
                ) {
                  this.players[id].movingUp = false;
                  this.players[id].movingDown = false;
                  this.players[id].movingLeft = false;
                  this.players[id].movingRight = true;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 < x - approachRange &&
                  y2 > y + approachRange &&
                  (!(this.numNearbyAlive(x - 1, y + 1) in [, , 2, 3]) ||
                    (this.isAlive(x - 1, y + 1) == false &&
                      this.numNearbyAlive(x - 1, y + 1) != 3))
                ) {
                  this.players[id].movingUp = false;
                  this.players[id].movingDown = true;
                  this.players[id].movingLeft = true;
                  this.players[id].movingRight = false;
                  movementDecided = true;
                  if (
                    Math.max(Math.abs(x - x2), Math.abs(y - y2)) <= attackRange
                  ) {
                    this.players[id].pressedNW = false;
                    this.players[id].pressedNE = false;
                    this.players[id].pressedSW = true;
                    this.players[id].pressedSE = false;
                    noShooting = false;
                  }
                  return false;
                } else if (
                  x2 >= x - approachRange &&
                  x2 <= x + approachRange &&
                  y2 > y + approachRange &&
                  (!(this.numNearbyAlive(x, y + 1) in [, , 2, 3]) ||
                    (this.isAlive(x, y + 1) == false &&
                      this.numNearbyAlive(x, y + 1) != 3))
                ) {
                  this.players[id].movingUp = false;
                  this.players[id].movingDown = true;
                  this.players[id].movingLeft = false;
                  this.players[id].movingRight = false;
                  movementDecided = true;
                  return false;
                } else if (
                  x2 > x + approachRange &&
                  y2 > y + approachRange &&
                  (!(this.numNearbyAlive(x + 1, y + 1) in [, , 2, 3]) ||
                    (this.isAlive(x + 1, y + 1) == false &&
                      this.numNearbyAlive(x + 1, y + 1) != 3))
                ) {
                  this.players[id].movingUp = false;
                  this.players[id].movingDown = true;
                  this.players[id].movingLeft = false;
                  this.players[id].movingRight = true;
                  movementDecided = true;
                  if (
                    Math.max(Math.abs(x - x2), Math.abs(y - y2)) <= attackRange
                  ) {
                    this.players[id].pressedNW = false;
                    this.players[id].pressedNE = false;
                    this.players[id].pressedSW = false;
                    this.players[id].pressedSE = true;
                    noShooting = false;
                  }
                  return false;
                } else if (
                  x2 > x - approachRange &&
                  x2 < x + approachRange &&
                  y2 > y - approachRange &&
                  y2 < y + approachRange
                ) {
                  if (x2 < x && y2 <= y) {
                    this.players[id].pressedNW = true;
                    this.players[id].pressedNE = false;
                    this.players[id].pressedSW = false;
                    this.players[id].pressedSE = false;
                    noShooting = false;
                    if (
                      !(this.numNearbyAlive(x + 1, y + 1) in [, , 2, 3]) ||
                      (this.isAlive(x + 1, y + 1) == false &&
                        this.numNearbyAlive(x + 1, y + 1) != 3)
                    ) {
                      this.players[id].movingUp = false;
                      this.players[id].movingDown = true;
                      this.players[id].movingLeft = false;
                      this.players[id].movingRight = true;
                      movementDecided = true;
                    }
                  } else if (x2 >= x && y2 < y) {
                    this.players[id].pressedNW = false;
                    this.players[id].pressedNE = true;
                    this.players[id].pressedSW = false;
                    this.players[id].pressedSE = false;
                    noShooting = false;
                    if (
                      !(this.numNearbyAlive(x - 1, y + 1) in [, , 2, 3]) ||
                      (this.isAlive(x - 1, y + 1) == false &&
                        this.numNearbyAlive(x - 1, y + 1) != 3)
                    ) {
                      this.players[id].movingUp = false;
                      this.players[id].movingDown = true;
                      this.players[id].movingLeft = true;
                      this.players[id].movingRight = false;
                      movementDecided = true;
                    }
                  } else if (x2 <= x && y2 > y) {
                    this.players[id].pressedNW = false;
                    this.players[id].pressedNE = false;
                    this.players[id].pressedSW = true;
                    this.players[id].pressedSE = false;
                    noShooting = false;
                    if (
                      !(this.numNearbyAlive(x + 1, y - 1) in [, , 2, 3]) ||
                      (this.isAlive(x + 1, y - 1) == false &&
                        this.numNearbyAlive(x + 1, y - 1) != 3)
                    ) {
                      this.players[id].movingUp = true;
                      this.players[id].movingDown = false;
                      this.players[id].movingLeft = false;
                      this.players[id].movingRight = true;
                      movementDecided = true;
                    }
                  } else if (x2 > x && y2 >= y) {
                    this.players[id].pressedNW = false;
                    this.players[id].pressedNE = false;
                    this.players[id].pressedSW = false;
                    this.players[id].pressedSE = true;
                    noShooting = false;
                    if (
                      !(this.numNearbyAlive(x - 1, y - 1) in [, , 2, 3]) ||
                      (this.isAlive(x - 1, y - 1) == false &&
                        this.numNearbyAlive(x - 1, y - 1) != 3)
                    ) {
                      this.players[id].movingUp = true;
                      this.players[id].movingDown = false;
                      this.players[id].movingLeft = true;
                      this.players[id].movingRight = false;
                      movementDecided = true;
                    }
                  }
                  return false;
                }
              }
              return true;
            } else {
              return true;
            }
          });
          if (!movementDecided) {
            let safeDirections = [];
            if (
              !(this.numNearbyAlive(x - 1, y - 1) in [, , 2, 3]) ||
              (this.isAlive(x - 1, y - 1) == false &&
                this.numNearbyAlive(x - 1, y - 1) != 3)
            ) {
              safeDirections.push("NW");
            }
            if (
              !(this.numNearbyAlive(x, y - 1) in [, , 2, 3]) ||
              (this.isAlive(x, y - 1) == false &&
                this.numNearbyAlive(x, y - 1) != 3)
            ) {
              safeDirections.push("N");
            }
            if (
              !(this.numNearbyAlive(x + 1, y - 1) in [, , 2, 3]) ||
              (this.isAlive(x + 1, y - 1) == false &&
                this.numNearbyAlive(x + 1, y - 1) != 3)
            ) {
              safeDirections.push("NE");
            }
            if (
              !(this.numNearbyAlive(x - 1, y) in [, , 2, 3]) ||
              (this.isAlive(x - 1, y) == false &&
                this.numNearbyAlive(x - 1, y) != 3)
            ) {
              safeDirections.push("W");
            }
            if (
              !(this.numNearbyAlive(x + 1, y) in [, , 2, 3]) ||
              (this.isAlive(x + 1, y) == false &&
                this.numNearbyAlive(x + 1, y) != 3)
            ) {
              safeDirections.push("E");
            }
            if (
              !(this.numNearbyAlive(x - 1, y + 1) in [, , 2, 3]) ||
              (this.isAlive(x - 1, y + 1) == false &&
                this.numNearbyAlive(x - 1, y + 1) != 3)
            ) {
              safeDirections.push("SW");
            }
            if (
              !(this.numNearbyAlive(x, y + 1) in [, , 2, 3]) ||
              (this.isAlive(x, y + 1) == false &&
                this.numNearbyAlive(x, y + 1) != 3)
            ) {
              safeDirections.push("S");
            }
            if (
              !(this.numNearbyAlive(x + 1, y + 1) in [, , 2, 3]) ||
              (this.isAlive(x + 1, y + 1) == false &&
                this.numNearbyAlive(x + 1, y + 1) != 3)
            ) {
              safeDirections.push("SE");
            }
            if (safeDirections.length > 0) {
              let directionToMove = randomChoice(safeDirections);
              if (directionToMove == "N") {
                this.players[id].movingUp = true;
                this.players[id].movingDown = false;
                this.players[id].movingLeft = false;
                this.players[id].movingRight = false;
              } else if (directionToMove == "S") {
                this.players[id].movingUp = false;
                this.players[id].movingDown = true;
                this.players[id].movingLeft = false;
                this.players[id].movingRight = false;
              } else if (directionToMove == "W") {
                this.players[id].movingUp = false;
                this.players[id].movingDown = false;
                this.players[id].movingLeft = true;
                this.players[id].movingRight = false;
              } else if (directionToMove == "E") {
                this.players[id].movingUp = false;
                this.players[id].movingDown = false;
                this.players[id].movingLeft = false;
                this.players[id].movingRight = true;
              } else if (directionToMove == "NW") {
                this.players[id].movingUp = true;
                this.players[id].movingDown = false;
                this.players[id].movingLeft = true;
                this.players[id].movingRight = false;
              } else if (directionToMove == "NE") {
                this.players[id].movingUp = true;
                this.players[id].movingDown = false;
                this.players[id].movingLeft = false;
                this.players[id].movingRight = true;
              } else if (directionToMove == "SW") {
                this.players[id].movingUp = false;
                this.players[id].movingDown = true;
                this.players[id].movingLeft = true;
                this.players[id].movingRight = false;
              } else if (directionToMove == "SE") {
                this.players[id].movingUp = false;
                this.players[id].movingDown = true;
                this.players[id].movingLeft = false;
                this.players[id].movingRight = true;
              }
            } else {
              this.players[id].movingUp = false;
              this.players[id].movingDown = false;
              this.players[id].movingLeft = false;
              this.players[id].movingRight = false;
            }
            if (noShooting) {
              this.players[id].pressedNW = false;
              this.players[id].pressedNE = false;
              this.players[id].pressedSW = false;
              this.players[id].pressedSE = false;
            }
          }
        }
      });
}

module.exports = {
    smartBotUpdate:smartBotUpdate,
  };