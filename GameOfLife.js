"use strict";

function mod(n, m) {
  return ((n % m) + m) % m;
}

class Cell {
  static width = 10;
  static height = 10;

  constructor(gridX, gridY) {
    // Store the position of this cell in the grid
    this.gridX = gridX;
    this.gridY = gridY;


    this.alive = (Math.random() > 0.5);
    this.initiallyAlive=false;
  }
}

class Player {
  static width = 10;
  static height = 10;
  static gliderCoolTime = 16; // number of generations
  constructor(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.alive = true;
    this.movingUp = false;
    this.movingDown = false;
    this.movingRight = false;
    this.movingLeft = false;
    this.pressedIYHK = false;
    this.pressedNE = false;
    this.pressedNW = false;
    this.pressedSW = false;
    this.pressedSE = false;
    this.shootNE = false; // keeps track of whether the button for shooting a glider is pressed
    this.shootNW = false;
    this.shootSW = false;
    this.shootSE = false;
    this.gliderCoolTimeLeft = 0;
  }
}


class Game {
    static numColumns = 150;
    static numRows = 70;
    constructor(io) {
      this._io = io;
      this.sockets = {};
      this.players = {};
      this.lastUpdateTime = Date.now();
      this.shouldSendUpdate = false;
  
      this.gameObjects = []; // array of Cells
      this.createGrid();
      this.gamePlayer = new Player(
        Math.floor(Game.numColumns / 2),
        Math.floor(Game.numRows / 2)
      );
      setInterval(this.update.bind(this), 1000 / 15);
    }
  
    update () {
      // io.emit('chat message', "This is a useless message :)");
      this.checkSurrounding();
      this.playerMovement();
      this.gliderUpdate();
      this.updateCoolTime();
      this.checkPlayerIsAlive();
      if(this._io!=undefined){
        this._io.emit('draw', this.gameObjects, this.gamePlayer);
      }
      else{
        draw(this.gameObjects, this.gamePlayer);
      }
    }

    createGrid() {
      for (let y = 0; y < Game.numRows; y++) {
        for (let x = 0; x < Game.numColumns; x++) {
          this.gameObjects.push(new Cell(x, y));
        }
      }
    }
  
    isAlive(x, y) {
      return this.gameObjects[
        this.gridToIndex(mod(x, Game.numColumns), mod(y, Game.numRows))
      ].alive
        ? 1
        : 0;
    }
  
    gridToIndex(x, y) {
      return x + y * Game.numColumns;
    }
  
    checkSurrounding() {
      // Loop over all cells
      for (let x = 0; x < Game.numColumns; x++) {
        for (let y = 0; y < Game.numRows; y++) {
          // Count the nearby population
          let numAlive =
            this.isAlive(x - 1, y - 1) +
            this.isAlive(x, y - 1) +
            this.isAlive(x + 1, y - 1) +
            this.isAlive(x - 1, y) +
            this.isAlive(x + 1, y) +
            this.isAlive(x - 1, y + 1) +
            this.isAlive(x, y + 1) +
            this.isAlive(x + 1, y + 1);
          let centerIndex = this.gridToIndex(x, y);
  
          if (numAlive == 2) {
            // Do nothing
            this.gameObjects[centerIndex].nextAlive =
              this.gameObjects[centerIndex].alive;
          } else if (numAlive == 3) {
            // Make alive
            this.gameObjects[centerIndex].nextAlive = true;
          } else {
            // Make dead
            this.gameObjects[centerIndex].nextAlive = false;
          }
        }
      }
  
      // Apply the new state to the cells
      for (let i = 0; i < this.gameObjects.length; i++) {
        this.gameObjects[i].alive = this.gameObjects[i].nextAlive;
      }
    }

    keyPressed(eventcode) {
        switch (eventcode) {
          case "KeyS":
          case "ArrowDown":
            this.gamePlayer.movingDown = true;
            break;
          case "KeyW":
          case "ArrowUp":
            this.gamePlayer.movingUp = true;
            break;
          case "KeyA":
          case "ArrowLeft":
            this.gamePlayer.movingLeft = true;
            break;
          case "KeyD":
          case "ArrowRight":
            this.gamePlayer.movingRight = true;
            break;
          case "KeyI":
          case "KeyO":
            if (!this.gamePlayer.pressedIYHK) {
              this.gamePlayer.pressedNE = true;
              this.gamePlayer.pressedIYHK = true;
            }
            break;
          case "KeyY":
          case "KeyU":
            if (!this.gamePlayer.pressedIYHK) {
              this.gamePlayer.pressedNW = true;
              this.gamePlayer.pressedIYHK = true;
            }
            break;
          case "KeyH":
          case "KeyJ":
            if (!this.gamePlayer.pressedIYHK) {
              this.gamePlayer.pressedSW = true;
              this.gamePlayer.pressedIYHK = true;
            }
            break;
          case "KeyK":
          case "KeyL":
            if (!this.gamePlayer.pressedIYHK) {
              this.gamePlayer.pressedSE = true;
              this.gamePlayer.pressedIYHK = true;
            }
            break;
        }
        // Consume the event so it doesn't get handled twice
        
      }
      keyUnpressed(eventcode) {
        switch (eventcode) {
          case "KeyS":
          case "ArrowDown":
            this.gamePlayer.movingDown = false;
            break;
          case "KeyW":
          case "ArrowUp":
            this.gamePlayer.movingUp = false;
            break;
          case "KeyA":
          case "ArrowLeft":
            this.gamePlayer.movingLeft = false;
            break;
          case "KeyD":
          case "ArrowRight":
            this.gamePlayer.movingRight = false;
            break;
          case "KeyI":
          case "KeyO":
              if (this.gamePlayer.pressedNE) {
              this.gamePlayer.pressedNE = false;
              this.gamePlayer.pressedIYHK = false;
            }
            break;
          case "KeyY":
          case "KeyU":
            if (this.gamePlayer.pressedNW) {
              this.gamePlayer.pressedNW = false;
              this.gamePlayer.pressedIYHK = false;
            }
            break;
          case "KeyH":
          case "KeyJ":
            if (this.gamePlayer.pressedSW) {
              this.gamePlayer.pressedSW = false;
              this.gamePlayer.pressedIYHK = false;
            }
            break;
          case "KeyK":
          case "KeyL":
            if (this.gamePlayer.pressedSE) {
              this.gamePlayer.pressedSE = false;
              this.gamePlayer.pressedIYHK = false;
            }
            break;
        }
      }
    
      playerMovement() {
        if (!this.gamePlayer.alive) {
          return;
        }
        if (this.gamePlayer.movingDown) {
          this.gamePlayer.gridY = mod(this.gamePlayer.gridY + 1, Game.numRows);
        }
        if (this.gamePlayer.movingUp) {
          this.gamePlayer.gridY = mod(this.gamePlayer.gridY - 1, Game.numRows);
        }
        if (this.gamePlayer.movingLeft) {
          this.gamePlayer.gridX = mod(
            this.gamePlayer.gridX - 1,
            Game.numColumns
          );
        }
        if (this.gamePlayer.movingRight) {
          this.gamePlayer.gridX = mod(
            this.gamePlayer.gridX + 1,
            Game.numColumns
          );
        }
      }

      checkPlayerIsAlive() {
        // if (
        //   this.gamePlayer.alive &&
        //   this.isAlive(this.gamePlayer.gridX, this.gamePlayer.gridY) === 1
        // ) {
        //   this.gamePlayer.alive = false;
        //   if (confirm(`You're dead! Restart?`)) {
        //     this.reset();
        //   }
        // }
      }
      
      shootAGlider() {
        if (this.gamePlayer.gliderCoolTimeLeft === 0) {
          if (this.gamePlayer.pressedNE) {
            this.gamePlayer.shootNE = true;
            this.gamePlayer.gliderCoolTimeLeft = Player.gliderCoolTime;
            return;
          } else if (this.gamePlayer.pressedNW) {
            this.gamePlayer.shootNW = true;
            this.gamePlayer.gliderCoolTimeLeft = Player.gliderCoolTime;
          } else if (this.gamePlayer.pressedSW) {
            this.gamePlayer.shootSW = true;
            this.gamePlayer.gliderCoolTimeLeft = Player.gliderCoolTime;
          } else if (this.gamePlayer.pressedSE) {
            this.gamePlayer.shootSE = true;
            this.gamePlayer.gliderCoolTimeLeft = Player.gliderCoolTime;
          }
        }
      }

      gliderUpdate() {
        if (!this.gamePlayer.alive) {
          return;
        }
        this.shootAGlider();
        if (this.gamePlayer.shootNE) {
          this.gamePlayer.shootNE = false;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX + 1, Game.numColumns),
              mod(this.gamePlayer.gridY - 2, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX + 2, Game.numColumns),
              mod(this.gamePlayer.gridY - 3, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX + 3, Game.numColumns),
              mod(this.gamePlayer.gridY - 1, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX + 3, Game.numColumns),
              mod(this.gamePlayer.gridY - 2, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX + 3, Game.numColumns),
              mod(this.gamePlayer.gridY - 3, Game.numRows)
            )
          ].alive = true;
        } else if (this.gamePlayer.shootNW) {
          this.gamePlayer.shootNW = false;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX - 1, Game.numColumns),
              mod(this.gamePlayer.gridY - 3, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX - 2, Game.numColumns),
              mod(this.gamePlayer.gridY - 1, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX - 2, Game.numColumns),
              mod(this.gamePlayer.gridY - 3, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX - 3, Game.numColumns),
              mod(this.gamePlayer.gridY - 2, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX - 3, Game.numColumns),
              mod(this.gamePlayer.gridY - 3, Game.numRows)
            )
          ].alive = true;
        } else if (this.gamePlayer.shootSW) {
          this.gamePlayer.shootSW = false;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX - 1, Game.numColumns),
              mod(this.gamePlayer.gridY + 2, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX - 2, Game.numColumns),
              mod(this.gamePlayer.gridY + 3, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX - 3, Game.numColumns),
              mod(this.gamePlayer.gridY + 1, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX - 3, Game.numColumns),
              mod(this.gamePlayer.gridY + 2, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX - 3, Game.numColumns),
              mod(this.gamePlayer.gridY + 3, Game.numRows)
            )
          ].alive = true;
        } else if (this.gamePlayer.shootSE) {
          this.gamePlayer.shootSE = false;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX + 1, Game.numColumns),
              mod(this.gamePlayer.gridY + 3, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX + 2, Game.numColumns),
              mod(this.gamePlayer.gridY + 1, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX + 2, Game.numColumns),
              mod(this.gamePlayer.gridY + 3, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX + 3, Game.numColumns),
              mod(this.gamePlayer.gridY + 2, Game.numRows)
            )
          ].alive = true;
          this.gameObjects[
            this.gridToIndex(
              mod(this.gamePlayer.gridX + 3, Game.numColumns),
              mod(this.gamePlayer.gridY + 3, Game.numRows)
            )
          ].alive = true;
        }
      }
      updateCoolTime() {
        this.gamePlayer.gliderCoolTimeLeft = Math.max(
          0,
          this.gamePlayer.gliderCoolTimeLeft - 1
        );
      }
  }

module.exports = Game;