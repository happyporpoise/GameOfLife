const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

console.log(__dirname);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/client/html/index2.html');
});

// io.on('connection', (socket) => {
//   socket.on('chat message', msg => {
//     io.emit('chat message', msg);
//   });
// });

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

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
   }
}

class Game {
  static numColumns = 150;
  static numRows = 75;
  constructor() {
    this.sockets = {};
    this.players = {};
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;

    this.gameObjects = []; // array of Cells
    this.createGrid();
    
    setInterval(this.update.bind(this), 1000 / 10);
  }

  update () {
    // io.emit('chat message', "This is a useless message :)");
    this.checkSurrounding();
    io.emit('draw', this.gameObjects);
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
}

const game = new Game();