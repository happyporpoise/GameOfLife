"use strict";

//import { cellsAtPosition } from './Library.js';
const ggllib = require("./Library.js");
const botlib = require("./Bot.js");

const fs = require("fs");
const { timeStamp } = require("console");
let ranking = JSON.parse(
  fs.readFileSync(
    "ranking.json",
    { encoding: "utf8", flag: "r" },
    (err, data) => {
      if (err) return console.log(err);
    }
  )
);

function insertRanking(type, name, time) {
  let i;
  for (i = 0; i < ranking[type].length; i++) {
    if (time < ranking[type][i].time) {
      break;
    }
  }
  ranking[type].splice(i, 0, {
    name: name,
    time: time,
  });
  //ranking[type] = ranking[type].slice(0, 100);
  return i;
}
function saveRanking(filename) {
  fs.writeFile(filename, JSON.stringify(ranking, null, "\t"), function (err) {
    if (err) return console.log(err);
    console.log(filename + " saved");
    console.log(JSON.stringify(ranking));
  });
}

let ffaRanking = [];

function mod(n, m) {
  return ((n % m) + m) % m;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function logDataSize(obj){
  let total_bytes=0;
  Object.keys(obj).forEach(key => {
    let dat = obj[key];
    dat = (typeof(dat)=='object' && 'byteLength' in dat) ? dat.byteLength : JSON.stringify(dat).length;
    console.log(`${key} : ${dat}`);
    total_bytes+=dat;
  })
  console.log(`TOTAL ====== ${total_bytes}`);
}

const keyboardMsgs = [
  "movingDown",
  "movingDown",
  "movingUp",
  "movingUp",
  "movingLeft",
  "movingLeft",
  "movingRight",
  "movingRight",
  "pressedNE",
  "pressedNE",
  "pressedNW",
  "pressedNW",
  "pressedSW",
  "pressedSW",
  "pressedSE",
  "pressedSE",
];

class Cell {
  constructor(gridX, gridY) {
    // Store the position of this cell in the grid
    this.gridX = gridX;
    this.gridY = gridY;
    // this.owner = "";

    // this.alive = false; // 0.9;
    this.state = 0; // 0 means dead, 1 means alive neutral, n >= 2 means alive but owned by the player with identifier n.
  }
}

class Player {
  static width = 10;
  static height = 10;
  static gliderCoolTime = 16; // number of generations
  constructor(gridX, gridY, name, identifier) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.name = name;
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
    this.initTime = 0;
    this.age = 0;
    // this.color = "#"+Math.floor(Math.random()*16777215).toString(16);
    this.color = `hsl(${Math.floor(Math.random() * 360)},${Math.floor(
      50 + Math.random() * 30
    )}%,${Math.floor(33 + Math.random() * 33)}%)`;
    this.identifier = identifier; // This a unique integer assigned to each player 2~2**game.LOG2MAXID (0 and 1 reserved for dead cell and alive neutral)
  }
}

class Game {
  constructor(_io, groupName, gameMode, numColumns, numRows) {
    this.self = this;
    this.numColumns = numColumns;
    this.numRows = numRows;

    this.mapClear = false;

    //gameMode is a literally game mode(eg SINGLE:12) and groupName is the chat room id for the io
    this.groupName = groupName;
    this.gameMode = gameMode;
    this.gametime = 0;
    this.io = _io;
    this.sockets = {};
    this.players = {};
    this.towerids = ["RandomBot1", "RandomBot2", "RandomBot3"];
    // this.smartBotIDs = ["Dodger (Bot)", "Follower (Bot)", "Hunter (Bot)"];
    this.smartBotIDs = ["Dodger (Bot)", "Hunter (Bot)"];

    // this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;

    this.gameObjects = []; // array of Cells
    this.createGrid(gameMode, numColumns, numRows);

    // this.buffer = new ArrayBuffer(
    //   -Math.floor((-this.numColumns * this.numRows) / 32) * 4
    // );
    // this.bufferView = new Uint32Array(this.buffer);
    this.LOG2MAXID = 8; // or 16 32
    this.UintNArray = Uint8Array; // or Uint16Array Uint32Array
    this.buffer = new ArrayBuffer(
      this.numColumns * this.numRows * ( this.LOG2MAXID / 8 )
    );
    this.bufferView = new this.UintNArray(this.buffer);
    
    this.smartBotUpdate = botlib.smartBotUpdate.bind(this);

    // ***** dont forget to clear this interval when you delete the game object *****
    this.interval = setInterval(this.update.bind(this), 1000 / 10);
  }

  update() {
    this.gametime++;
    // io.emit('chat message', "This is a useless message :)");
    this.checkSurrounding();
    this.playerMovement();
    this.gliderUpdate();
    if (this.groupName == "FFA") {
      this.towerUpdate();
      this.smartBotUpdate();
    }
    if (this.gameMode[0] == "SINGLE" && this.gameMode[1] == "2") {
      this.smartBotUpdate();
    }
    this.updateCoolTime();
    this.encodeBytes();
    // this.io.emit('draw',this.gametime, this.buffer,this.getPlayerPos());
    
    const res_packet = {
      t: Date.now(),
      gametime: this.gametime,
      buffer: this.buffer,
      playerNamePosAndColor: this.getPlayerNamePosAndColor(),
      colorList: this.getIdentifierColorFunction(),
    };

    // const res_packet = {
    //   t: Date.now(),
    //   gametime: this.gametime,
    //   buffer: this.buffer,
    //   // playerPos: this.getPlayerPos(),
    //   // playerColor: this.getPlayerColor(),
    //   playerNamePosAndColor: this.getPlayerNamePosAndColor(),
    //   stateList: this.getStateList(),
    //   colorList: this.getIdentifierColorFunction_old(),
    // };

    //logDataSize(res_packet)
    this.io.to(this.groupName).emit("gameUpdate", res_packet);
    
    if (this.groupName == "FFA") {
      this.FFARankingUpdate();
      this.io.to(this.groupName).emit("drawScoreBoard", ffaRanking);
    }
    this.checkPlayerIsAlive();
  }

  createGrid(gameMode, numColumns, numRows) {
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numColumns; x++) {
        this.gameObjects.push(new Cell(x, y));
      }
    }
    if (gameMode[0] != "SINGLE") {
      return;
    }
    ggllib.setSingleLevel[gameMode[1]](this);
  }

  isAlive(x, y) {
    return this.gridToObj(x, y).state > 0;
  }
  stateOf(x, y) {
    return this.gridToObj(x, y).state;
  }

  gridToIndex(x, y) {
    return x + y * this.numColumns;
  }

  gridToObj(x, y) {
    return this.gameObjects[
      mod(x, this.numColumns) + mod(y, this.numRows) * this.numColumns
    ];
  }

  checkSurrounding() {
    // Loop over all cells
    for (let x = 0; x < this.numColumns; x++) {
      for (let y = 0; y < this.numRows; y++) {
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
        let centerObj = this.gridToObj(x, y);
        let aliveNeighbors = [];
        if (this.isAlive(x - 1, y - 1)) {
          aliveNeighbors.push([-1, -1]);
        }
        if (this.isAlive(x, y - 1)) {
          aliveNeighbors.push([0, -1]);
        }
        if (this.isAlive(x + 1, y - 1)) {
          aliveNeighbors.push([1, -1]);
        }
        if (this.isAlive(x - 1, y)) {
          aliveNeighbors.push([-1, 0]);
        }
        if (this.isAlive(x + 1, y)) {
          aliveNeighbors.push([1, 0]);
        }
        if (this.isAlive(x - 1, y + 1)) {
          aliveNeighbors.push([-1, 1]);
        }
        if (this.isAlive(x, y + 1)) {
          aliveNeighbors.push([0, 1]);
        }
        if (this.isAlive(x + 1, y + 1)) {
          aliveNeighbors.push([1, 1]);
        }

        if (numAlive == 2) {
          // Do nothing
          if (centerObj.state > 0) {
            if (
              this.gridToObj(x + aliveNeighbors[0][0], y + aliveNeighbors[0][1])
                .state ==
              this.gridToObj(x + aliveNeighbors[1][0], y + aliveNeighbors[1][1])
                .state
            ) {
              centerObj.nextState = this.gridToObj(
                x + aliveNeighbors[0][0],
                y + aliveNeighbors[0][1]
              ).state;
            } else if (this.gridToObj(x + aliveNeighbors[0][0], y + aliveNeighbors[0][1])
            .state == 1) {
              centerObj.nextState = this.gridToObj(x + aliveNeighbors[1][0], y + aliveNeighbors[1][1])
              .state;
            } else if (this.gridToObj(x + aliveNeighbors[1][0], y + aliveNeighbors[1][1])
            .state == 1) {
              centerObj.nextState = this.gridToObj(x + aliveNeighbors[0][0], y + aliveNeighbors[0][1])
              .state;
            } else {
              centerObj.nextState = 1;
            }
          }
        } else if (numAlive == 3) {
          // Make alive
          if (
            this.gridToObj(x + aliveNeighbors[0][0], y + aliveNeighbors[0][1])
              .state ==
              this.gridToObj(x + aliveNeighbors[1][0], y + aliveNeighbors[1][1])
                .state ||
            this.gridToObj(x + aliveNeighbors[0][0], y + aliveNeighbors[0][1])
              .state ==
              this.gridToObj(x + aliveNeighbors[2][0], y + aliveNeighbors[2][1])
                .state
          ) {
            centerObj.nextState = this.gridToObj(
              x + aliveNeighbors[0][0],
              y + aliveNeighbors[0][1]
            ).state;
          } else if (
            this.gridToObj(x + aliveNeighbors[1][0], y + aliveNeighbors[1][1])
              .state ==
            this.gridToObj(x + aliveNeighbors[2][0], y + aliveNeighbors[2][1])
              .state
          ) {
            centerObj.nextState = this.gridToObj(
              x + aliveNeighbors[1][0],
              y + aliveNeighbors[1][1]
            ).state;
          } else {
            centerObj.nextState = 1;
          }
        } else {
          // Make dead
          centerObj.nextState = 0;
        }
      }
    }

    // Apply the new state to the cells
    for (let i = 0; i < this.gameObjects.length; i++) {
      this.gameObjects[i].state = this.gameObjects[i].nextState;
    }

    if (this.gameMode[0] == "SINGLE") {
      if (this.gameMode[1] == "2") {
        this.mapClear = false;
        if (!("Hunter (Bot)" in this.players)) {
          this.mapClear = true;
        }
      } else {
        this.mapClear = true;
        for (let i = 0; i < this.gameObjects.length; i++) {
          if (this.gameObjects[i].state > 0) {
            this.mapClear = false;
            return;
          }
        }
      }
    }
  }

  keyboardInput(id, eventcode, isPressed) {
    if (eventcode[0] == "m") {
      this.players[id][eventcode] = isPressed;
    } else {
      if (isPressed ^ this.players[id].pressedIYHK) {
        this.players[id][eventcode] = isPressed;
        this.players[id].pressedIYHK = isPressed;
      }
    }
  }

  playerMovement() {
    Object.keys(this.players).forEach((id) => {
      if (!this.players[id].alive) {
        return;
      }
      if (this.players[id].movingDown) {
        this.players[id].gridY = mod(this.players[id].gridY + 1, this.numRows);
      }
      if (this.players[id].movingUp) {
        this.players[id].gridY = mod(this.players[id].gridY - 1, this.numRows);
      }
      if (this.players[id].movingLeft) {
        this.players[id].gridX = mod(
          this.players[id].gridX - 1,
          this.numColumns
        );
      }
      if (this.players[id].movingRight) {
        this.players[id].gridX = mod(
          this.players[id].gridX + 1,
          this.numColumns
        );
      }
    });
  }

  checkPlayerIsAlive() {
    if (this.mapClear && this.gameMode[0] == "SINGLE") {
      let i = insertRanking(
        this.gameMode[1],
        this.players[this.groupName].name,
        this.gametime
      );
      saveRanking("ranking.json");
      this.io
        .to(this.groupName)
        .emit("drawScoreBoard", ranking[this.gameMode[1]].slice(0, 15));
      this.io.to(this.groupName).emit("gameClear", i, this.gametime);
      delete this.players[this.groupName];
    }

    Object.keys(this.players).forEach((socketid) => {
      let stateOfTheCell = this.stateOf(
        this.players[socketid].gridX,
        this.players[socketid].gridY
      );
      let ownerOfTheCell = "";
      if (
        this.players[socketid].alive &&
        this.isAlive(
          this.players[socketid].gridX,
          this.players[socketid].gridY
        ) &&
        stateOfTheCell != this.players[socketid].identifier
      ) {
        for (let i = 0; i < this.gameObjects.length; i++) {
          if (this.gameObjects[i].state == this.players[socketid].identifier) {
            this.gameObjects[i].state = stateOfTheCell > 1
              ? stateOfTheCell
              : 1;
          }
        }
        if (stateOfTheCell > 1) {
          Object.keys(this.players).every((key) => {
            if (stateOfTheCell == this.players[key].identifier) {
              this.players[key].initTime -=
              this.players[socketid].age / 2;
              ownerOfTheCell = this.players[key].name;
              return false;
            }
            return true;
          });
        }
        if (
          !this.smartBotIDs.includes(socketid) &&
          !this.towerids.includes(socketid)
        ) {
          if (
            this.gameMode == "FFA" &&
            ffaRanking[0].name == this.players[socketid].name
          ) {
            let i = insertRanking(
              "FFA",
              this.players[socketid].name,
              -this.players[socketid].age
            );
            saveRanking("ranking.json");
            this.io
              .to(socketid)
              .emit("gameClear", i, this.players[socketid].age);
          } else {
            this.io.to(socketid).emit("dead", ownerOfTheCell);
          }
        }
        delete this.players[socketid];
      }
    });
  }

  shootAGlider() {
    Object.keys(this.players).forEach((id) => {
      if (this.players[id].gliderCoolTimeLeft === 0) {
        if (this.players[id].pressedNE) {
          this.players[id].shootNE = true;
          this.players[id].gliderCoolTimeLeft = Player.gliderCoolTime;
          return;
        } else if (this.players[id].pressedNW) {
          this.players[id].shootNW = true;
          this.players[id].gliderCoolTimeLeft = Player.gliderCoolTime;
        } else if (this.players[id].pressedSW) {
          this.players[id].shootSW = true;
          this.players[id].gliderCoolTimeLeft = Player.gliderCoolTime;
        } else if (this.players[id].pressedSE) {
          this.players[id].shootSE = true;
          this.players[id].gliderCoolTimeLeft = Player.gliderCoolTime;
        }
      }
    });
  }

  towerUpdate() {
    this.towerids.forEach((id) => {
      if (!(id in this.players)) {
        this.addPlayer(id, id);
      }
      this.keyboardInput(
        id,
        ggllib.randomChoice(keyboardMsgs),
        Math.random() > 0.5
      );
    });
  }

  numNearbyAlive(x, y) {
    return (
      this.isAlive(x - 1, y - 1) +
      this.isAlive(x, y - 1) +
      this.isAlive(x + 1, y - 1) +
      this.isAlive(x - 1, y) +
      this.isAlive(x + 1, y) +
      this.isAlive(x - 1, y + 1) +
      this.isAlive(x, y + 1) +
      this.isAlive(x + 1, y + 1)
    );
  }

  // smartBotUpdate() {
  // }

  FFARankingUpdate() {
    ffaRanking = [];
    Object.keys(this.players).forEach((id) => {
      this.players[id].age = this.gametime - this.players[id].initTime;
      ffaRanking.push({
        name: this.players[id].name,
        time: this.players[id].age,
        color: this.players[id].color,
      });
    });
    ffaRanking.sort(function (a, b) {
      return b.time - a.time;
    });
  }

  gliderUpdate() {
    Object.keys(this.players).forEach((id) => {
      if (!this.players[id].alive) {
        return;
      }
      this.shootAGlider();
      let didntshoot = true;
      Array("shootNE", "shootNW", "shootSW", "shootSE").forEach((direction) => {
        if (didntshoot && this.players[id][direction]) {
          this.players[id][direction] = false;
          ggllib.putShape(
            this.self,
            ggllib.shootCompiled[direction],
            this.players[id].gridX,
            this.players[id].gridY,
            this.players[id].identifier
          );
          didntshoot = false;
        }
      });
    });
  }

  updateCoolTime() {
    Object.keys(this.players).forEach((id) => {
      this.players[id].gliderCoolTimeLeft = Math.max(
        0,
        this.players[id].gliderCoolTimeLeft - 1
      );
    });
  }

  addPlayer(socketid, name) {
    if (
      this.gameMode[0] == "SINGLE" &&
      !this.smartBotIDs.includes(name) &&
      !this.towerids.includes(name)
    ) {
      this.players[socketid] = new Player(0, 0, name, 0);
      this.players[socketid].initTime = this.gametime;
      this.io
        .to(this.groupName)
        .emit("drawScoreBoard", ranking[this.gameMode[1]].slice(0, 10));
      if (this.gameMode[1] == "0") {
        this.players["indicator1"] = new Player(2, -2, "SE");
        this.players["indicator2"] = new Player(19, 5, "NW");
        this.players["indicator3"] = new Player(27, 2, "NE");
        this.players["indicator4"] = new Player(46, 5, "NW");
        this.players["indicator5"] = new Player(81, 1, "SW");
        this.players["indicator6"] = new Player(102, 6, "NE");
        this.players["indicator7"] = new Player(117, 9, "NE");
      }
      if (this.gameMode[1] == "2") {
        this.smartBotIDs = ["Hunter (Bot)"];
        this.addPlayer("Hunter (Bot)", "Hunter (Bot)", 1);
      }
    } else {
      let randCell =
        this.gameObjects[Math.floor(this.gameObjects.length * Math.random())];
      if (randCell.state == 0) {
        let identifier = 0;
        let identifierAvailable = false;
        while (!identifierAvailable) {
          identifierAvailable = true;
          identifier = getRandomInt(2**this.LOG2MAXID - 2) + 2; // Change this part depending on the maximum number of players we allow
          Object.keys(this.players).every((key) => {
            if (this.players[key].identifier == identifier) {
              identifierAvailable = false;
              return false;
            }
            return true;
          });
        }
        this.players[socketid] = new Player(
          randCell.gridX,
          randCell.gridY,
          name, identifier
        );
        //console.log(`Player name:${this.players[socketid].name}, identifier: ${this.players[socketid].identifier}`);
        this.players[socketid].initTime = this.gametime;
      } else {
        this.addPlayer(socketid, name);
      }
    }
  }

  encodeBytes() {
    //Use TypedArrays to work with byte data.
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
    //signed 32 bits(8bytes) integer for the viewer
    this.gameObjects.forEach((d,i) =>{
      this.bufferView[i]=d.state;
    })
  }

  // encodeBytes_old() {
  //   let uint32num = 0;
  //   for (let i = 0; i < this.gameObjects.length; i++) {
  //     uint32num += (this.gameObjects[i].state>0) << i % 32;
  //     if (i % 32 == 31) {
  //       this.bufferView[i >> 5] = uint32num;
  //       uint32num = 0;
  //     }
  //   }
  //   if (this.gameObjects.length % 32 != 0) {
  //     this.bufferView[this.gameObjects.length >> 5] = uint32num;
  //   }
  // }

  getPlayerPos() {
    let pos = {};
    Object.keys(this.players).forEach((key) => {
      pos[key] = {
        gridX: this.players[key].gridX,
        gridY: this.players[key].gridY,
      };
    });
    return pos;
  }

  getPlayerColor() {
    let col = {};
    Object.keys(this.players).forEach((key) => {
      col[key] = this.players[key].color;
    });
    return col;
  }

  getPlayerNamePosAndColor() {
    let namePosAndCol = {};
    Object.keys(this.players).forEach((key) => {
      namePosAndCol[key] = {
        name: this.players[key].name,
        gridX: this.players[key].gridX,
        gridY: this.players[key].gridY,
        color: this.players[key].color,
      };
    });
    return namePosAndCol;
  }

  getStateList() { // list of integers representing the states of the cells; needs to be combined with encodeBytes()
    let stateList = [];
    for (let i = 0; i < this.gameObjects.length; i++) {
      stateList.push(this.gameObjects[i].state);
    }
    return stateList;
  }

  getIdentifierColorFunction() { // returns a list where the n-th entry is the color of the player with identifier n. 
    let colorList={};
    Object.keys(this.players).forEach((key) => {
      colorList[this.players[key].identifier] = this.players[key].color; 
    });
    return colorList;
  }

  getIdentifierColorFunction_old() { // returns a list where the n-th entry is the color of the player with identifier n. 
    let colorList = new Array(2**this.LOG2MAXID);
    Object.keys(this.players).forEach((key) => {
      colorList[this.players[key].identifier] = this.players[key].color; 
    });
    return colorList;
  }
}

module.exports = Game;
