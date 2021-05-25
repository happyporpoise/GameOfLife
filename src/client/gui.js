let myCanvas = document.getElementById('myCanvas');
let myContext = myCanvas.getContext("2d");
myCanvas.width = window.innerWidth;
myCanvas.height = window.innerHeight;

//let GUI_MODE="PLAIN";
//let GUI_MODE="PLAIN-NUT";
let GUI_MODE="SPACEDECAY"; //source from https://github.com/elliotwaite/rule-30-and-game-of-life
//let GUI_MODE="NONE";

//const CanvasColumns = -Math.floor(-myCanvas.width);
//const CanvasRows = -Math.floor(-myCanvas.rows);
const Cellwidth = 10;
const Cellheight = 10;
const Playerwidth = 10;
const Playerheight = 10;
const numColumns = 200;
const numRows = 100;


class colorBoard{
  

  constructor(){
    this.decay_counts=new Array(numRows*numColumns);
    for (let i = 0; i < this.decay_counts.length; i++){
      this.decay_counts[i]=0;
    }
    this.maxdecaycounts=0;
    this.color_list = [];
  }

  static hexToRgb (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  static rgbToHex(r,g,b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static colorMix(c1,c2,r){
    let [r1,g1,b1]=colorBoard.hexToRgb(c1);
    let [r2,g2,b2]=colorBoard.hexToRgb(c2);
    return colorBoard.rgbToHex(
      Math.floor(r1*(1-r)+r2*r),
      Math.floor(g1*(1-r)+g2*r),
      Math.floor(b1*(1-r)+b2*r));
  }  
  
  setDecayVars(){
    this.color_list = [];
    let decayColors = [
      '#711c91',
      '#ea00d9',
      '#0abdc6',
      '#133e7c',
      '#091833',
      '#000103'
    ];
    //let color_decay_times = [2 ,16, 16*8, 16*8*8, 16*8*8*8];
    let color_decay_times = [2 ,10, 16*3, 16*4*4, 16*4*4*4];
    //let color_decay_times = [2 ,10, 50, 550];
    this.color_list.push('#000000');
    
    for (let i = 0; i < color_decay_times.length-1; i++) {
      for (let j = 0; j < color_decay_times[i]; j++) {
        this.color_list.push(
          colorBoard.colorMix(
            decayColors[i],
            decayColors[i+1],
            j/color_decay_times[i]
        ));
      }
    }
        
    this.color_list.push("#00000000");
    this.color_list.reverse();
    this.maxdecaycounts=this.color_list.length;
    
    console.log(this.color_list);
    
    console.log(this.maxdecaycounts);

    console.log(this.decay_counts);
  }

  update(gameCells){
    for (let i = 0; i < this.decay_counts.length; i++) {
      if(gameCells[i].alive){
        this.decay_counts[i]=this.maxdecaycounts-1;
      } 
      else{
        this.decay_counts[i]=Math.max(this.decay_counts[i]-1,0);
      }
    }
  }
}

const cb=new colorBoard();

function setupVar(GUI_MODE){
  if(GUI_MODE=="SPACEDECAY"){
    console.log("DECAY");
    cb.setDecayVars();
  }
}
setupVar(GUI_MODE);

const guiModeCode={1:"PLAIN",2:"PLAIN-NUT",3:"SPACEDECAY",4:"NONE"};
function changeMode(code){
  GUI_MODE=guiModeCode[code];
  setupVar(GUI_MODE);
}


function mod(n, m) {
    return ((n % m) + m) % m;
}

function drawPixel(tag,x,y){

  newx=mod(x+Math.floor(numColumns / 2),numColumns) * Cellwidth;
  newy=mod(y+Math.floor(numRows / 2),numRows) * Cellheight;
  
  switch (GUI_MODE){

    case "PLAIN":
      switch (tag) {
      case "cellAlive":
        myContext.drawImage(imgs["cellon.png"],newx -1,newy -1);
        break;
      case "cellDead":
        break;
      case "player":
        myContext.drawImage(imgs["player.png"],newx -1,newy -1);
        break;
      }
      break;

    case "PLAIN-NUT":
      switch (tag) {
      case "cellAlive":
      case "cellDead":
        myContext.fillStyle = (tag=="cellAlive")
         ? "#595959"
          : "#f2f2f2";
        myContext.fillRect(
          newx,newy,
          Cellwidth,Cellheight
        );
        break;
      case "player":
        myContext.fillStyle = "#33cc33";
        myContext.fillRect(
          newx,newy,
          Playerwidth,Playerheight
        );
      }
      break;

      case "SPACEDECAY":
        switch (tag) {
          case "player":
            myContext.fillStyle = "#33cc33";
            myContext.fillRect(
              newx,newy,
              Playerwidth,Playerheight
            );
            break;
          default:
            myContext.fillStyle = "#"+tag.split('#')[1];
            myContext.fillRect(
              newx,newy,
              Cellwidth,Cellheight
            );
            break;
          
        }
        break;
  }
}

let cnts=0;

function draw(gameCells, gamePlayer) {

  if(GUI_MODE=="PLAIN"){
    myContext.fillStyle="#595959";
    myContext.fillRect(0, 0, myCanvas.width, myCanvas.height);
  }
  else if(GUI_MODE=="SPACEDECAY"){
    myContext.fillStyle="#000000";
    myContext.fillRect(0, 0, myCanvas.width, myCanvas.height);
    cb.update(gameCells)
  }
  else{
    myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
  }

  gameCells.forEach(element => {
    drawPixel((element.alive ? "cellAlive" : "cellDead")
      + ((GUI_MODE=="SPACEDECAY") ? cb.color_list[cb.decay_counts[element.gridX + element.gridY * numColumns]] : ""),
      element.gridX-gamePlayer.gridX,
      element.gridY-gamePlayer.gridY
    );
  });

  if (gamePlayer.alive) drawPixel("player",0,0) ;


  if(cnts==0){
    console.log(cb.decay_counts);
    cnts+=1;
  }
}
