//const { numRows } = require("../../GameOfLife");

let myCanvas = document.getElementById("myCanvas");
let myContext = myCanvas.getContext("2d");
myCanvas.width = window.innerWidth;
myCanvas.height = window.innerHeight;
let xcenter = myCanvas.width / 2;
let ycenter = myCanvas.height / 2;

//let GUI_MODE="PLAIN";
let GUI_MODE="PLAIN-NUT";
//let GUI_MODE = "SPACEDECAY";
//let GUI_MODE="NONE";

//const CanvasColumns = -Math.floor(-myCanvas.width);
//const CanvasRows = -Math.floor(-myCanvas.rows);
const Cellwidth = 15;
const Cellheight = 15;
const Playerwidth = 15;
const Playerheight = 15;

function mod(n, m) {
  return ((n % m) + m) % m;
}

class colorBoard {
  constructor(numColumns,numRows) {
    this.numColumns=numColumns;
    this.numRows=numRows; 

    this.cellAlive = new Array(-Math.floor((-numColumns * numRows) / 32) * 32);

    this.gridX = new Array(numColumns * numRows);
    this.gridY = new Array(numColumns * numRows);
    for (let i = 0; i < numColumns * numRows; i++) {
      this.gridX[i] = i % numColumns;
      this.gridY[i] = Math.floor(i / numColumns);
    }

    this.decay_counts = new Array(numRows * numColumns);

    this.maxDecay = 0;
    this.color_list = [];
    console.log(this);
  }

  static hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : null;
  }

  static rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static colorBlend(c1, c2, r) {
    let [r1, g1, b1] = colorBoard.hexToRgb(c1);
    let [r2, g2, b2] = colorBoard.hexToRgb(c2);
    return colorBoard.rgbToHex(
      Math.floor(r1 * (1 - r) + r2 * r),
      Math.floor(g1 * (1 - r) + g2 * r),
      Math.floor(b1 * (1 - r) + b2 * r)
    );
  }

  static colorScheme = {
    TACHYON: [
      ["#000000", NaN],
      ["#baeaf5", 3*12],
      ["#5fc6ff", 5*12],
      ["#E76583", 20*12],
      ["#44008b", 40*12],
      ["#123067", 40*12],
      ["#13076f", 50*12],
      ["#13174f", 100*12],
      ["#281232", 190*12],
      ["#20080e", 90*12],
    ],

    TERRAIN: [
      ["#034077", NaN],
      ["#7e2812", 3*12],
      ["#eeb46f", 10*12],
      ["#f3dcb5", 16 * 5*12],
      ["#2da9cd", 16 * 8*12],
      ["#269dc7", 16 * 4 * 8 * 2*12],
    ],
  };

  setDecayVars(themeType = "TACHYON") {
    //Read colorScheme
    let decayColors = [];
    let decayTimes = [];
    colorBoard.colorScheme[themeType].forEach((el) => {
      decayColors.push(el[0]);
      decayTimes.push(el[1]);
    });
    let liveColor = decayColors[0];
    decayColors.push(liveColor);

    //Init canvas background
    myContext.fillStyle = colorBoard.colorBlend(liveColor, "#ffffff", 0.1);
    myContext.fillRect(0, 0, myCanvas.width, myCanvas.height);

    //Generate color_list
    this.color_list = [liveColor];
    for (let i = 1; i < decayTimes.length; i++) {
      for (let j = 0; j < decayTimes[i]; j++) {
        this.color_list.push(
          colorBoard.colorBlend(
            decayColors[i],
            decayColors[i + 1],
            j / decayTimes[i]
          )
        );
      }
    }
    this.color_list.push(liveColor);
    //Set maxDecay
    let newmax = this.color_list.length - 1;
    for (let i = 0; i < this.decay_counts.length; i++) {
      if (this.decay_counts[i] == this.maxDecay) {
        this.decay_counts[i] = newmax;
      } else {
        this.decay_counts[i] = Math.floor(newmax / 2);
      }
    }
    this.maxDecay = newmax;
  }

  displayColorBar() {
    //Display decayColors and color_list
    let yoffset = numRows + 2;
    for (let i = 0; i < decayColors.length; i++) {
      myContext.fillStyle = decayColors[i];
      myContext.fillRect(
        2 * i * Cellwidth,
        yoffset * Cellheight,
        2 * Cellwidth,
        2 * Cellheight
      );
    }
    yoffset += 3;
    for (let i = 0; i < this.color_list.length; i++) {
      myContext.fillStyle = this.color_list[i];
      let [x, y] = [i % this.numColumns, Math.floor(i / this.numColumns)];
      myContext.fillRect(
        x * Cellwidth,
        (yoffset + y) * Cellheight,
        Cellwidth,
        Cellheight
      );
    }
  }

  drawPixel(tag, x, y) {
    let newx = mod(x +Math.floor(this.numColumns / 2), this.numColumns) * Cellwidth
                +Math.floor(myCanvas.width/2-this.numColumns / 2* Cellwidth);
    let newy = mod(y +Math.floor(this.numRows / 2), this.numRows) * Cellheight
                +Math.floor(myCanvas.height/2-this.numRows / 2* Cellheight);

    switch (GUI_MODE) {
      case "PLAIN":
        switch (tag) {
          case "cellAlive":
            myContext.drawImage(imgs["cellon.png"], newx - 1, newy - 1);
            break;
          case "cellDead":
            break;
          case "player":
            myContext.drawImage(imgs["player.png"], newx - 1, newy - 1);
            break;
        }
        break;

      case "PLAIN-NUT":
        switch (tag) {
          case "cellAlive":
          case "cellDead":
            myContext.fillStyle = tag == "cellAlive" ? "#595959" : "#f2f2f2";
            myContext.fillRect(newx, newy, Cellwidth, Cellheight);
            break;
          case "player":
            myContext.fillStyle = "#33cc33";
            myContext.fillRect(newx, newy, Playerwidth, Playerheight);
        }
        break;

      case "SPACEDECAY":
        switch (tag) {
          case "player":
            myContext.fillStyle = "#33cc33";
            myContext.fillRect(newx, newy, Playerwidth, Playerheight);
            break;
          default:
            myContext.fillStyle = "#" + tag.split("#")[1];
            myContext.fillRect(newx, newy, Cellwidth, Cellheight);
            break;
        }
        break;
    }
  }
}

function setupVar(_GUI_MODE){
  let codeparse = _GUI_MODE.split(":");
    GUI_MODE = codeparse.shift();
    if (GUI_MODE == "SPACEDECAY") {
      codeparse.length > 0 ? window.cb.setDecayVars(codeparse[0]) : window.cb.setDecayVars();
    }
}

let gamePlayer = { gridX: 0, gridY: 0 };

//let buffer= new ArrayBuffer(-Math.floor(-Game.numColumns*Game.numRows/32)*4);
//let bufferView= new Int32Array(this.buffer);

//

function decodeBytes(buffer, cb) {
  //Use TypedArrays to work with byte data.
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
  //unsigned 32 bits(8bytes) integer for the viewer
  const bits = 32;
  let bufferView = new Uint32Array(buffer);
  let uint32num = 0;
  for (let i = 0; i < bufferView.length; i++) {
    uint32num = bufferView[i];
    for (let j = 0; j < bits; j++) {
      cb.cellAlive[i * bits + j] =
        ((uint32num >>> j) << (bits - 1)) >>> (bits - 1);
    }
  }
}

let initTime = 0;

function drawScoreBoard(ranking){
  const btngroup=document.getElementById("btn-group");
  const numChildren=btngroup.children.length;
  for (let i = 1; i < numChildren; i++) {
    btngroup.removeChild(btngroup.children[btngroup.children.length-1]);
  }

  for (let i = 0; i < ranking.length; i++) {  
    let newbutton=document.createElement('button');
    btngroup.appendChild(newbutton);
    newbutton.textContent="#"+(i+1) +"\t"+ranking[i].name+"\t"+(ranking[i].time/10).toFixed(1)+"s";
  }

}

function draw(id, _gametime, buffer, playerPos){
    myCanvas.width = window.innerWidth;
    myCanvas.height = window.innerHeight;
    myContext.fillStyle = "#000000";
    myContext.fillRect(0, 0, myCanvas.width, myCanvas.height);

    if (initTime == 0) initTime = _gametime;

    
    document.getElementById("clock1").textContent =
      "Time:\t" + ((_gametime-initTime)/10).toFixed(1) + "s";

    decodeBytes(buffer, window.cb);

    if (id in playerPos) {
      gamePlayer = playerPos[id];
    }
    if (GUI_MODE == "PLAIN") {
      myContext.fillStyle = "#595959";
      myContext.fillRect(0, 0, myCanvas.width, myCanvas.height);
    } else if (GUI_MODE == "SPACEDECAY") {
      update();
    } else {
      myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    }

    for (let i = 0; i < window.cb.numRows * window.cb.numColumns; i++) {
      window.cb.drawPixel(
        (cb.cellAlive[i] ? "cellAlive" : "cellDead") +
          (GUI_MODE == "SPACEDECAY"
            ? window.cb.color_list[
                window.cb.decay_counts[window.cb.gridX[i] + window.cb.gridY[i] * window.cb.numColumns]
              ]
            : ""),
        window.cb.gridX[i] - gamePlayer.gridX,
        window.cb.gridY[i] - gamePlayer.gridY
      );
    }

    Object.keys(playerPos).forEach((_id) => {
      window.cb.drawPixel(
        "player",
        playerPos[_id].gridX - gamePlayer.gridX,
        playerPos[_id].gridY - gamePlayer.gridY
      );
    });

    //if (gamePlayer.alive) cb.drawPixel("myplayer",0,0) ;
}

function update() {
  for (let i = 0; i < window.cb.decay_counts.length; i++) {
    if (window.cb.cellAlive[i]) {
      window.cb.decay_counts[i] = 0;
    } else {
      window.cb.decay_counts[i] = Math.min(window.cb.decay_counts[i] + 1, window.cb.maxDecay);
    }
  }
}

function render(){
  const currentState = getCurrentState();
  if ('gametime' in currentState) {
    draw(window.user.socketid,currentState.gametime, currentState.buffer, currentState.playerPos);
  }
}
    

function startRendering() {
  const renderInterval = setInterval(render, 1000 / 60);
}
