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

    this.alive = false;
    this.initiallyAlive=false;
   }
}

class Player {
  static width = 10;
  static height = 10;
  static gliderCoolTime = 16; // number of generations
  constructor(context, gridX, gridY) {
    this.context = context;
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

class GameWorld {
  static numColumns = 150;
  static numRows = 75;

  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.gameObjects = []; // array of Cells
    this.initialShape = listOfShapes[Math.floor(Math.random() * listOfShapes.length)];
    console.log(this.initialShape);
    this.initialCells = cellsAtPosition(
      10,
      10,
      shapeToCells(this.initialShape)
    ); // initialize the pattern; use data from the library

    this.createGrid();
    this.gamePlayer = new Player(
      this.context,
      Math.floor(GameWorld.numColumns / 2),
      Math.floor(GameWorld.numRows / 2)
    );

    // Request an animation frame for the first time
    // The gameLoop() function will be called as a callback of this request
    window.requestAnimationFrame(() => this.gameLoop());
    window.addEventListener("keydown", (e) => this.keyPressed(e));
    window.addEventListener("keyup", (e) => this.keyUnpressed(e));
  }

  createGrid() {
    function isAnInitialCell(x, y, initialCells) {
      for (let i = 0; i < initialCells.length; i++) {
        if (
          mod(initialCells[i][0], GameWorld.numColumns) === x &&
          mod(initialCells[i][1], GameWorld.numRows) === y
        ) {
          return true;
        }
      }
      return false;
    }
    for (let y = 0; y < GameWorld.numRows; y++) {
      for (let x = 0; x < GameWorld.numColumns; x++) {
        this.gameObjects.push(new Cell(x, y));
        this.gameObjects[this.gridToIndex(x, y)].initiallyAlive =
          isAnInitialCell(x, y, this.initialCells);
        this.gameObjects[this.gridToIndex(x, y)].alive =
          this.gameObjects[this.gridToIndex(x, y)].initiallyAlive;
      }
    }
  }

  isAlive(x, y) {
    // if (x < 0 || x >= GameWorld.numColumns || y < 0 || y >= GameWorld.numRows) {
    //     return false;
    // }

    return this.gameObjects[
      this.gridToIndex(mod(x, GameWorld.numColumns), mod(y, GameWorld.numRows))
    ].alive
      ? 1
      : 0;
  }

  gridToIndex(x, y) {
    return x + y * GameWorld.numColumns;
  }

  checkSurrounding() {
    // Loop over all cells
    for (let x = 0; x < GameWorld.numColumns; x++) {
      for (let y = 0; y < GameWorld.numRows; y++) {
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

  checkPlayerIsAlive() {
    if (
      this.gamePlayer.alive &&
      this.isAlive(this.gamePlayer.gridX, this.gamePlayer.gridY) === 1
    ) {
      this.gamePlayer.alive = false;
      if (confirm(`You're dead! Restart?`)) {
        this.reset();
      }
    }
  }

  reset() {
    this.gamePlayer.alive = true;
    this.gamePlayer.gridX = Math.floor(GameWorld.numColumns / 2);
    this.gamePlayer.gridY = Math.floor(GameWorld.numRows / 2);
    this.gamePlayer.movingUp = false;
    this.gamePlayer.movingDown = false;
    this.gamePlayer.movingRight = false;
    this.gamePlayer.movingLeft = false;
    this.gamePlayer.pressedIYHK = false;
    this.gamePlayer.pressedNE = false;
    this.gamePlayer.pressedNW = false;
    this.gamePlayer.pressedSW = false;
    this.gamePlayer.pressedSE = false;
    this.gamePlayer.shootNE = false; // keeps track of whether the button for shooting a glider is pressed
    this.gamePlayer.shootNW = false;
    this.gamePlayer.shootSW = false;
    this.gamePlayer.shootSE = false;
    this.gamePlayer.gliderCoolTimeLeft = 0;
    for (let i = 0; i < this.gameObjects.length; i++) {
      this.gameObjects[i].alive = this.gameObjects[i].initiallyAlive;
    }
  }

  keyPressed(event) {
    if (event.defaultPrevented) {
      return; // Do nothing if event already handled
    }
    switch (event.code) {
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
        if (!this.gamePlayer.pressedIYHK) {
          this.gamePlayer.pressedNE = true;
          this.gamePlayer.pressedIYHK = true;
        }
        break;
      case "KeyY":
        if (!this.gamePlayer.pressedIYHK) {
          this.gamePlayer.pressedNW = true;
          this.gamePlayer.pressedIYHK = true;
        }
        break;
      case "KeyH":
        if (!this.gamePlayer.pressedIYHK) {
          this.gamePlayer.pressedSW = true;
          this.gamePlayer.pressedIYHK = true;
        }
        break;
      case "KeyK":
        if (!this.gamePlayer.pressedIYHK) {
          this.gamePlayer.pressedSE = true;
          this.gamePlayer.pressedIYHK = true;
        }
        break;
    }
    // Consume the event so it doesn't get handled twice
    event.preventDefault();
  }
  keyUnpressed(event) {
    if (event.defaultPrevented) {
      return; // Do nothing if event already handled
    }
    switch (event.code) {
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
        if (this.gamePlayer.pressedNE) {
          this.gamePlayer.pressedNE = false;
          this.gamePlayer.pressedIYHK = false;
        }
        break;
      case "KeyY":
        if (this.gamePlayer.pressedNW) {
          this.gamePlayer.pressedNW = false;
          this.gamePlayer.pressedIYHK = false;
        }
        break;
      case "KeyH":
        if (this.gamePlayer.pressedSW) {
          this.gamePlayer.pressedSW = false;
          this.gamePlayer.pressedIYHK = false;
        }
        break;
      case "KeyK":
        if (this.gamePlayer.pressedSE) {
          this.gamePlayer.pressedSE = false;
          this.gamePlayer.pressedIYHK = false;
        }
        break;
    }
    // Consume the event so it doesn't get handled twice
    event.preventDefault();
  }

  playerMovement() {
    if (!this.gamePlayer.alive) {
      return;
    }
    if (this.gamePlayer.movingDown) {
      this.gamePlayer.gridY = mod(this.gamePlayer.gridY + 1, GameWorld.numRows);
    }
    if (this.gamePlayer.movingUp) {
      this.gamePlayer.gridY = mod(this.gamePlayer.gridY - 1, GameWorld.numRows);
    }
    if (this.gamePlayer.movingLeft) {
      this.gamePlayer.gridX = mod(
        this.gamePlayer.gridX - 1,
        GameWorld.numColumns
      );
    }
    if (this.gamePlayer.movingRight) {
      this.gamePlayer.gridX = mod(
        this.gamePlayer.gridX + 1,
        GameWorld.numColumns
      );
    }
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
          mod(this.gamePlayer.gridX + 1, GameWorld.numColumns),
          mod(this.gamePlayer.gridY - 2, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX + 2, GameWorld.numColumns),
          mod(this.gamePlayer.gridY - 3, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX + 3, GameWorld.numColumns),
          mod(this.gamePlayer.gridY - 1, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX + 3, GameWorld.numColumns),
          mod(this.gamePlayer.gridY - 2, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX + 3, GameWorld.numColumns),
          mod(this.gamePlayer.gridY - 3, GameWorld.numRows)
        )
      ].alive = true;
    } else if (this.gamePlayer.shootNW) {
      this.gamePlayer.shootNW = false;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX - 1, GameWorld.numColumns),
          mod(this.gamePlayer.gridY - 3, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX - 2, GameWorld.numColumns),
          mod(this.gamePlayer.gridY - 1, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX - 2, GameWorld.numColumns),
          mod(this.gamePlayer.gridY - 3, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX - 3, GameWorld.numColumns),
          mod(this.gamePlayer.gridY - 2, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX - 3, GameWorld.numColumns),
          mod(this.gamePlayer.gridY - 3, GameWorld.numRows)
        )
      ].alive = true;
    } else if (this.gamePlayer.shootSW) {
      this.gamePlayer.shootSW = false;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX - 1, GameWorld.numColumns),
          mod(this.gamePlayer.gridY + 2, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX - 2, GameWorld.numColumns),
          mod(this.gamePlayer.gridY + 3, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX - 3, GameWorld.numColumns),
          mod(this.gamePlayer.gridY + 1, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX - 3, GameWorld.numColumns),
          mod(this.gamePlayer.gridY + 2, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX - 3, GameWorld.numColumns),
          mod(this.gamePlayer.gridY + 3, GameWorld.numRows)
        )
      ].alive = true;
    } else if (this.gamePlayer.shootSE) {
      this.gamePlayer.shootSE = false;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX + 1, GameWorld.numColumns),
          mod(this.gamePlayer.gridY + 3, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX + 2, GameWorld.numColumns),
          mod(this.gamePlayer.gridY + 1, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX + 2, GameWorld.numColumns),
          mod(this.gamePlayer.gridY + 3, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX + 3, GameWorld.numColumns),
          mod(this.gamePlayer.gridY + 2, GameWorld.numRows)
        )
      ].alive = true;
      this.gameObjects[
        this.gridToIndex(
          mod(this.gamePlayer.gridX + 3, GameWorld.numColumns),
          mod(this.gamePlayer.gridY + 3, GameWorld.numRows)
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

  draw() {
    for (let i = 0; i < this.gameObjects.length; i++) {
      this.context.fillStyle = this.gameObjects[i].alive
        ? "#595959"
        : "#f2f2f2";
      this.context.fillRect(
        mod(
          this.gameObjects[i].gridX -
            this.gamePlayer.gridX +
            Math.floor(GameWorld.numColumns / 2),
          GameWorld.numColumns
        ) * Cell.width,
        mod(
          this.gameObjects[i].gridY -
            this.gamePlayer.gridY +
            Math.floor(GameWorld.numRows / 2),
          GameWorld.numRows
        ) * Cell.height,
        Cell.width,
        Cell.height
      );
    }
    if (this.gamePlayer.alive) {
      this.context.fillStyle = "#33cc33";
      this.context.fillRect(
        Math.floor(GameWorld.numColumns / 2) * Player.width,
        Math.floor(GameWorld.numRows / 2) * Player.height,
        Player.width,
        Player.height
      );
    }
  }

  gameLoop() {
    // Check the surrounding of each cell
    this.checkSurrounding();

    this.playerMovement();

    this.gliderUpdate();
    this.updateCoolTime();

    this.checkPlayerIsAlive();

    // Clear the screen
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all the gameobjects
    // for (let i = 0; i < this.gameObjects.length; i++) {
    //   this.gameObjects[i].draw();
    // }
    // if (this.gamePlayer.alive) {
    //   this.gamePlayer.draw();
    // }
    this.draw();

    // The loop function has reached its end, keep requesting new frames
    setTimeout(() => {
      window.requestAnimationFrame(() => this.gameLoop());
    }, 40); // wait this number of milliseconds
  }
}

window.onload = () => {
  // The page has loaded, start the game
  let gameWorld = new GameWorld("myCanvas");
};
